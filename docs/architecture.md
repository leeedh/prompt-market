# 아키텍처 문서

## 현재 구조 (리팩토링 전)

### 라우팅 구조
- **중복 라우팅 문제**: `app/...`와 `app/[locale]/...`에 동일한 페이지가 중복 존재
  - `app/page.tsx` ↔ `app/[locale]/page.tsx`
  - `app/login/page.tsx` ↔ `app/[locale]/login/page.tsx`
  - `app/my-page/page.tsx` ↔ `app/[locale]/my-page/page.tsx`
  - `app/prompt/[id]/page.tsx` ↔ `app/[locale]/prompt/[id]/page.tsx`
  - `app/admin/*` ↔ `app/[locale]/admin/*`
  - `app/checkout/page.tsx` ↔ `app/[locale]/checkout/page.tsx`
  - `app/cart/page.tsx` ↔ `app/[locale]/cart/page.tsx`
  - `app/profile/page.tsx` ↔ `app/[locale]/profile/page.tsx`

### 폴더 구조
```
/app
  /[locale]          # 국제화된 라우트 (next-intl)
    /admin
    /cart
    /checkout
    /login
    /my-page
    /profile
    /prompt/[id]
    layout.tsx
    page.tsx
  /admin             # 중복 라우트 (제거 예정)
  /cart              # 중복 라우트 (제거 예정)
  /checkout          # 중복 라우트 (제거 예정)
  /login             # 중복 라우트 (제거 예정)
  /my-page           # 중복 라우트 (제거 예정)
  /profile           # 중복 라우트 (제거 예정)
  /prompt/[id]       # 중복 라우트 (제거 예정)
  globals.css
  loading.tsx
  page.tsx           # 중복 라우트 (제거 예정)

/hooks
  /use-auth.tsx      # Zustand store (이동 예정: features/auth/store)
  /use-cart.tsx      # Zustand store (이동 예정: features/cart/store)
  /use-mobile.ts     # UI hook (이동 예정: shared/hooks)
  /use-toast.ts      # UI hook (이동 예정: shared/hooks)

/lib
  /utils.ts          # 범용 유틸리티

/components
  /ui                # shadcn/ui 컴포넌트
  /locale-switcher.tsx
  /mode-toggle.tsx
  /theme-provider.tsx

/i18n
  /routing.ts        # next-intl 라우팅 설정
  /request.ts        # next-intl 요청 설정

/messages
  /ko.json           # 한국어 번역
  /en.json           # 영어 번역
```

### 데이터 저장
- **현재**: localStorage 직접 접근 (페이지 컴포넌트에서 직접 호출)
- **문제점**: 
  - 스토리지 접근이 여러 곳에 분산
  - 향후 Supabase/API로 교체 시 대규모 수정 필요
  - 테스트 어려움

### 상태 관리
- **Zustand** 사용
- **문제점**: 
  - Store가 `hooks/` 폴더에 위치 (구조적 혼동)
  - 기능별로 분리되지 않음

### 페이지 구조
- **문제점**: 
  - "God Page" 문제: `my-page/page.tsx` (36k 라인), `prompt/[id]/page.tsx` (31k 라인)
  - UI/상태/스토리지/비즈니스 로직이 한 파일에 혼재
  - `"use client"`가 페이지 레벨에 광범위하게 적용

---

## 목표 구조 (리팩토링 후)

### 라우팅 구조
- **단일 소스**: `app/[locale]/...`만 유지
- **non-locale 라우트**: 제거 또는 기본 로케일로 redirect 전용

### 폴더 구조 (Features 중심)
```
/app
  /[locale]
    /(site)              # Route group for public pages
      page.tsx
      login/page.tsx
      my-page/page.tsx
      prompt/[id]/page.tsx
      checkout/page.tsx
      cart/page.tsx
      profile/page.tsx
    /(admin)             # Route group for admin pages
      admin/page.tsx
      admin/prompts/page.tsx
    layout.tsx

/features
  /auth
    /domain              # 타입/도메인 모델 (User, Session)
    /repositories        # 데이터 접근 (AuthRepository)
    /services            # 유스케이스 (login, logout, signup)
    /store               # Zustand store (authStore)
    /components          # UI 컴포넌트
  /cart
    /domain
    /repositories
    /services
    /store
    /components
  /prompts
    /domain
    /repositories
    /services
    /store
    /components
  /purchases
    /domain
    /repositories
    /services
    /store
    /components

/shared
  /ui                   # shadcn wrapper (필요 시)
  /lib
    /storage            # StorageClient (localStorage 추상화)
    /date               # 날짜 유틸
    /format             # 포맷팅 유틸
    /env                # 환경 변수
  /hooks                # 진짜 UI hook만 (use-mobile, use-toast)
  /types                # 공통 타입
  /constants            # 상수

/components
  /ui                   # shadcn/ui 컴포넌트
  /locale-switcher.tsx
  /mode-toggle.tsx
  /theme-provider.tsx
```

### 데이터 저장 (Repository 패턴)
- **StorageClient**: localStorage 추상화 레이어
- **Repository**: 각 feature별 repository (localStorage → 향후 API로 교체 가능)
- **Service**: 비즈니스 로직 (Repository 사용)

### 상태 관리
- **Store 위치**: `features/<feature>/store/`
- **Hook은 진짜 hook만**: `shared/hooks/` 또는 `features/<feature>/hooks/`

### 페이지 구조
- **Page**: 라우팅 파라미터/메타/레이아웃 조립만 (80~150줄 내)
- **Container**: 상태 연결, 서비스 호출 (`features/<feature>/components/*Container.tsx`)
- **View**: 순수 UI (`features/<feature>/components/*View.tsx`)

---

## 리팩토링 단계

### Phase 0: 기준선 확보 ✅
- [x] architecture.md 생성
- [ ] 스모크 체크 정의

### Phase 1: 라우팅 중복 제거
- [ ] non-locale 라우트 제거
- [ ] `/` 접근 시 기본 로케일로 redirect

### Phase 2: 폴더 구조 재편
- [ ] features 폴더 생성
- [ ] hooks → features/shared로 이동
- [ ] store 분리

### Phase 3: localStorage 접근 중앙화
- [ ] StorageClient 구현
- [ ] Repository 패턴 도입
- [ ] 페이지에서 localStorage 직접 접근 제거

### Phase 4: God Page 해체
- [ ] my-page 분해
- [ ] prompt/[id] 분해
- [ ] admin/checkout 분해

### Phase 5: 서버/클라이언트 경계 재정리
- [ ] 서버 컴포넌트 최대화
- [ ] 클라이언트 컴포넌트 최소화

### Phase 6: 품질 게이트 확립
- [ ] ESLint 설정 강화
- [ ] Prettier 추가
- [ ] 커밋 훅 설정

---

## 스모크 체크 (동작 유지 확인)

다음 경로들이 정상 동작해야 함:
- `/ko` (메인 페이지)
- `/ko/login` (로그인)
- `/ko/my-page` (구매 내역)
- `/ko/prompt/:id` (프롬프트 상세)
- `/ko/admin/prompts` (관리자)
- `/ko/checkout` (결제)
- `/ko/cart` (장바구니)
- `/ko/profile` (프로필)

