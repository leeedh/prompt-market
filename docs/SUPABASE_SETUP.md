# Supabase 설정 가이드

이 문서는 Next.js 프로젝트에 Supabase를 연결하는 방법을 설명합니다.

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [사용 방법](#4-사용-방법)
5. [다음 단계](#5-다음-단계)

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성 및 프로젝트 생성

1. [Supabase 공식 사이트](https://supabase.com)에 접속하여 계정을 생성합니다.
2. 새 프로젝트를 생성합니다.
3. 프로젝트가 생성되면 대시보드로 이동합니다.

### 1.2 API 키 확인

1. Supabase 대시보드에서 **Settings** → **API** 메뉴로 이동합니다.
2. 다음 정보를 확인합니다:
   - **Project URL**: `https://xxxxx.supabase.co` 형식
   - **anon/public key**: `eyJhbGci...` 형식의 긴 문자열

## 2. 환경 변수 설정

### 2.1 .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**중요:**
- `your_supabase_project_url`을 위에서 확인한 Project URL로 교체하세요.
- `your_supabase_anon_key`를 위에서 확인한 anon/public key로 교체하세요.
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함되어 있습니다).

### 2.2 환경 변수 확인

환경 변수가 제대로 설정되었는지 확인하려면:

```bash
# 개발 서버 재시작
pnpm dev
```

## 3. 프로젝트 구조

Supabase 연결을 위해 다음 파일들이 생성되었습니다:

```
utils/
  supabase/
    server.ts      # 서버 컴포넌트용 클라이언트
    client.ts      # 클라이언트 컴포넌트용 클라이언트
    middleware.ts  # 미들웨어용 세션 업데이트 함수

app/
  auth/
    callback/
      route.ts     # OAuth 콜백 핸들러

middleware.ts      # next-intl과 Supabase 통합 미들웨어
```

## 4. 사용 방법

### 4.1 서버 컴포넌트에서 사용

서버 컴포넌트, Server Actions, Route Handlers에서 사용:

```tsx
import { createClient } from '@/utils/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  // 데이터 조회
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
  
  if (error) {
    console.error('Error:', error)
    return <div>Error loading data</div>
  }
  
  return (
    <div>
      {data?.map((prompt) => (
        <div key={prompt.id}>{prompt.title}</div>
      ))}
    </div>
  )
}
```

### 4.2 클라이언트 컴포넌트에서 사용

'use client' 지시어가 있는 컴포넌트에서 사용:

```tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const supabase = createClient()
  const [data, setData] = useState([])
  
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
      
      if (!error) {
        setData(data)
      }
    }
    
    loadData()
  }, [])
  
  return <div>{/* 렌더링 */}</div>
}
```

### 4.3 인증 사용 예시

#### 로그인

```tsx
'use client'

import { createClient } from '@/utils/supabase/client'

export default function LoginForm() {
  const supabase = createClient()
  
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Login error:', error)
      return
    }
    
    // 로그인 성공
    console.log('Logged in:', data.user)
  }
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleLogin(
        formData.get('email') as string,
        formData.get('password') as string
      )
    }}>
      {/* 폼 필드 */}
    </form>
  )
}
```

#### 회원가입

```tsx
'use client'

import { createClient } from '@/utils/supabase/client'

export default function SignUpForm() {
  const supabase = createClient()
  
  const handleSignUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign up error:', error)
      return
    }
    
    // 회원가입 성공
    console.log('Signed up:', data.user)
  }
  
  return (
    <form>
      {/* 폼 필드 */}
    </form>
  )
}
```

#### 현재 사용자 확인

```tsx
import { createClient } from '@/utils/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>로그인이 필요합니다.</div>
  }
  
  return <div>안녕하세요, {user.email}님!</div>
}
```

#### 로그아웃

```tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  
  return <button onClick={handleLogout}>로그아웃</button>
}
```

## 5. 다음 단계

### 5.1 데이터베이스 스키마 생성

PRD 문서(`docs/PRD.md`)에 명시된 스키마를 Supabase에서 생성하세요:

- `profiles` 테이블
- `prompts` 테이블
- `carts` 테이블
- `purchases` 테이블

### 5.2 Row Level Security (RLS) 설정

보안을 위해 RLS 정책을 설정하세요:

```sql
-- 예시: profiles 테이블의 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 5.3 프로필 자동 생성 트리거

회원가입 시 자동으로 프로필을 생성하는 트리거를 설정하세요:

```sql
-- 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5.4 기존 Mock 인증 시스템 마이그레이션

현재 `features/auth/store/authStore.ts`에서 사용하는 Mock 인증을 Supabase 인증으로 마이그레이션하세요.

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Next.js 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

