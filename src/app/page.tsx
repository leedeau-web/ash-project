'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const NewsCommentTab = dynamic(() => import('./tabs/NewsCommentTab'), { ssr: false });
const CardNewsTab = dynamic(() => import('./tabs/CardNewsTab'), { ssr: false });

// ── 탭 정의 ──────────────────────────────────────────────────────────────
// 새 탭 추가 시 여기에만 추가하면 됩니다
const TABS = [
  {
    id: 'news-comment',
    icon: '📰',
    label: '뉴스 댓글 분석',
    component: NewsCommentTab,
    badge: null,
  },
  {
    id: 'card-news',
    icon: '🗞️',
    label: '카드뉴스 제작',
    component: CardNewsTab,
    badge: null,
  },
] as const;

type TabId = typeof TABS[number]['id'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('news-comment');

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component ?? NewsCommentTab;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── 사이드바 ── */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        zIndex: 100,
        boxShadow: '2px 0 16px rgba(79,99,210,0.06)',
      }}>
        {/* 로고 */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#fff', fontWeight: 700,
              flexShrink: 0,
            }}>A</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--accent)', fontFamily: 'Space Grotesk, monospace' }}>ASH</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 0.5 }}>PROJECT</div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5, padding: '4px 10px 10px', fontWeight: 600 }}>
            MENU
          </div>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, border: 'none',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text2)',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', marginBottom: 2,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                <span style={{ flex: 1 }}>{tab.label}</span>
                {tab.badge && (
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontWeight: 700 }}>
                    {tab.badge}
                  </span>
                )}
                {isActive && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />}
              </button>
            );
          })}

        </nav>

        {/* 하단 버전 */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'Space Grotesk, monospace' }}>v1.0.0</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Powered by Claude AI</div>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div style={{ marginLeft: 220, minHeight: '100vh' }}>
        {/* 상단 헤더 */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(245,246,250,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
              {TABS.find(t => t.id === activeTab)?.icon}{' '}
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
        </header>

        {/* 탭 컨텐츠 */}
        <main style={{ padding: '0 32px 48px' }}>
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
