# AC'SCENT - AI 향수 추천 프로그램

K-pop/Celebrity 이미지 기반 향수 추천 웹 애플리케이션

## 시작하기

### 환경 변수 설정

1. `.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하세요:

```bash
cp .env.local.example .env.local
```

2. `.env.local` 파일을 열고 Gemini API 키를 입력하세요:

```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어서 확인하세요.

## 기술 스택

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **AI Model**: Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Export**: html2canvas

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router
├── components/       # React 컴포넌트
├── lib/             # 라이브러리 및 유틸리티
└── types/           # TypeScript 타입 정의
```

## 라이센스

ISC
