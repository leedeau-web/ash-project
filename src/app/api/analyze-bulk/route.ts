// src/app/api/analyze-bulk/route.ts
// ASH Project — Bulk Article Comment Analyzer

import { NextRequest, NextResponse } from 'next/server';

interface Comment {
  author: string;
  content: string;
  likes: number;
  dislikes: number;
  date: string;
}

interface ArticleInput {
  title: string;
  site: string;
  siteName: string;
  url?: string;
  comments: Comment[];
}

interface ClaudeResult {
  positiveRatio: number;
  negativeRatio: number;
  topPositiveComments: { content: string; likes: number; articleIndex: number }[];
  topNegativeComments: { content: string; likes: number; articleIndex: number }[];
  topPositiveWords: string[];
  topNegativeWords: string[];
  articleSummaries: { articleIndex: number; positiveRatio: number; negativeRatio: number }[];
}

export async function POST(req: NextRequest) {
  try {
    const { articles } = await req.json() as { articles: ArticleInput[] };
    if (!articles?.length) return NextResponse.json({ error: '기사가 없습니다.' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');

    const articleCount = articles.length;
    const totalCommentCount = articles.reduce((sum, a) => sum + a.comments.length, 0);

    // Per-article sample limit: total ~400 comments
    const perLimit = Math.max(20, Math.min(80, Math.floor(400 / articleCount)));

    const articleListText = articles
      .map((a, i) => `[기사${i + 1}] ${a.siteName} — "${a.title}" (전체 ${a.comments.length}개)`)
      .join('\n');

    const commentLines: string[] = [];
    for (let i = 0; i < articles.length; i++) {
      const sampled = [...articles[i].comments].sort((a, b) => b.likes - a.likes).slice(0, perLimit);
      for (let j = 0; j < sampled.length; j++) {
        commentLines.push(`[기사${i + 1}][${j + 1}] ${sampled[j].content} (추천: ${sampled[j].likes})`);
      }
    }

    const sampledTotal = commentLines.length;
    const summaryTemplate = articles
      .map((_, i) =>
        `    {"articleIndex": ${i + 1}, "positiveRatio": (기사${i + 1} 긍정%, 정수), "negativeRatio": (기사${i + 1} 부정%, 정수, 합계=100)}`
      )
      .join(',\n');

    const prompt = `다음은 ${articleCount}개 기사의 독자 댓글 합계 ${totalCommentCount}개 중 ${sampledTotal}개(기사별 추천순 상위)입니다. 정확히 아래 JSON 형식으로만 응답하세요. 마크다운이나 코드블록 없이 순수 JSON만 출력하세요.

## 기사 목록
${articleListText}

## 분류 기준 (반드시 준수)
- 모든 댓글을 반드시 긍정 또는 부정 둘 중 하나로만 분류한다. 중립 없음.
- 애매한 댓글도 문맥·감정·뉘앙스를 분석해 둘 중 하나로 판단한다.
- 긍정: 지지·칭찬·응원·동의·희망적·유머·사실이라도 긍정적 맥락
- 부정: 비판·비난·분노·실망·반대·걱정·사실이라도 부정적 맥락
- positiveRatio + negativeRatio = 100 (정확히 일치해야 함)
- 기사별 각 비율도 합계 = 100이어야 함

## 댓글 목록
${commentLines.join('\n')}

## 출력 JSON
{
  "positiveRatio": (전체 긍정 퍼센트, 정수),
  "negativeRatio": (전체 부정 퍼센트, 정수. positiveRatio + negativeRatio = 100),
  "topPositiveComments": [
    {"content": "(긍정 댓글 원문, 다른 항목과 중복 없이)", "likes": (추천 수), "articleIndex": (기사 번호, 정수)},
    {"content": "(긍정 댓글 원문)", "likes": (추천 수), "articleIndex": (기사 번호)},
    {"content": "(긍정 댓글 원문)", "likes": (추천 수), "articleIndex": (기사 번호)},
    {"content": "(긍정 댓글 원문)", "likes": (추천 수), "articleIndex": (기사 번호)},
    {"content": "(긍정 댓글 원문)", "likes": (추천 수), "articleIndex": (기사 번호)}
  ],
  "topNegativeComments": [
    {"content": "(부정 댓글, topPositiveComments와 겹치지 않게)", "likes": (추천 수), "articleIndex": (기사 번호, 정수)},
    {"content": "(부정 댓글)", "likes": (추천 수), "articleIndex": (기사 번호)},
    {"content": "(부정 댓글)", "likes": (추천 수), "articleIndex": (기사 번호)},
    {"content": "(부정 댓글)", "likes": (추천 수), "articleIndex": (기사 번호)},
    {"content": "(부정 댓글)", "likes": (추천 수), "articleIndex": (기사 번호)}
  ],
  "topPositiveWords": ["단어1", "단어2", "단어3", "단어4", "단어5"],
  "topNegativeWords": ["단어1", "단어2", "단어3", "단어4", "단어5"],
  "articleSummaries": [
${summaryTemplate}
  ]
}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API ${res.status}`);

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const raw = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI 응답 파싱 실패');

    const claude = JSON.parse(jsonMatch[0]) as ClaudeResult;

    // Normalize overall ratios
    let { positiveRatio, negativeRatio } = claude;
    if (positiveRatio + negativeRatio !== 100) {
      negativeRatio = Math.max(0, 100 - positiveRatio);
    }

    // Compute counts from ratios
    const positiveCount = Math.round(totalCommentCount * positiveRatio / 100);
    const negativeCount = totalCommentCount - positiveCount;

    // Map articleIndex → siteName for top comments
    const mapComments = (
      list: { content: string; likes: number; articleIndex: number }[]
    ) => list.map(c => ({
      content: c.content,
      likes: c.likes,
      source: articles[c.articleIndex - 1]?.siteName ?? '',
    }));

    let topPos = mapComments(claude.topPositiveComments ?? []);
    let topNeg = mapComments(claude.topNegativeComments ?? []);

    // Dedup within each list, then remove cross-list duplicates
    topPos = topPos.filter((c, i, arr) => arr.findIndex(x => x.content === c.content) === i);
    topNeg = topNeg.filter((c, i, arr) => arr.findIndex(x => x.content === c.content) === i);
    const posSet = new Set(topPos.map(c => c.content));
    topNeg = topNeg.filter(c => !posSet.has(c.content));

    // Build articleSummaries
    const summaryMap = new Map(
      (claude.articleSummaries ?? []).map(s => [s.articleIndex, s])
    );
    const articleSummaries = articles.map((a, i) => {
      const s = summaryMap.get(i + 1);
      const pr = s?.positiveRatio ?? positiveRatio;
      const nr = Math.max(0, 100 - pr);
      return {
        title: a.title,
        site: a.site,
        siteName: a.siteName,
        url: a.url,
        commentCount: a.comments.length,
        positiveRatio: pr,
        negativeRatio: nr,
      };
    });

    return NextResponse.json({
      articleCount,
      totalCommentCount,
      positiveCount,
      negativeCount,
      positiveRatio,
      negativeRatio,
      topPositiveWords: claude.topPositiveWords ?? [],
      topNegativeWords: claude.topNegativeWords ?? [],
      topPositiveComments: topPos,
      topNegativeComments: topNeg,
      articleSummaries,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: `분석 실패: ${msg}` }, { status: 500 });
  }
}
