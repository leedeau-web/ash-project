'use client';

import { useEffect, useState } from 'react';

type ToolTabId = 'news-comment' | 'card-news' | 'morning-brief';

interface HomeTabProps {
  onNavigate: (tab: ToolTabId) => void;
}

const FEATURES: { id: ToolTabId; icon: string; title: string; desc: string }[] = [
  {
    id: 'news-comment',
    icon: '💬',
    title: '뉴스 댓글 분석',
    desc: '조선·중앙·한겨레 등 12개 언론사 기사 댓글을 자동 수집하고 Claude AI가 긍정·부정 여론을 분석합니다.',
  },
  {
    id: 'card-news',
    icon: '📇',
    title: '카드뉴스 제작',
    desc: '텍스트 입력만으로 1080×1440 고해상도 카드뉴스를 즉시 생성합니다. 슬라이드별 PNG 다운로드 지원.',
  },
  {
    id: 'morning-brief',
    icon: '📰',
    title: '조간스크랩 요약',
    desc: '복지부 조간 신문 스크랩 PDF를 업로드하면 보건의료·사회복지·사설 분야별로 핵심 기사를 자동 정리합니다.',
  },
];

export default function HomeTab({ onNavigate }: HomeTabProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      paddingTop: 52,
      paddingBottom: 80,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>
      <div style={{
        display: 'flex',
        gap: 64,
        alignItems: 'flex-start',
      }}>

        {/* ── 좌측 콘텐츠 ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* 큰따옴표 슬로건 */}
          <div style={{
            fontSize: 30,
            fontWeight: 800,
            lineHeight: 1.45,
            marginBottom: 30,
            background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            wordBreak: 'keep-all',
          }}>
            "업무는 스마트하게,<br />정책은 더 깊이 있게."
          </div>

          {/* 소개 텍스트 */}
          <p style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.95,
            marginBottom: 44,
            maxWidth: 560,
            wordBreak: 'keep-all',
          }}>
            ASH LAB(안상훈 연구소)은 국회 안상훈 의원실의 AX(AI Transformation)를 선도하는 디지털
            허브로서 보좌진의 반복적인 통상 업무를 획기적으로 줄이기 위해 탄생한 스마트 워크
            플랫폼입니다. 뉴스 댓글 분석부터 카드뉴스 제작, 조간스크랩 요약 등 Claude AI를 기반으로
            최적화된 업무 툴을 통해 의원실의 역량을 오직 정책 연구와 국민을 위해 집중하게 만듭니다.
          </p>

          {/* 기능 카드 3개 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {FEATURES.map(f => (
              <button
                key={f.id}
                onClick={() => onNavigate(f.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 18,
                  padding: '18px 22px',
                  background: '#1e2140',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(79,99,210,0.5)';
                  e.currentTarget.style.background = 'rgba(79,99,210,0.09)';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.background = '#1e2140';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{
                  fontSize: 28,
                  width: 48, height: 48, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(79,99,210,0.18), rgba(124,77,255,0.18))',
                  borderRadius: 12,
                }}>{f.icon}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 5 }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 1.55, wordBreak: 'keep-all' }}>
                    {f.desc}
                  </div>
                </div>

                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, flexShrink: 0 }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 우측 의원 사진 ── */}
        <div style={{
          flexShrink: 0,
          width: 320,
          position: 'sticky',
          top: 80,
        }}>
          <div style={{
            width: '100%',
            height: 500,
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <img
              src="/senator.jpg"
              alt="안상훈 의원"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block',
              }}
            />
            {/* 하단 그라디언트 페이드 */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '45%',
              background: 'linear-gradient(180deg, transparent 0%, #0d0e1a 100%)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>

      </div>
    </div>
  );
}
