# ASH Project — 뉴스 댓글 여론 분석기

한국 주요 언론사 11개의 기사 댓글을 자동 수집하고 Claude AI로 여론을 분석하는 웹앱입니다.

## 지원 언론사

조선일보 · 중앙일보 · 한겨레 · 경향신문 · 동아일보
문화일보 · 서울경제 · 서울신문 · 매일경제 · 한국경제 · 오마이뉴스

## 빠른 시작

```bash
npm install
cp .env.example .env.local
# .env.local 에 ANTHROPIC_API_KEY 입력
npm run dev
```
→ http://localhost:3000

## Vercel 배포

1. GitHub에 push
2. vercel.com → New Project → 저장소 선택
3. Environment Variables → `ANTHROPIC_API_KEY` 추가
4. Deploy

## 기술 스택

Next.js 14 · TypeScript · Recharts · Tailwind · Anthropic Claude API

---

*Claude Code 작업 지침은 `claude_prompt.txt` 참조*
