// src/app/api/morning-brief/route.ts
// ASH Project — Morning Brief PDF Analyzer

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;
    if (!file) return NextResponse.json({ error: 'PDF 파일이 필요합니다.' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `이 PDF는 보건복지부 조간 신문 스크랩입니다. 기사 제목을 아래 형식으로 정리해주세요.

## 우선순위 키워드 (해당 기사를 각 카테고리 앞쪽에 배치)
(보건의료): 건강보험, 건보, 심평원, 수가, 의료수가, 비급여, 급여, 본인부담, 의료개혁
(사회복지): 국민연금, 기초연금, 기초수급, 장애인, 노인돌봄, 통합돌봄, 복지급여

## 출력 형식 (정확히 준수)
■ [날짜] 주요뉴스(복지부 조간스크랩)

(보건의료)
▲ 기사 제목

(사회복지)
▲ 기사 제목

[주요 사설]
▲ 기사 제목

## 규칙
- 우선순위 키워드 관련 기사를 먼저 배치하고, 나머지 보건의료/사회복지 기사도 모두 포함
- 각 카테고리 최대 10개
- [주요 사설] 최대 4개
- 인사이동, 부고, 訃告, 訃音 관련 제목만 제외
- 중복·유사 기사는 대표 제목 하나로 통합
- 표지, 빈 페이지, 광고 건너뛰기
- 제목만 출력, * 설명 없음, 언론사명 없음
- (보건의료), (사회복지) 옆에 추가 설명 없이 그대로 표기
- 해당 카테고리 기사가 없으면 카테고리 생략
- 순수 텍스트만 출력`,
            },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('API 에러 응답:', errBody);
      throw new Error(`API ${res.status}`);
    }

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const summary = data.content.filter(b => b.type === 'text').map(b => b.text).join('');

    return NextResponse.json({ summary, pageCount: 0, fileName: file.name });
  } catch (e) {
    console.error('상세 에러:', e);
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: `분석 실패: ${msg}` }, { status: 500 });
  }
}
