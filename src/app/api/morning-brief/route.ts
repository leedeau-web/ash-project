// src/app/api/morning-brief/route.ts
// ASH Project — Morning Brief PDF Analyzer (document type)

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export const maxDuration = 120;

const MAX_PAGES = 6;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;
    if (!file) return NextResponse.json({ error: 'PDF 파일이 필요합니다.' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');

    // 원본 PDF 로드 후 앞 6페이지만 추출해 새 PDF 생성
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    const pageCount = Math.min(totalPages, MAX_PAGES);

    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, Array.from({ length: pageCount }, (_, i) => i));
    pages.forEach(p => newPdf.addPage(p));
    const trimBytes = await newPdf.save();

    // 앞 6페이지 PDF → base64
    const base64 = Buffer.from(trimBytes).toString('base64');

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
                data: base64,
              },
            },
            {
              type: 'text',
              text: `이 PDF는 보건복지부 조간 신문 스크랩입니다. 기사 제목 목록을 아래 형식으로 정리해주세요.

## 출력 형식 (정확히 준수)
■ [날짜] 주요뉴스(복지부 조간스크랩)

(보건의료)
▲ 기사 제목
▲ 기사 제목

(사회복지)
▲ 기사 제목
▲ 기사 제목

[주요 사설]
▲ 기사 제목 [언론사명]

## 규칙
- (보건의료): 최대 15개. 건보/심평원/수가/의료정책/감염병 관련 기사 우선
- (사회복지): 최대 8개. 국민연금/기초연금/기초수급/장애인/돌봄 관련 기사 우선
- [주요 사설]: 최대 4개. 반드시 제목 뒤에 [언론사명] 표기 (예: ▲ 제목 [한겨레])
- 인사이동, 부고, 訃告, 訃音 관련 제목은 완전히 제외
- 동일하거나 유사한 기사는 대표 제목 하나로 통합
- 제목만 표기, * 설명 등 부가 내용 없음
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
      console.error('Claude API 에러 응답:', errBody);
      throw new Error(`Claude API ${res.status}`);
    }

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const summary = data.content.filter(b => b.type === 'text').map(b => b.text).join('');

    return NextResponse.json({ summary, pageCount, fileName: file.name });
  } catch (e) {
    console.error('상세 에러:', e);
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: `분석 실패: ${msg}` }, { status: 500 });
  }
}
