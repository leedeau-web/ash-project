// src/app/api/morning-brief/route.ts
// ASH Project — Morning Brief PDF Analyzer

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, readdir, rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export const maxDuration = 120;

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const workDir = join(tmpdir(), `morning-brief-${Date.now()}`);

  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;
    if (!file) return NextResponse.json({ error: 'PDF 파일이 필요합니다.' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');

    await mkdir(workDir, { recursive: true });
    const pdfPath = join(workDir, 'input.pdf');
    const imgPrefix = join(workDir, 'page');

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(pdfPath, buffer);

    // PDF 앞 6페이지만 PNG 변환 (목차 페이지)
    try {
      await execAsync(`pdftoppm -r 100 -png -f 1 -l 6 "${pdfPath}" "${imgPrefix}"`);
    } catch (execErr) {
      console.error('pdftoppm 오류:', execErr);
      throw new Error('PDF 변환 실패. pdftoppm(poppler)이 설치되어 있지 않습니다. Windows에서는 https://github.com/oschwartz10612/poppler-windows/releases 에서 설치 후 시스템 PATH에 추가하세요.');
    }

    const files = await readdir(workDir);
    const pageFiles = files
      .filter(f => /^page-?\d+\.png$/.test(f))
      .sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] ?? '0');
        const nb = parseInt(b.match(/\d+/)?.[0] ?? '0');
        return na - nb;
      })
      .map(f => join(workDir, f));

    if (!pageFiles.length) throw new Error('PDF에서 이미지를 추출하지 못했습니다.');

    const pageCount = pageFiles.length;

    // 6장 이미지를 한 번에 Vision API로 전송
    const imageContents = await Promise.all(
      pageFiles.map(async (p) => {
        const data = await readFile(p);
        return {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/png' as const,
            data: data.toString('base64'),
          },
        };
      }),
    );

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
            ...imageContents,
            {
              type: 'text',
              text: `이 이미지들은 보건복지부 조간 신문 스크랩의 목차 페이지입니다. 기사 제목을 아래 형식으로 정리해주세요.

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
      console.error('Vision API 에러 응답:', errBody);
      throw new Error(`Vision API ${res.status}`);
    }

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const summary = data.content.filter(b => b.type === 'text').map(b => b.text).join('');

    return NextResponse.json({ summary, pageCount, fileName: file.name });
  } catch (e) {
    console.error('상세 에러:', e);
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: `분석 실패: ${msg}` }, { status: 500 });
  } finally {
    try { await rm(workDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
