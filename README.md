# Prompt Market

AI 프롬프트를 판매하고 구매할 수 있는 온라인 마켓플레이스입니다.

## 🚀 주요 기능

- **프롬프트 브라우징**: 카테고리, 태그, 검색을 통한 프롬프트 탐색
- **장바구니**: 원하는 프롬프트를 담아 한 번에 결제
- **사용자 프로필**: 계정 관리 및 구매 내역 확인
- **관리자 페이지**: 프롬프트 등록 및 관리

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Authentication**: Clerk
- **Database**: Supabase (향후 마이그레이션 예정)
- **Deployment**: Vercel

## 📦 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

## 📁 프로젝트 구조

```
prompt-store-website/
├── app/              # Next.js App Router 페이지
├── components/       # 재사용 가능한 컴포넌트
├── features/         # 기능별 모듈 (auth, cart, prompts 등)
├── lib/              # 유틸리티 함수
├── docs/             # 문서
└── public/           # 정적 파일
```

## 🔗 링크

- **GitHub**: https://github.com/leeedh/prompt-market
- **Vercel**: 자동 배포 연동

## 📝 라이선스

Private

