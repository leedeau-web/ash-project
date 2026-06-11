'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const NewsCommentTab = dynamic(() => import('../tabs/NewsCommentTab'), { ssr: false });
const CardNewsTab    = dynamic(() => import('../tabs/CardNewsTab'),    { ssr: false });
const MorningBriefTab = dynamic(() => import('../tabs/MorningBriefTab'), { ssr: false });

type TabId = 'news-comment' | 'card-news' | 'morning-brief';

const TABS = [
  { id: 'news-comment'  as TabId, icon: '💬', label: '뉴스 댓글 분석',  Component: NewsCommentTab },
  { id: 'card-news'     as TabId, icon: '📇', label: '카드뉴스 제작',   Component: CardNewsTab },
  { id: 'morning-brief' as TabId, icon: '📰', label: '조간스크랩 요약', Component: MorningBriefTab },
];

export default function AppPage() {
  const [activeTab, setActiveTab]       = useState<TabId>('news-comment');
  const [contentVisible, setContentVisible] = useState(true);
  const [scrollY, setScrollY]           = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchTab = (id: TabId) => {
    if (id === activeTab) return;
    setContentVisible(false);
    setTimeout(() => { setActiveTab(id); setContentVisible(true); }, 180);
  };

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.Component ?? NewsCommentTab;
  const parallax = Math.min(scrollY * 0.38, 70);

  return (
    <div style={{ minHeight: '100vh', background: '#0d0e1a' }}>
      <style>{`
        @keyframes tabIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tab-visible { animation: tabIn 0.22s ease forwards; }
        .tab-hidden  { opacity: 0; pointer-events: none; }
        .nav-link-home { font-size: 13px; color: rgba(255,255,255,0.38); text-decoration: none; transition: color 0.15s; }
        .nav-link-home:hover { color: rgba(255,255,255,0.72); }
      `}</style>

      {/* ── 상단 네비게이션 ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 60,
        background: 'rgba(13,14,26,0.97)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
        padding: '0 36px',
      }}>
        {/* 로고 */}
        <span style={{
          fontSize: 17, fontWeight: 800, letterSpacing: 3,
          background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          fontFamily: 'Space Grotesk, monospace',
          flexShrink: 0,
        }}>ASH LAB.</span>

        {/* 중앙 탭 메뉴 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  height: 60, padding: '0 22px',
                  background: 'none', border: 'none',
                  borderBottom: active ? '2px solid #7c4dff' : '2px solid transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 15 }}>{tab.icon}</span>
                <span style={{
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  ...(active
                    ? { background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                    : { color: 'rgba(255,255,255,0.48)' }),
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 우측 홈 링크 */}
        <a href="/" className="nav-link-home" style={{ flexShrink: 0 }}>
          ashlab.co.kr
        </a>
      </nav>

      {/* ── 히어로 배너 ── */}
      <div style={{ position: 'relative', height: 200, marginTop: 60, overflow: 'hidden' }}>
        {/* 배경 이미지 (어두운 처리 + parallax) */}
        <div style={{
          position: 'absolute', inset: '-50px 0',
          backgroundImage: 'url(/senator.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: `center calc(50% + ${parallax}px)`,
          filter: 'brightness(0.16) blur(1.5px)',
          transform: 'scale(1.06)',
          willChange: 'background-position',
        }} />
        {/* 수평 페이드 오버레이 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(13,14,26,0.9) 0%, rgba(13,14,26,0.45) 55%, rgba(13,14,26,0.08) 100%)',
        }} />
        {/* 하단 페이드 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(13,14,26,0.75) 100%)',
        }} />

        {/* 히어로 콘텐츠 */}
        <div style={{
          position: 'relative', zIndex: 1,
          height: '100%', maxWidth: 1200, margin: '0 auto',
          padding: '0 44px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* 좌측 텍스트 */}
          <div>
            <div style={{
              fontSize: 38, fontWeight: 800, letterSpacing: 5,
              background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              marginBottom: 10, fontFamily: 'Space Grotesk, monospace', lineHeight: 1,
            }}>ASH LAB.</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', letterSpacing: 0.8 }}>
              안상훈 의원실 스마트워크 플랫폼
            </div>
          </div>

          {/* 우측 사진 */}
          <img
            src="/senator.jpg"
            alt="안상훈 의원"
            style={{
              width: 152, height: 152,
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center top',
              border: '3px solid rgba(79,99,210,0.55)',
              boxShadow: '0 0 48px rgba(79,99,210,0.28), 0 0 0 6px rgba(79,99,210,0.08)',
              transform: `translateY(${-parallax * 0.12}px)`,
              transition: 'transform 0.05s linear',
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div
        className={contentVisible ? 'tab-visible' : 'tab-hidden'}
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 44px 80px' }}
      >
        <ActiveComponent />
      </div>
    </div>
  );
}
