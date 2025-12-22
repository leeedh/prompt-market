# Clerk 설정 가이드

이 문서는 Next.js 프로젝트에 Clerk 인증을 통합하는 방법을 설명합니다.

## 📋 목차

1. [Clerk 계정 생성 및 프로젝트 설정](#1-clerk-계정-생성-및-프로젝트-설정)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [사용 방법](#4-사용-방법)
5. [다음 단계](#5-다음-단계)

## 1. Clerk 계정 생성 및 프로젝트 설정

### 1.1 Clerk 계정 생성 및 애플리케이션 생성

1. [Clerk 공식 사이트](https://clerk.com)에 접속하여 계정을 생성합니다.
2. 새 애플리케이션을 생성합니다.
3. 애플리케이션이 생성되면 대시보드로 이동합니다.

### 1.2 API 키 확인

1. Clerk 대시보드에서 **API Keys** 메뉴로 이동합니다: https://dashboard.clerk.com/last-active?path=api-keys
2. 다음 정보를 확인합니다:
   - **Publishable Key**: `pk_test_...` 또는 `pk_live_...` 형식
   - **Secret Key**: `sk_test_...` 또는 `sk_live_...` 형식

## 2. 환경 변수 설정

### 2.1 .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# Clerk 인증 설정
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY

# Supabase 설정 (선택적 - 데이터베이스로만 사용하는 경우)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# 사이트 URL (선택적)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**중요:**
- `YOUR_PUBLISHABLE_KEY`를 위에서 확인한 Publishable Key로 교체하세요.
- `YOUR_SECRET_KEY`를 위에서 확인한 Secret Key로 교체하세요.
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함되어 있습니다).
- 실제 키 값은 절대 코드나 문서에 포함하지 마세요.

### 2.2 환경 변수 확인

환경 변수가 제대로 설정되었는지 확인하려면:

```bash
# 개발 서버 재시작
pnpm dev
```

## 3. 프로젝트 구조

Clerk 통합을 위해 다음 파일들이 생성/수정되었습니다:

```
├── proxy.ts                    # Clerk 미들웨어 설정
├── app/
    └── [locale]/
        └── layout.tsx          # ClerkProvider 래핑 (한국어 localization 포함)
```

### 3.1 한국어 Localization

Clerk 컴포넌트는 한국어로 자동 표시됩니다:

- `@clerk/localizations` 패키지를 사용하여 한국어 localization 적용
- 로케일에 따라 자동으로 한국어(`ko`) 또는 영어(`en`) 선택
- SignIn, SignUp, UserButton 등 모든 Clerk 컴포넌트가 한국어로 표시됩니다

## 4. 사용 방법

### 4.1 Clerk 컴포넌트 사용

Clerk는 다양한 React 컴포넌트를 제공하며, 한국어로 자동 표시됩니다:

```tsx
'use client'

import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'

export default function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  )
}
```

**참고:** 모든 Clerk 컴포넌트는 `app/[locale]/layout.tsx`에서 설정된 localization에 따라 자동으로 한국어 또는 영어로 표시됩니다.

### 4.2 서버 컴포넌트에서 사용자 정보 가져오기

서버 컴포넌트에서 현재 사용자 정보를 가져오려면:

```tsx
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()
  
  if (!userId) {
    return <div>로그인이 필요합니다.</div>
  }
  
  return <div>사용자 ID: {userId}</div>
}
```

### 4.3 클라이언트 컴포넌트에서 사용자 정보 가져오기

클라이언트 컴포넌트에서 사용자 정보를 가져오려면:

```tsx
'use client'

import { useUser } from '@clerk/nextjs'

export default function ClientComponent() {
  const { isLoaded, isSignedIn, user } = useUser()
  
  if (!isLoaded) {
    return <div>로딩 중...</div>
  }
  
  if (!isSignedIn) {
    return <div>로그인이 필요합니다.</div>
  }
  
  return <div>안녕하세요, {user.firstName}님!</div>
}
```

## 5. 다음 단계

### 5.1 기존 인증 시스템과의 통합

현재 프로젝트는 Mock 인증 시스템(zustand)을 사용하고 있습니다. Clerk로 전환하려면:

1. **기존 인증 스토어 제거 또는 수정**: `features/auth/store/authStore.ts`를 Clerk API로 대체
2. **로그인/회원가입 페이지 수정**: Clerk의 `<SignIn>` 및 `<SignUp>` 컴포넌트 사용
3. **프로필 페이지 수정**: Clerk의 `useUser()` 훅 사용

### 5.2 Supabase와의 통합

Clerk를 인증 시스템으로 사용하고 Supabase를 데이터베이스로만 사용하는 경우:

1. Supabase 인증 기능은 비활성화
2. Clerk의 사용자 ID를 Supabase의 `profiles` 테이블과 연결
3. Clerk의 웹훅을 사용하여 사용자 생성/삭제 시 Supabase에 동기화

### 5.3 보호된 라우트 설정

특정 페이지를 인증된 사용자만 접근할 수 있도록 설정하려면:

```tsx
// middleware.ts에서
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/profile(.*)', '/my-page(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})
```

## 참고 자료

- [Clerk 공식 문서](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Clerk Next.js App Router 가이드](https://clerk.com/docs/nextjs/overview)

