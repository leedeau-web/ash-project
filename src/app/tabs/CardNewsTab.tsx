'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ── 상수 ─────────────────────────────────────────────────────────────────────
const W = 1080, H = 1440;
const TEXT_X = 150;
const TEXT_MAX_W = 751;
const PARA_GAP = 50;
const CARD_BOTTOM = 1252;

// ── 폰트 로드 ─────────────────────────────────────────────────────────────────
let fontsLoaded = false;
async function loadFonts() {
  if (fontsLoaded) return;
  const faces = [
    new FontFace('Paperlogy-4Regular', 'url(/fonts/Paperlogy-4Regular.ttf)'),
    new FontFace('Paperlogy-7Bold',    'url(/fonts/Paperlogy-7Bold.ttf)'),
    new FontFace('Paperlogy-5Medium',  'url(/fonts/Paperlogy-5Medium.ttf)'),
  ];
  await Promise.all(faces.map(f => f.load().then(ff => { document.fonts.add(ff); return ff; })));
  fontsLoaded = true;
}

// ── 이미지 캐시 ───────────────────────────────────────────────────────────────
const imgCache: Record<string, HTMLImageElement> = {};
function loadImg(src: string): Promise<HTMLImageElement> {
  if (imgCache[src]) return Promise.resolve(imgCache[src]);
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imgCache[src] = img; res(img); };
    img.onerror = rej;
    img.src = src;
  });
}

// ── 양끝정렬 텍스트 렌더링 (글자 단위) ──────────────────────────────────────
function drawJustifiedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  paragraphGap: number,
  letterSpacing: number,
): number {
  const paragraphs = text.split('\n\n');
  let y = startY;

  for (let p = 0; p < paragraphs.length; p++) {
    const chars = paragraphs[p].replace(/\n/g, '').split('');

    // 글자 단위로 줄 나누기 (자간 포함한 너비 계산)
    const lines: string[] = [];
    let currentLine = '';
    for (const char of chars) {
      const testLine = currentLine + char;
      const testWidth = Array.from(testLine).reduce((sum, ch) => sum + ctx.measureText(ch).width, 0)
        + letterSpacing * (testLine.length - 1);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // 각 줄 양끝정렬로 그리기
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLastLine = i === lines.length - 1;

      if (isLastLine || line.length <= 1) {
        // 마지막 줄: 좌측정렬 + 자간 적용
        let cx = x;
        for (const ch of Array.from(line)) {
          ctx.fillText(ch, cx, y);
          cx += ctx.measureText(ch).width + letterSpacing;
        }
      } else {
        // 양끝정렬: 글자 사이 간격 균등 분배
        const totalCharWidth = Array.from(line).reduce((sum, ch) => sum + ctx.measureText(ch).width, 0);
        const gapPerChar = (maxWidth - totalCharWidth) / (line.length - 1);
        let cx = x;
        for (const ch of Array.from(line)) {
          ctx.fillText(ch, cx, y);
          cx += ctx.measureText(ch).width + gapPerChar + letterSpacing;
        }
      }
      y += lineHeight;
    }

    if (p < paragraphs.length - 1) y += paragraphGap;
  }
  return y;
}

// ── 슬라이드 타입 ─────────────────────────────────────────────────────────────
interface Slide {
  title: string;
  body: string;
  lineHeight: number;
  letterSpacing: number;
  bodyOffsetY: number;
}

const DEFAULT_SLIDE: Omit<Slide, 'title' | 'body'> = {
  lineHeight: 70,
  letterSpacing: 0,
  bodyOffsetY: 0,
};

// ── 렌더 함수 ─────────────────────────────────────────────────────────────────
async function renderSlide(
  canvas: HTMLCanvasElement,
  slide: Slide,
  slideIndex: number,
  date: string,
  scale = 1,
  bgImage?: HTMLImageElement,
): Promise<boolean> {
  await loadFonts();

  canvas.width  = W * scale;
  canvas.height = H * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // 배경 (캐시된 이미지 우선 사용)
  try {
    const bg = bgImage ?? await loadImg('/card-bg.png');
    ctx.drawImage(bg, 0, 0, W, H);
  } catch {
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.textBaseline = 'top';

  // 날짜 (모든 슬라이드 공통)
  if (date.trim()) {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '26px Paperlogy-4Regular';
    ctx.fillText(date.trim(), 281, 340);
  }

  const { lineHeight, letterSpacing, bodyOffsetY } = slide;
  let bodyY = 490 + bodyOffsetY;

  // 슬라이드 1: 제목 렌더링
  if (slideIndex === 0 && slide.title.trim()) {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '700 38px Paperlogy-7Bold';
    const titleEndY = drawJustifiedText(ctx, slide.title.trim(), TEXT_X, 490, TEXT_MAX_W, lineHeight, PARA_GAP, letterSpacing);
    bodyY = titleEndY + 50 + bodyOffsetY;
  }

  // 본문 텍스트 (양끝정렬)
  let endY = bodyY;
  if (slide.body.trim()) {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '400 38px Paperlogy-4Regular';
    endY = drawJustifiedText(ctx, slide.body.trim(), TEXT_X, bodyY, TEXT_MAX_W, lineHeight, PARA_GAP, letterSpacing);
  }

  const overflow = endY > CARD_BOTTOM;

  // 오버플로우 경고선
  if (overflow) {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(TEXT_X, CARD_BOTTOM);
    ctx.lineTo(TEXT_X + TEXT_MAX_W, CARD_BOTTOM);
    ctx.stroke();
  }

  return overflow;
}

// ── canvas → Blob ─────────────────────────────────────────────────────────────
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => {
    canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png');
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════

const today = new Date();
const DEFAULT_DATE = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}.`;

export default function CardNewsTab() {
  const [date, setDate]         = useState(DEFAULT_DATE);
  const [slides, setSlides]     = useState<Slide[]>([{ title: '', body: '', ...DEFAULT_SLIDE }]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [overflow, setOverflow]   = useState(false);
  const [downloading, setDownloading] = useState(false);

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const renderRef   = useRef<number | null>(null);
  const bgImageRef  = useRef<HTMLImageElement | null>(null);
  const activeSlide = slides[activeIdx] ?? { title: '', body: '', ...DEFAULT_SLIDE };

  // ── 마운트 시 폰트 + 배경 이미지 프리로드 ────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/card-bg.png';
    img.onload = () => { bgImageRef.current = img; imgCache['/card-bg.png'] = img; };

    Promise.all([
      new FontFace('Paperlogy-4Regular', 'url(/fonts/Paperlogy-4Regular.ttf)').load(),
      new FontFace('Paperlogy-7Bold',    'url(/fonts/Paperlogy-7Bold.ttf)').load(),
      new FontFace('Paperlogy-5Medium',  'url(/fonts/Paperlogy-5Medium.ttf)').load(),
    ]).then(fonts => {
      fonts.forEach(f => document.fonts.add(f));
      fontsLoaded = true;
    });
  }, []);

  // ── 미리보기 렌더 ─────────────────────────────────────────────────────────
  const renderPreview = useCallback(async () => {
    if (!canvasRef.current) return;
    const ov = await renderSlide(canvasRef.current, activeSlide, activeIdx, date, 0.4, bgImageRef.current ?? undefined);
    setOverflow(ov);
  }, [activeSlide, activeIdx, date]);

  const scheduleRender = useCallback(() => {
    if (renderRef.current) cancelAnimationFrame(renderRef.current);
    renderRef.current = requestAnimationFrame(() => { renderPreview(); });
  }, [renderPreview]);

  useEffect(() => { scheduleRender(); }, [scheduleRender]);

  // ── 슬라이드 관리 ─────────────────────────────────────────────────────────
  const addSlide = () => {
    setSlides(s => [...s, { title: '', body: '', ...DEFAULT_SLIDE }]);
    setActiveIdx(slides.length);
  };

  const removeSlide = (i: number) => {
    if (i === 0) return;
    const next = slides.filter((_, idx) => idx !== i);
    setSlides(next);
    setActiveIdx(Math.min(activeIdx, next.length - 1));
  };

  const updateSlide = (patch: Partial<Slide>) =>
    setSlides(s => s.map((sl, i) => i === activeIdx ? { ...sl, ...patch } : sl));

  // ── 단일 PNG 다운로드 ─────────────────────────────────────────────────────
  const downloadOne = async (idx: number) => {
    const offscreen = document.createElement('canvas');
    await renderSlide(offscreen, slides[idx], idx, date, 1);
    const blob = await canvasToBlob(offscreen);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `slide_${idx + 1}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ── 전체 개별 다운로드 ────────────────────────────────────────────────────
  const downloadAll = async () => {
    setDownloading(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const offscreen = document.createElement('canvas');
        await renderSlide(offscreen, slides[i], i, date, 1);
        await new Promise<void>((resolve) => {
          offscreen.toBlob((blob) => {
            if (!blob) return resolve();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `slide_${i + 1}.png`;
            a.click();
            URL.revokeObjectURL(url);
            setTimeout(resolve, 300);
          }, 'image/png');
        });
      }
    } finally {
      setDownloading(false);
    }
  };

  // ── Slider 헬퍼 ──────────────────────────────────────────────────────────
  const SliderRow = ({
    label, field, min, max, step, decimals = 0,
  }: {
    label: string;
    field: keyof Pick<Slide, 'lineHeight' | 'letterSpacing' | 'bodyOffsetY'>;
    min: number; max: number; step: number; decimals?: number;
  }) => {
    const val = activeSlide[field] as number;
    const set = (v: number) => {
      const clamped = Math.min(max, Math.max(min, v));
      updateSlide({ [field]: clamped });
    };
    return (
      <div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="range"
            min={min} max={max} step={step}
            value={val}
            onChange={e => set(Number(e.target.value))}
            onInput={e => set(Number((e.target as HTMLInputElement).value))}
            style={{
              flex: 1,
              cursor: 'pointer',
              accentColor: '#4f63d2',
              WebkitAppearance: 'none',
              appearance: 'none',
              height: '4px',
              borderRadius: '2px',
              outline: 'none',
              touchAction: 'none',
            }}
          />
          <input
            type="number"
            min={min} max={max} step={step}
            value={decimals > 0 ? val.toFixed(decimals) : val}
            onChange={e => set(Number(e.target.value))}
            style={{
              width: 60, padding: '4px 6px', borderRadius: 6, flexShrink: 0,
              border: '1.5px solid var(--border2)', background: '#fff',
              color: 'var(--text)', fontSize: 12, textAlign: 'center', outline: 'none',
              fontFamily: 'monospace',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '28px 0', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

      {/* ── 왼쪽: 입력 패널 ── */}
      <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 날짜 + 슬라이드별 설정 슬라이더 */}
        <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>날짜 (모든 슬라이드 공유)</div>
            <input
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="2026.06.05."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: '1.5px solid var(--border2)', background: '#fff',
                color: 'var(--text)', fontSize: 14, outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1, paddingTop: 2 }}>
            슬라이드 {activeIdx + 1} 설정
          </div>
          <SliderRow label="줄간격"   field="lineHeight"    min={40}   max={90}  step={1}   decimals={0} />
          <SliderRow label="자간"     field="letterSpacing" min={-3}   max={3}   step={0.1} decimals={1} />
          <SliderRow label="본문 위치" field="bodyOffsetY"   min={-100} max={200} step={1}   decimals={0} />
        </div>

        {/* 슬라이드 탭 */}
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {slides.map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button
                  onClick={() => setActiveIdx(i)}
                  style={{
                    padding: '6px 16px', borderRadius: 7, border: 'none',
                    background: activeIdx === i ? 'var(--accent)' : 'var(--surface2)',
                    color: activeIdx === i ? '#fff' : 'var(--text2)',
                    fontWeight: activeIdx === i ? 600 : 400,
                    fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  슬라이드 {i + 1}
                </button>
                {i > 0 && (
                  <button
                    onClick={() => removeSlide(i)}
                    style={{
                      width: 18, height: 18, borderRadius: '50%', border: 'none',
                      background: '#fee2e2', color: '#dc2626',
                      fontSize: 11, cursor: 'pointer', lineHeight: 1, padding: 0,
                    }}
                  >×</button>
                )}
              </div>
            ))}
            <button
              onClick={addSlide}
              style={{
                padding: '6px 12px', borderRadius: 7,
                border: '1.5px dashed var(--border2)',
                background: 'transparent', color: 'var(--muted)',
                fontSize: 12, cursor: 'pointer',
              }}
            >+ 추가</button>
          </div>

          {/* 슬라이드 1: 제목 + 본문 */}
          {activeIdx === 0 && (
            <>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>제목</div>
              <input
                value={activeSlide.title}
                onChange={e => updateSlide({ title: e.target.value })}
                placeholder="■ 제목을 입력하세요"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8, marginBottom: 12,
                  border: '1.5px solid var(--border2)', background: '#fff',
                  color: 'var(--text)', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
              />
            </>
          )}

          {/* 본문 (모든 슬라이드) */}
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>
            본문 {activeIdx > 0 ? '' : '(빈 줄 = 단락 구분)'}
          </div>
          <textarea
            value={activeSlide.body}
            onChange={e => updateSlide({ body: e.target.value })}
            placeholder={activeIdx === 0 ? '본문을 입력하세요\n\n빈 줄로 단락을 구분합니다' : `슬라이드 ${activeIdx + 1} 본문`}
            rows={14}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 8,
              border: '1.5px solid var(--border2)', background: '#fff',
              color: 'var(--text)', fontSize: 13, lineHeight: 1.7,
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>

        {/* 오버플로우 경고 */}
        {overflow && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: '#fef2f2', border: '1px solid #fca5a5',
            fontSize: 12, color: '#dc2626', fontWeight: 600,
          }}>
            ⚠️ 텍스트가 카드 하단을 초과합니다. 내용을 줄여주세요.
          </div>
        )}

        {/* 다운로드 버튼 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => downloadOne(activeIdx)}
            disabled={downloading}
            className="btn-ghost"
            style={{ flex: 1 }}
          >
            PNG 다운로드
          </button>
          <button
            onClick={downloadAll}
            disabled={downloading}
            className="btn-primary"
            style={{ flex: 1, opacity: downloading ? 0.7 : 1 }}
          >
            {downloading ? '저장 중...' : '전체 다운로드'}
          </button>
        </div>

      </div>

      {/* ── 오른쪽: 미리보기 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 }}>
          미리보기 — 슬라이드 {activeIdx + 1} / {slides.length}
        </div>
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          lineHeight: 0,
        }}>
          <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />
        </div>
      </div>

    </div>
  );
}
