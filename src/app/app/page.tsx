'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const HomeTab         = dynamic(() => import('../tabs/HomeTab'),         { ssr: false });
const NewsCommentTab  = dynamic(() => import('../tabs/NewsCommentTab'),  { ssr: false });
const CardNewsTab     = dynamic(() => import('../tabs/CardNewsTab'),     { ssr: false });
const MorningBriefTab = dynamic(() => import('../tabs/MorningBriefTab'), { ssr: false });

type TabId = 'home' | 'news-comment' | 'card-news' | 'morning-brief';

const NAV_TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'home',          icon: '🏠', label: 'ASH LAB' },
  { id: 'news-comment',  icon: '💬', label: '뉴스 댓글 분석' },
  { id: 'card-news',     icon: '📇', label: '카드뉴스 제작' },
  { id: 'morning-brief', icon: '📰', label: '조간스크랩 요약' },
];

const PASSWORD = '0917';

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw]       = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (pw === PASSWORD) {
      localStorage.setItem('ash-auth', 'true');
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0d0e1a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'inherit',
    }}>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60%  { transform: translateX(-8px); }
          40%,80%  { transform: translateX(8px); }
        }
        .lock-shake { animation: shake 0.45s ease; }
      `}</style>

      {/* 로고 */}
      <div style={{
        fontSize: 32, fontWeight: 800, letterSpacing: 4, marginBottom: 10,
        background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        fontFamily: 'Space Grotesk, monospace',
      }}>ASH LAB</div>

      {/* 서브텍스트 */}
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 40, letterSpacing: 0.5 }}>
        안상훈 의원실 전용 플랫폼입니다
      </div>

      {/* 입력 폼 */}
      <div className={shake ? 'lock-shake' : ''} style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="비밀번호 입력"
          autoFocus
          style={{
            width: '100%', padding: '14px 18px',
            borderRadius: 12, fontSize: 16, textAlign: 'center',
            border: `1.5px solid ${error ? '#f87171' : 'rgba(255,255,255,0.15)'}`,
            background: '#1e2140', color: '#fff',
            outline: 'none', letterSpacing: 6,
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = '#4f63d2'; }}
          onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        />

        {error && (
          <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginTop: -4 }}>
            비밀번호가 올바르지 않습니다
          </div>
        )}

        <button
          onClick={submit}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
            color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default function AppPage() {
  const [unlocked, setUnlocked]             = useState(false);
  const [activeTab, setActiveTab]           = useState<TabId>('home');
  const [contentVisible, setContentVisible] = useState(true);
  const [scrollY, setScrollY]               = useState(0);
  const [isMobile, setIsMobile]             = useState(false);

  useEffect(() => {
    if (localStorage.getItem('ash-auth') === 'true') setUnlocked(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const parallax = Math.min(scrollY * 0.38, 70);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':          return <HomeTab onNavigate={switchTab} />;
      case 'news-comment':  return <NewsCommentTab />;
      case 'card-news':     return <CardNewsTab />;
      case 'morning-brief': return <MorningBriefTab />;
    }
  };

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

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
        padding: isMobile ? '0 14px' : '0 36px',
      }}>
        {/* 로고 */}
        <span
          onClick={() => window.location.reload()}
          style={{
            fontSize: isMobile ? 13 : 17,
            fontWeight: 800,
            letterSpacing: isMobile ? 2 : 3,
            background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            fontFamily: 'Space Grotesk, monospace',
            flexShrink: 0, cursor: 'pointer',
          }}
        >ASH LAB</span>

        {/* 중앙 탭 메뉴 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {NAV_TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: isMobile ? 0 : 7,
                  height: 60,
                  padding: isMobile ? '0 10px' : '0 20px',
                  background: 'none', border: 'none',
                  borderBottom: active ? '2px solid #7c4dff' : '2px solid transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: isMobile ? 19 : 15 }}>{tab.icon}</span>
                {/* 모바일에서 텍스트 숨김 */}
                {!isMobile && (
                  <span style={{
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    ...(active
                      ? { background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                      : { color: 'rgba(255,255,255,0.7)' }),
                  }}>
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 우측 홈 링크 — 모바일 숨김 */}
        {!isMobile && (
          <a href="/" className="nav-link-home" style={{ flexShrink: 0 }}>ashlab.co.kr</a>
        )}
      </nav>

      {/* ── 히어로 배너 ── */}
      <div style={{
        position: 'relative',
        height: isMobile ? 100 : 160,
        marginTop: 60,
        overflow: 'hidden',
      }}>
        {/* 배경 이미지 */}
        <div style={{
          position: 'absolute', inset: '-40px 0',
          backgroundImage: 'url(/senator.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: `center calc(50% + ${parallax}px)`,
          filter: 'brightness(0.12) blur(2px)',
          transform: 'scale(1.06)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,14,26,0.72)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(13,14,26,0.85) 100%)' }} />

        {/* 텍스트 */}
        <div style={{
          position: 'relative', zIndex: 1,
          height: '100%', maxWidth: 1200, margin: '0 auto',
          padding: isMobile ? '0 20px' : '0 44px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: isMobile ? 22 : 34,
            fontWeight: 800,
            letterSpacing: isMobile ? 2 : 5,
            background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: isMobile ? 4 : 8,
            fontFamily: 'Space Grotesk, monospace', lineHeight: 1,
          }}>ASH LAB</div>
          <div style={{
            fontSize: isMobile ? 11 : 13,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: 0.8,
          }}>
            안상훈 의원실 스마트워크 플랫폼
          </div>
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div
        className={contentVisible ? 'tab-visible' : 'tab-hidden'}
        style={{
          maxWidth: 1200, margin: '0 auto',
          padding: isMobile ? '0 16px 60px' : '0 44px 80px',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
