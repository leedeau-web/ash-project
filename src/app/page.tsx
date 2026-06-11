'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push('/app'), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0d0e1a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes zoomClear {
          0%   { transform: scale(0.32); filter: blur(28px); opacity: 0; }
          55%  { filter: blur(0px); opacity: 1; }
          100% { transform: scale(1);   filter: blur(0px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .intro-photo {
          animation: zoomClear 3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .intro-title {
          animation: fadeUp 1s ease forwards;
          animation-delay: 1.3s;
          opacity: 0;
        }
        .intro-sub {
          animation: fadeUp 1s ease forwards;
          animation-delay: 2s;
          opacity: 0;
        }
        .intro-skip {
          animation: fadeUp 0.8s ease forwards;
          animation-delay: 2.8s;
          opacity: 0;
        }
      `}</style>

      {/* 사진 */}
      <div className="intro-photo" style={{ marginBottom: 30 }}>
        <img
          src="/senator.jpg"
          alt="안상훈 의원"
          style={{
            width: 150, height: 150,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid rgba(79,99,210,0.45)',
            boxShadow: '0 0 52px rgba(79,99,210,0.32), 0 0 100px rgba(124,77,255,0.12)',
          }}
        />
      </div>

      {/* 로고 */}
      <h1
        className="intro-title"
        style={{
          fontSize: 46, fontWeight: 800, letterSpacing: 5,
          background: 'linear-gradient(135deg, #4f63d2, #7c4dff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 14,
        }}
      >
        ASH LAB.
      </h1>

      {/* 서브텍스트 */}
      <p
        className="intro-sub"
        style={{
          fontSize: 15,
          color: 'rgba(240,241,255,0.52)',
          letterSpacing: 1.2,
          fontFamily: 'inherit',
        }}
      >
        안상훈 의원실 스마트워크 플랫폼
      </p>

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
