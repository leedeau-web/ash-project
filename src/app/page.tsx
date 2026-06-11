'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push('/app'), 5000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0d0e1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes zoomClear {
          0%   { transform: translate(-50%, -50%) scale(0.28); filter: blur(30px); opacity: 0; }
          50%  { opacity: 0.38; }
          100% { transform: translate(-50%, -50%) scale(1); filter: blur(2px); opacity: 0.35; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .intro-photo {
          animation: zoomClear 3.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .intro-title {
          animation: fadeUp 1s ease forwards;
          animation-delay: 1.4s;
          opacity: 0;
        }
        .intro-sub {
          animation: fadeUp 1s ease forwards;
          animation-delay: 2.1s;
          opacity: 0;
        }
        .intro-skip {
          animation: fadeUp 0.8s ease forwards;
          animation-delay: 3s;
          opacity: 0;
        }
      `}</style>

      {/* 배경 사진: 화면 절반 크기 원형, 반투명 */}
      <img
        className="intro-photo"
        src="/senator.jpg"
        alt=""
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 'min(62vw, 62vh)',
          height: 'min(62vw, 62vh)',
          borderRadius: '50%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 0,
        }}
      />

      {/* 텍스트 레이어: 사진 위에 중앙 정렬 */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16,
        textAlign: 'center',
      }}>
        <h1
          className="intro-title"
          style={{
            fontSize: 54, fontWeight: 800, letterSpacing: 6,
            background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 24px rgba(79,99,210,0.6))',
          }}
        >
          ASH LAB
        </h1>

        <p
          className="intro-sub"
          style={{
            fontSize: 15,
            color: 'rgba(240,241,255,0.78)',
            letterSpacing: 1.5,
            fontFamily: 'inherit',
            textShadow: '0 0 16px rgba(13,14,26,0.9), 0 0 32px rgba(13,14,26,0.7)',
          }}
        >
          안상훈 의원실 스마트워크 플랫폼
        </p>
      </div>

      {/* 건너뛰기 */}
      <button
        className="intro-skip"
        onClick={() => router.push('/app')}
        style={{
          position: 'absolute', bottom: 38,
          background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.26)', fontSize: 13,
          cursor: 'pointer', letterSpacing: 0.6,
          fontFamily: 'inherit',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.26)')}
      >
        건너뛰기
      </button>
    </div>
  );
}
