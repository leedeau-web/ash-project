// src/app/api/analyze/route.ts
// ASH Project — Claude AI Comment Analyzer

import { NextRequest, NextResponse } from 'next/server';

interface Comment {
  author: string;
  content: string;
  likes: number;
  dislikes: number;
  date: string;
}

interface AnalysisResult {
  totalCount: number;
  positiveCount: number;
  negativeCount: number;
  positiveRatio: number;
  negativeRatio: number;
  topPositiveComments: { content: string; likes: number }[];
  topNegativeComments: { content: string; likes: number }[];
  topPositiveWords: string[];
  topNegativeWords: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { comments, title } = await req.json() as { comments: Comment[]; title: string };
    if (!comments?.length) return NextResponse.json({ error: '댓글이 없습니다.' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');

    const totalCount = comments.length;
    const sorted = [...comments].sort((a, b) => b.likes - a.likes).slice(0, 80);
    const commentText = sorted
      .map((c, i) => `[${i + 1}] ${c.content} (추천: ${c.likes})`)
      .join('\n');

    const prompt = `다음은 "${title}" 기사의 독자 댓글 ${totalCount}개 중 상위 ${sorted.length}개입니다. 정확히 아래 JSON 형식으로만 응답하세요. 마크다운이나 코드블록 없이 순수 JSON만 출력하세요.

## 분류 기준 (반드시 준수)
- 모든 댓글을 반드시 긍정 또는 부정 둘 중 하나로만 분류한다. 중립 없음.
- 애매한 댓글도 문맥·감정·뉘앙스를 분석해 둘 중 하나로 판단한다.
- 긍정: 지지·칭찬·응원·동의·희망적·유머·사실이라도 긍정적 맥락
- 부정: 비판·비난·분노·실망·반대·걱정·사실이라도 부정적 맥락
- positiveCount + negativeCount = ${totalCount} (정확히 일치해야 함)
- positiveRatio + negativeRatio = 100 (정확히 일치해야 함)

## 댓글 목록
${commentText}

## 출력 JSON
{
  "totalCount": ${totalCount},
  "positiveCount": (긍정 댓글 수, 정수),
  "negativeCount": (부정 댓글 수, 정수. positiveCount + negativeCount = ${totalCount}),
  "positiveRatio": (긍정 퍼센트, 정수),
  "negativeRatio": (부정 퍼센트, 정수. positiveRatio + negativeRatio = 100),
  "topPositiveComments": [
    {"content": "(긍정 댓글 원문, 다른 항목과 중복 없이)", "likes": (추천 수)},
    {"content": "(긍정 댓글 원문, 다른 항목과 중복 없이)", "likes": (추천 수)},
    {"content": "(긍정 댓글 원문, 다른 항목과 중복 없이)", "likes": (추천 수)},
    {"content": "(긍정 댓글 원문, 다른 항목과 중복 없이)", "likes": (추천 수)},
    {"content": "(긍정 댓글 원문, 다른 항목과 중복 없이)", "likes": (추천 수)}
  ],
  "topNegativeComments": [
    {"content": "(부정 댓글 원문, topPositiveComments와 겹치지 않게)", "likes": (추천 수)},
    {"content": "(부정 댓글 원문, topPositiveComments와 겹치지 않게)", "likes": (추천 수)},
    {"content": "(부정 댓글 원문, topPositiveComments와 겹치지 않게)", "likes": (추천 수)},
    {"content": "(부정 댓글 원문, topPositiveComments와 겹치지 않게)", "likes": (추천 수)},
    {"content": "(부정 댓글 원문, topPositiveComments와 겹치지 않게)", "likes": (추천 수)}
  ],
  "topPositiveWords": ["단어1", "단어2", "단어3", "단어4", "단어5"],
  "topNegativeWords": ["단어1", "단어2", "단어3", "단어4", "단어5"]
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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API ${res.status}`);

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const raw = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI 응답 파싱 실패');

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;

    // 합계 보정: positiveCount + negativeCount가 totalCount와 다르면 negativeCount로 맞춤
    if (result.positiveCount + result.negativeCount !== totalCount) {
      result.negativeCount = totalCount - result.positiveCount;
      if (result.negativeCount < 0) { result.negativeCount = 0; result.positiveCount = totalCount; }
    }
    if (result.positiveRatio + result.negativeRatio !== 100) {
      result.negativeRatio = 100 - result.positiveRatio;
      if (result.negativeRatio < 0) { result.negativeRatio = 0; result.positiveRatio = 100; }
    }

    // 댓글 중복 제거: topNegativeComments에서 topPositiveComments와 겹치는 항목 제거
    const positiveContents = new Set(result.topPositiveComments.map(c => c.content));
    result.topNegativeComments = result.topNegativeComments.filter(c => !positiveContents.has(c.content));

    // 각 목록 내 중복 제거
    result.topPositiveComments = result.topPositiveComments.filter(
      (c, i, arr) => arr.findIndex(x => x.content === c.content) === i
    );
    result.topNegativeComments = result.topNegativeComments.filter(
      (c, i, arr) => arr.findIndex(x => x.content === c.content) === i
    );

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: `분석 실패: ${msg}` }, { status: 500 });
  }
}
