'use client';

import { useState } from 'react';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface Comment {
  author: string; content: string; likes: number; dislikes: number; date: string;
}

interface Analysis {
  totalCount: number;
  positiveCount: number; negativeCount: number;
  positiveRatio: number; negativeRatio: number;
  topPositiveComments: { content: string; likes: number }[];
  topNegativeComments: { content: string; likes: number }[];
  topPositiveWords: string[];
  topNegativeWords: string[];
}

interface BulkAnalysis {
  articleCount: number;
  totalCommentCount: number;
  positiveCount: number; negativeCount: number;
  positiveRatio: number; negativeRatio: number;
  topPositiveWords: string[]; topNegativeWords: string[];
  topPositiveComments: { content: string; likes: number; source: string }[];
  topNegativeComments: { content: string; likes: number; source: string }[];
  articleSummaries: {
    title: string; site: string; siteName: string; url?: string;
    commentCount: number; positiveRatio: number; negativeRatio: number;
  }[];
}

interface ScrapedArticle {
  url: string; title: string; site: string; siteName: string; comments: Comment[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SITES: Record<string, { name: string; color: string }> = {
  chosun:   { name: '조선일보',   color: '#2563eb' },
  joongang: { name: '중앙일보',   color: '#dc2626' },
  hani:     { name: '한겨레',     color: '#059669' },
  khan:     { name: '경향신문',   color: '#7c3aed' },
  donga:    { name: '동아일보',   color: '#d97706' },
  munhwa:   { name: '문화일보',   color: '#0891b2' },
  sedaily:  { name: '서울경제',   color: '#be185d' },
  seoul:    { name: '서울신문',   color: '#65a30d' },
  mk:       { name: '매일경제',   color: '#c2410c' },
  hankyung: { name: '한국경제',   color: '#0369a1' },
  ohmynews:     { name: '오마이뉴스', color: '#b91c1c' },
  hankookilbo:  { name: '한국일보',   color: '#0f766e' },
};

// ── Shared sub-components ─────────────────────────────────────────────────────

function SentimentBar({ pos, neg }: { pos: number; neg: number }) {
  return (
    <div className="card" style={{ padding: '18px 24px', marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
        <span style={{ color: '#16a34a', fontWeight: 600 }}>긍정 {pos}%</span>
        <span style={{ color: '#dc2626', fontWeight: 600 }}>부정 {neg}%</span>
      </div>
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 14 }}>
        <div style={{ width: `${pos}%`, background: '#16a34a', transition: 'width 0.6s ease' }} />
        <div style={{ width: `${neg}%`, background: '#dc2626', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function WordBadges({ positive, negative }: { positive: string[]; negative: string[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 11, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, fontWeight: 700 }}>주요 긍정 단어</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {positive.map((w, i) => (
            <span key={i} style={{ padding: '5px 13px', borderRadius: 20, background: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 600, border: '1px solid #bbf7d0' }}>{w}</span>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 11, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, fontWeight: 700 }}>주요 부정 단어</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {negative.map((w, i) => (
            <span key={i} style={{ padding: '5px 13px', borderRadius: 20, background: '#fee2e2', color: '#991b1b', fontSize: 13, fontWeight: 600, border: '1px solid #fecaca' }}>{w}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentCards({
  positive, negative, withSource = false,
}: {
  positive: { content: string; likes: number; source?: string }[];
  negative: { content: string; likes: number; source?: string }[];
  withSource?: boolean;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
      {[
        { list: positive, color: '#16a34a', label: '주요 긍정 댓글' },
        { list: negative, color: '#dc2626', label: '주요 부정 댓글' },
      ].map(({ list, color, label }) => (
        <div key={label} className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, fontWeight: 700 }}>{label}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map((c, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface2)', borderLeft: `3px solid ${color}` }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>{c.content}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color }}>👍 {c.likes}</span>
                  {withSource && c.source && <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {c.source}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function NewsCommentTab() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [phase, setPhase] = useState<'idle' | 'scraping' | 'analyzing' | 'done'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, currentUrl: '' });
  const [errors, setErrors] = useState<{ url: string; message: string }[]>([]);
  const [singleResult, setSingleResult] = useState<{ analysis: Analysis; title: string; site: string } | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkAnalysis | null>(null);

  const isLoading = phase === 'scraping' || phase === 'analyzing';
  const validCount = urls.filter(u => u.trim()).length;

  // ── URL list management ───────────────────────────────────────────────────

  const addUrl = () => setUrls(prev => [...prev, '']);
  const removeUrl = (i: number) => setUrls(prev => prev.filter((_, idx) => idx !== i));
  const updateUrl = (i: number, val: string) =>
    setUrls(prev => prev.map((u, idx) => (idx === i ? val : u)));

  const reset = () => {
    setPhase('idle');
    setProgress({ current: 0, total: 0, currentUrl: '' });
    setErrors([]);
    setSingleResult(null);
    setBulkResult(null);
  };

  // ── Analyze handler ───────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    const validUrls = urls.map(u => u.trim()).filter(Boolean);
    if (!validUrls.length) return;

    setSingleResult(null);
    setBulkResult(null);
    setErrors([]);
    setPhase('scraping');
    setProgress({ current: 0, total: validUrls.length, currentUrl: validUrls[0] });

    const scraped: ScrapedArticle[] = [];

    for (let i = 0; i < validUrls.length; i++) {
      const u = validUrls[i];
      setProgress({ current: i, total: validUrls.length, currentUrl: u });
      try {
        const res = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: u }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? '수집 실패');
        if (!data.comments?.length) throw new Error('댓글이 없는 기사입니다');
        scraped.push({
          url: u,
          title: data.title,
          site: data.site,
          siteName: SITES[data.site]?.name ?? data.site,
          comments: data.comments,
        });
      } catch (e) {
        setErrors(prev => [...prev, { url: u, message: e instanceof Error ? e.message : '오류' }]);
      }
      setProgress({ current: i + 1, total: validUrls.length, currentUrl: validUrls[i + 1] ?? '' });
    }

    if (!scraped.length) {
      setPhase('idle');
      return;
    }

    setPhase('analyzing');

    if (scraped.length === 1) {
      // ── 단일 분석 ──────────────────────────────────────────────────────
      try {
        const { title, site, comments } = scraped[0];
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments, title }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? '분석 실패');
        setSingleResult({ analysis: data, title, site });
        setPhase('done');
      } catch (e) {
        setErrors(prev => [...prev, { url: 'AI 분석', message: e instanceof Error ? e.message : '오류' }]);
        setPhase('idle');
      }
    } else {
      // ── 복수 분석 ──────────────────────────────────────────────────────
      try {
        const res = await fetch('/api/analyze-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articles: scraped }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? '분석 실패');
        setBulkResult(data);
        setPhase('done');
      } catch (e) {
        setErrors(prev => [...prev, { url: 'AI 분석', message: e instanceof Error ? e.message : '오류' }]);
        setPhase('idle');
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const siteInfo = singleResult ? SITES[singleResult.site] : null;

  return (
    <div style={{ padding: '28px 0' }}>

      {/* ── URL 입력 영역 ── */}
      {phase === 'idle' && (
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>기사 댓글 분석</h2>
          </div>

          {/* URL 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {urls.map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <input
                  value={u}
                  onChange={e => updateUrl(i, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isLoading && handleAnalyze()}
                  placeholder={`URL ${i + 1} — https://www.chosun.com/...`}
                  style={{
                    flex: 1, padding: '11px 16px', borderRadius: 10,
                    border: '1.5px solid var(--border2)', background: '#fff',
                    color: 'var(--text)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                />
                {urls.length > 1 && (
                  <button
                    onClick={() => removeUrl(i)}
                    style={{
                      padding: '0 13px', borderRadius: 9, border: '1.5px solid var(--border2)',
                      background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer',
                      fontSize: 18, lineHeight: 1, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#dc2626'; (e.target as HTMLButtonElement).style.color = '#dc2626'; }}
                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--border2)'; (e.target as HTMLButtonElement).style.color = 'var(--muted)'; }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              onClick={addUrl}
              className="btn-ghost"
              style={{ fontSize: 13, padding: '9px 18px', whiteSpace: 'nowrap' }}
            >
              + URL 추가
            </button>
            <button
              onClick={handleAnalyze}
              disabled={validCount === 0}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {validCount > 1 ? `${validCount}개 기사 분석 시작` : '분석 시작'}
            </button>
          </div>

          {/* 지원 언론사 */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(SITES).map(([k, v]) => (
              <span key={k} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 10, border: `1px solid ${v.color}35`, color: v.color, background: `${v.color}0d` }}>{v.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── 에러 ── */}
      {errors.length > 0 && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, border: '1px solid #fca5a5', background: '#fef2f2' }}>
          {errors.map((e, i) => (
            <div key={i} style={{ color: '#dc2626', fontSize: 13, marginBottom: i < errors.length - 1 ? 5 : 0 }}>
              ⚠️ <strong>{e.url.length > 55 ? e.url.slice(0, 55) + '…' : e.url}</strong> — {e.message}
            </div>
          ))}
        </div>
      )}

      {/* ── 진행 상황 ── */}
      {isLoading && (
        <div className="card" style={{ padding: 36, marginBottom: 20, textAlign: 'center' }}>
          <div className="pulse-slow" style={{ fontSize: 36, marginBottom: 12 }}>
            {phase === 'analyzing' ? '🤖' : '🔍'}
          </div>
          <p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            {phase === 'analyzing'
              ? 'AI 분석 중...'
              : `${progress.current}/${progress.total} 수집 중...`}
          </p>
          {phase === 'scraping' && progress.currentUrl && (
            <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 20 }}>
              {progress.currentUrl.length > 65 ? progress.currentUrl.slice(0, 65) + '…' : progress.currentUrl}
            </p>
          )}
          {phase === 'analyzing' && (
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Claude AI가 댓글을 분석하고 있습니다</p>
          )}
          {phase === 'scraping' && (
            <div style={{ maxWidth: 360, margin: '0 auto' }}>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  height: '100%', background: 'var(--accent)', borderRadius: 4,
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                {progress.current}/{progress.total} 완료
                {errors.length > 0 && ` · 실패 ${errors.length}개`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          결과 — 단일 기사
      ═══════════════════════════════════════════════════════════════════════ */}
      {phase === 'done' && singleResult && (
        <div className="fade-up">
          {/* 기사 정보 */}
          <div className="card" style={{ padding: 20, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {siteInfo && (
                <span style={{
                  padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: `${siteInfo.color}15`, color: siteInfo.color,
                  border: `1px solid ${siteInfo.color}35`, whiteSpace: 'nowrap', marginTop: 2,
                }}>{siteInfo.name}</span>
              )}
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
                {singleResult.title}
              </p>
            </div>
          </div>

          {/* 카드 2개 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#16a34a', fontFamily: 'Space Grotesk, monospace' }}>
                {singleResult.analysis.positiveCount}<span style={{ fontSize: 14 }}>개</span>
              </div>
              <div style={{ fontSize: 11, color: '#16a34a', marginTop: 6, fontWeight: 600 }}>
                긍정 댓글 {singleResult.analysis.positiveRatio}%
              </div>
            </div>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#dc2626', fontFamily: 'Space Grotesk, monospace' }}>
                {singleResult.analysis.negativeCount}<span style={{ fontSize: 14 }}>개</span>
              </div>
              <div style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>
                부정 댓글 {singleResult.analysis.negativeRatio}%
              </div>
            </div>
          </div>

          <SentimentBar pos={singleResult.analysis.positiveRatio} neg={singleResult.analysis.negativeRatio} />
          <WordBadges positive={singleResult.analysis.topPositiveWords} negative={singleResult.analysis.topNegativeWords} />
          <CommentCards positive={singleResult.analysis.topPositiveComments} negative={singleResult.analysis.topNegativeComments} />

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button onClick={reset} className="btn-ghost">다시 분석하기</button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          결과 — 복수 기사
      ═══════════════════════════════════════════════════════════════════════ */}
      {phase === 'done' && bulkResult && (
        <div className="fade-up">
          {/* 헤더 */}
          <div className="card" style={{ padding: '18px 24px', marginBottom: 18 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              {bulkResult.articleCount}개 기사 · 총 {bulkResult.totalCommentCount.toLocaleString()}개 댓글 분석
            </span>
          </div>

          {/* 카드 2개 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#16a34a', fontFamily: 'Space Grotesk, monospace' }}>
                {bulkResult.positiveCount.toLocaleString()}<span style={{ fontSize: 14 }}>개</span>
              </div>
              <div style={{ fontSize: 11, color: '#16a34a', marginTop: 6, fontWeight: 600 }}>
                긍정 댓글 {bulkResult.positiveRatio}%
              </div>
            </div>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#dc2626', fontFamily: 'Space Grotesk, monospace' }}>
                {bulkResult.negativeCount.toLocaleString()}<span style={{ fontSize: 14 }}>개</span>
              </div>
              <div style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>
                부정 댓글 {bulkResult.negativeRatio}%
              </div>
            </div>
          </div>

          <SentimentBar pos={bulkResult.positiveRatio} neg={bulkResult.negativeRatio} />
          <WordBadges positive={bulkResult.topPositiveWords} negative={bulkResult.topNegativeWords} />
          <CommentCards positive={bulkResult.topPositiveComments} negative={bulkResult.topNegativeComments} withSource />

          {/* 기사별 요약 테이블 */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, fontWeight: 700 }}>
              기사별 요약
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['언론사', '기사 제목', '댓글수', '긍정%', '부정%'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: h === '기사 제목' ? 'left' : 'center', borderBottom: '2px solid var(--border)', color: 'var(--muted)', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bulkResult.articleSummaries.map((s, i) => {
                    const siteColor = SITES[s.site]?.color ?? '#6b7280';
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: `${siteColor}15`, color: siteColor, border: `1px solid ${siteColor}30` }}>
                            {s.siteName}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text)', maxWidth: 280 }}>
                          {s.url ? (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--text)', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                            >
                              {s.title}
                            </a>
                          ) : (
                            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.title}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Space Grotesk, monospace' }}>
                          {s.commentCount.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#16a34a', fontWeight: 700, fontFamily: 'Space Grotesk, monospace' }}>
                          {s.positiveRatio}%
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#dc2626', fontWeight: 700, fontFamily: 'Space Grotesk, monospace' }}>
                          {s.negativeRatio}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={reset} className="btn-ghost">다시 분석하기</button>
          </div>
        </div>
      )}
    </div>
  );
}
