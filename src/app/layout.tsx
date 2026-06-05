import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ASH Project',
  description: '사무실 업무 통합 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
