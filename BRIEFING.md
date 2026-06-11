# ASH PROJECT — BRIEFING.md
> 새 채팅창에서 이 파일을 첨부하면 Claude가 프로젝트 전체를 즉시 파악합니다.

---

## 프로젝트 개요

**ASH Project**는 사무실 업무 통합 플랫폼 (Next.js 14 웹앱)
- **로컬 실행**: `cd C:\Users\User\ash-project\ash-project` → `npm run dev` → http://localhost:3000
- **배포 URL**: https://ash-project-ten.vercel.app
- **GitHub**: https://github.com/leedeau-web/ash-project
- **배포 방법**: `git add . && git commit -m "메시지" && git push` → Vercel 자동 재배포
- **환경변수**: `ANTHROPIC_API_KEY` (Vercel 대시보드 + 로컬 `.env.local`)

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| Framework | Next.js 14 (App Router) |
| 언어 | TypeScript |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| 스타일 | Tailwind CSS + 커스텀 CSS 변수 (라이트 테마) |
| 크롤링 | fetch + cheerio (서버사이드 API Routes) |
| 배포 | Vercel (단일 프로젝트, 별도 백엔드 없음) |
| 폰트 | Paperlogy (1~9 웨이트), Noto Sans KR, Space Grotesk |

---

## 프로젝트 구조

```
ash-project/
├── public/
│   ├── card-bg.png              ← 카드뉴스 배경 (1080x1440px, 카드+헤더 합성됨)
│   └── fonts/
│       ├── Paperlogy-4Regular.ttf
│       ├── Paperlogy-5Medium.ttf
│       ├── Paperlogy-7Bold.ttf
│       └── ...
├── src/app/
│   ├── page.tsx                 ← 메인 레이아웃 (사이드바 + 탭 라우터)
│   ├── layout.tsx
│   ├── globals.css              ← 라이트 테마, CSS 변수, 슬라이더 스타일
│   ├── tabs/
│   │   ├── NewsCommentTab.tsx   ← 뉴스 댓글 분석 탭
│   │   └── CardNewsTab.tsx      ← 카드뉴스 제작 탭
│   └── api/
│       ├── scrape/route.ts      ← 12개 언론사 댓글 크롤링
│       ├── analyze/route.ts     ← 단일 기사 AI 분석
│       └── analyze-bulk/route.ts ← 복수 기사 AI 분석
```

---

## 탭 1: 뉴스 댓글 분석 (NewsCommentTab.tsx)

### 기능
- URL 1개 이상 입력 → 댓글 수집 → AI 분석 자동 실행 (버튼 1개)
- 단일 기사: `/api/analyze` 호출
- 복수 기사(2개+): 각각 `/api/scrape` 순차 호출 → `/api/analyze-bulk`
- 실패한 URL 건너뛰고 계속 진행, 진행률 표시

### 결과 표시
- 긍정/부정 개수 + 비율 카드
- 긍정/부정 프로그레스바
- 주요 긍정/부정 단어 5개씩 (뱃지)
- 주요 긍정/부정 댓글 5개씩 (2열)
- 복수 기사: 기사별 요약 테이블 (언론사/제목/댓글수/긍정%/부정%)

### 분석 기준
- 긍정/부정 **2분류만** (중립 없음)
- 모든 댓글 반드시 둘 중 하나로 분류
- positiveCount + negativeCount = totalCount (100% 일치)

### 지원 언론사 (12개)
| 키 | 언론사 | 도메인 |
|----|--------|--------|
| chosun | 조선일보 | chosun.com |
| joongang | 중앙일보 | joongang.co.kr |
| hani | 한겨레 | hani.co.kr |
| khan | 경향신문 | khan.co.kr |
| donga | 동아일보 | donga.com |
| munhwa | 문화일보 | munhwa.com |
| sedaily | 서울경제 | sedaily.com |
| seoul | 서울신문 | seoul.co.kr |
| mk | 매일경제 | mk.co.kr |
| hankyung | 한국경제 | hankyung.com |
| ohmynews | 오마이뉴스 | ohmynews.com |
| hankookilbo | 한국일보 | hankookilbo.com |

### 크롤링 방식
각 언론사별 내부 API 우선 호출 → 실패 시 HTML cheerio 파싱 fallback
언론사 API가 바뀌면 `scrape/route.ts`의 `scrapeXXX()` 함수 수정

---

## 탭 2: 카드뉴스 제작 (CardNewsTab.tsx)

### 기능
- 날짜/제목/본문 입력 → canvas 실시간 미리보기 → PNG 다운로드
- 슬라이드 여러 장 제작 가능 (+ 추가 버튼)
- 전체 다운로드: slide_1.png, slide_2.png ... 순서대로 개별 다운로드

### 레이아웃 (실측값 기반, 1080x1440px)
```
배경사진(card-bg.png): 1080x1440px
- 카드(흰색 라운드), 헤더(프로필+안상훈의 툭!Talk!), @ahnsanghoon_official 이미 합성됨
- canvas에서 별도로 그리지 않음

날짜 텍스트:
- x=281, y=340
- 폰트: Paperlogy-4Regular 26px, 색상: #1a1a1a

슬라이드 1 제목:
- 시작 x=150, y=490
- 폰트: Paperlogy-7Bold 38px Bold, 색상: #1a1a1a

본문 텍스트:
- 슬라이드 1: 제목 끝 y + 50 + bodyOffsetY
- 슬라이드 2+: y=490 + bodyOffsetY
- 폰트: Paperlogy-4Regular 38px, 색상: #1a1a1a
- maxWidth: 751px (x=150~901)
- 양끝정렬 (글자 단위, 마지막 줄 좌측정렬)
- 카드 하단(y=1252) 초과 시 빨간 경고선
```

### 슬라이드별 독립 설정값
| 설정 | 기본값 | 범위 | step |
|------|--------|------|------|
| lineHeight (줄간격) | 70 | 40~120 | 1 |
| letterSpacing (자간) | 0 | -3~3 | 0.1 |
| bodyOffsetY (본문위치) | 0 | -100~300 | 1 |

### UI 구조 (좌우 2열)
- 좌측 40%: 날짜입력 + 슬라이드별 설정(슬라이더+[-][+]버튼) + 슬라이드탭 + 제목/본문입력
- 우측 60%: canvas 미리보기 (축소 표시)

### 렌더링 최적화
- `requestAnimationFrame`으로 렌더링 스케줄링
- 배경 이미지 캐싱 (`imgCache`, `bgImageRef`)
- 폰트 최초 1회만 로드 (`fontsLoaded` 플래그)

---

## 레이아웃 (page.tsx)

- 좌측 220px 고정 사이드바 (숨기기/보이기 토글 버튼 포함)
- 사이드바 토글: 좌측 중앙 `◀▶` 버튼, transition 0.3s
- TABS 배열로 탭 확장 가능

### 새 탭 추가 방법 (3단계)
```typescript
// 1. src/app/tabs/MyTab.tsx 생성
// 2. page.tsx 상단에:
const MyTab = dynamic(() => import('./tabs/MyTab'), { ssr: false });
// 3. TABS 배열에:
{ id: 'my-tab', icon: '🔧', label: '새 기능', component: MyTab, badge: null }
```

---

## 디자인 시스템 (globals.css)

```css
--bg: #f5f6fa        /* 페이지 배경 */
--surface: #ffffff   /* 카드 배경 */
--accent: #4f63d2    /* 인디고 (주요 색상) */
--accent2: #7c4dff   /* 퍼플 (보조 색상) */
--pos: #16a34a       /* 긍정 (그린) */
--neg: #dc2626       /* 부정 (레드) */
--text: #1a1f36      /* 본문 텍스트 */
--muted: #8892b0     /* 보조 텍스트 */
```

공통 클래스: `.card`, `.card-flat`, `.btn-primary`, `.btn-ghost`, `.fade-up`, `.pulse-slow`

---

## 알려진 이슈 및 주의사항

1. **언론사 API 변경**: 언론사가 내부 API 구조 바꾸면 `scrape/route.ts` 수정 필요
   - 브라우저 DevTools → Network 탭 → XHR 필터 → 댓글 관련 요청 URL 확인
2. **로그인 필요 댓글**: 수집 불가 (공개 댓글만)
3. **Vercel 타임아웃**: 기본 10초. 댓글 많으면 느릴 수 있음
4. **카드뉴스 배경**: `public/card-bg.png`에 카드+헤더+@ 모두 합성됨. canvas에서 별도 그리기 금지
5. **폰트 파일**: `public/fonts/`에 반드시 있어야 함 (Paperlogy TTF)
6. **API 비용**: 분석 1회 약 $0.003 (Claude Sonnet 기준)

---

## 자주 쓰는 Claude Code 명령어

```bash
# 로컬 실행
cd C:\Users\User\ash-project\ash-project && npm run dev

# Vercel 배포
git add . && git commit -m "업데이트" && git push

# 의존성 설치
npm install

# 자동 승인 모드
claude --dangerously-skip-permissions
```

---

*이 파일을 새 채팅창에 첨부하면 Claude가 ASH Project 전체를 즉시 이해합니다.*
