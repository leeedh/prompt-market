# Clerk와 Supabase 통합 가이드

이 문서는 Clerk 인증과 Supabase 데이터베이스를 통합하는 방법을 설명합니다.

## 📋 목차

1. [개요](#1-개요)
2. [Clerk 대시보드 설정](#2-clerk-대시보드-설정)
3. [Supabase 대시보드 설정](#3-supabase-대시보드-설정)
4. [코드 통합](#4-코드-통합)
5. [Row Level Security (RLS) 설정](#5-row-level-security-rls-설정)
6. [사용 예시](#6-사용-예시)

## 1. 개요

Clerk와 Supabase를 통합하면 다음과 같은 이점을 얻을 수 있습니다:

- **Clerk의 강력한 인증 기능**: 소셜 로그인, 2FA, 사용자 관리 등
- **Supabase의 데이터베이스 기능**: PostgreSQL, 실시간 기능, 스토리지 등
- **네이티브 통합**: JWT 템플릿 없이 직접 Clerk 세션 토큰 사용 (2025년 4월부터 권장)
- **보안**: Row Level Security (RLS)를 통한 데이터 접근 제어

### 중요 사항

- **JWT 템플릿은 deprecated**: 2025년 4월 1일부터 Clerk의 JWT 템플릿 방식은 더 이상 권장되지 않습니다.
- **네이티브 통합 사용**: Clerk의 네이티브 Supabase 통합을 사용하는 것이 권장됩니다.
- **장점**: 
  - 각 Supabase 요청마다 새 토큰을 가져올 필요가 없습니다
  - Supabase JWT 시크릿 키를 Clerk와 공유할 필요가 없습니다

## 2. Clerk 대시보드 설정

### 2.1 Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com)에 로그인합니다.
2. 애플리케이션을 선택합니다.
3. **Integrations** 섹션으로 이동합니다.
4. **Supabase**를 찾아 **Connect** 버튼을 클릭합니다.
5. [Clerk의 Connect with Supabase 페이지](https://clerk.com/docs/integrations/databases/supabase)를 방문하여 자동 설정을 완료합니다.

### 2.2 세션 토큰 커스터마이징 (선택적)

Supabase와의 통합을 위해 세션 토큰에 `role` 클레임을 추가해야 할 수 있습니다:

1. Clerk Dashboard에서 **Sessions** 메뉴로 이동합니다.
2. **Token Templates** 섹션에서 **Supabase** 템플릿을 생성합니다.
3. 필요한 클레임을 추가합니다 (예: `role: "authenticated"`).

## 3. Supabase 대시보드 설정

### 3.1 Third-Party Auth 통합 추가

1. [Supabase Dashboard](https://app.supabase.com)에 로그인합니다.
2. 프로젝트를 선택합니다.
3. **Authentication** > **Providers** 메뉴로 이동합니다.
4. **Third-Party Auth** 섹션에서 **Add Provider** 버튼을 클릭합니다.
5. **Clerk**를 선택합니다.
6. Clerk Dashboard에서 제공된 도메인을 입력합니다.
7. 통합을 활성화합니다.

### 3.2 로컬 개발 설정 (선택적)

로컬 개발이나 self-hosting을 사용하는 경우:

1. `supabase/config.toml` 파일을 엽니다.
2. 다음 설정을 추가합니다:

```toml
[auth]
enable_clerk = true
clerk_domain = "your-clerk-domain.clerk.accounts.dev"
```

## 4. 코드 통합

### 4.1 서버 사이드 (Server Components, Server Actions)

서버 컴포넌트에서 Supabase 클라이언트를 생성할 때 Clerk 토큰을 전달합니다:

```tsx
// app/[locale]/page.tsx
import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('prompts').select('*')
  
  return <div>{JSON.stringify(data)}</div>
}
```

`utils/supabase/server.ts`는 이미 Clerk 토큰을 자동으로 전달하도록 설정되어 있습니다.

### 4.2 클라이언트 사이드 (Client Components)

클라이언트 컴포넌트에서 Supabase 클라이언트를 생성할 때 Clerk 세션을 전달합니다:

```tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useSession } from '@clerk/nextjs'

export default function ClientComponent() {
  const { session } = useSession()
  
  const supabase = createClient(async () => {
    return await session?.getToken({ template: 'supabase' }) ?? null
  })
  
  const handleClick = async () => {
    const { data } = await supabase.from('prompts').select('*')
    console.log(data)
  }
  
  return <button onClick={handleClick}>Load Data</button>
}
```

### 4.3 헬퍼 함수 사용

더 간단한 방법으로 헬퍼 함수를 사용할 수 있습니다:

```tsx
'use client'

import { createClerkSupabaseClientClient } from '@/utils/supabase/clerk'
import { useSession } from '@clerk/nextjs'

export default function ClientComponent() {
  const { session } = useSession()
  
  const supabase = createClerkSupabaseClientClient(async () => {
    return await session?.getToken({ template: 'supabase' }) ?? null
  })
  
  // ... 나머지 코드
}
```

## 5. Row Level Security (RLS) 설정

Supabase에서 Row Level Security를 설정하여 사용자가 자신의 데이터에만 접근할 수 있도록 합니다.

### 5.1 Clerk 사용자 ID 추출 함수 생성

Supabase SQL Editor에서 다음 함수를 실행합니다:

```sql
-- Clerk 사용자 ID를 추출하는 함수
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::text;
$$;
```

### 5.2 RLS 정책 설정 예시

예를 들어, `prompts` 테이블에 RLS를 적용하려면:

```sql
-- RLS 활성화
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프롬프트만 조회할 수 있음
CREATE POLICY "Users can view their own prompts"
ON prompts
FOR SELECT
USING (user_id = get_clerk_user_id());

-- 사용자는 자신의 프롬프트만 생성할 수 있음
CREATE POLICY "Users can insert their own prompts"
ON prompts
FOR INSERT
WITH CHECK (user_id = get_clerk_user_id());

-- 사용자는 자신의 프롬프트만 수정할 수 있음
CREATE POLICY "Users can update their own prompts"
ON prompts
FOR UPDATE
USING (user_id = get_clerk_user_id());

-- 사용자는 자신의 프롬프트만 삭제할 수 있음
CREATE POLICY "Users can delete their own prompts"
ON prompts
FOR DELETE
USING (user_id = get_clerk_user_id());
```

### 5.3 테이블에 user_id 컬럼 추가

프롬프트 테이블에 Clerk 사용자 ID를 저장하는 컬럼을 추가합니다:

```sql
-- user_id 컬럼 추가 (이미 있다면 생략)
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 기본값 설정 (선택적)
-- 새 레코드 생성 시 자동으로 Clerk 사용자 ID가 설정되도록 할 수 있습니다
```

## 6. 사용 예시

### 6.1 사용자별 프롬프트 조회

```tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useSession } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function MyPrompts() {
  const { session } = useSession()
  const [prompts, setPrompts] = useState([])
  
  useEffect(() => {
    if (!session) return
    
    const supabase = createClient(async () => {
      return await session.getToken({ template: 'supabase' }) ?? null
    })
    
    const fetchPrompts = async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching prompts:', error)
      } else {
        setPrompts(data)
      }
    }
    
    fetchPrompts()
  }, [session])
  
  return (
    <div>
      <h1>My Prompts</h1>
      {prompts.map((prompt) => (
        <div key={prompt.id}>{prompt.title}</div>
      ))}
    </div>
  )
}
```

### 6.2 새 프롬프트 생성

```tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useSession, useUser } from '@clerk/nextjs'

export default function CreatePrompt() {
  const { session } = useSession()
  const { user } = useUser()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session || !user) return
    
    const supabase = createClient(async () => {
      return await session.getToken({ template: 'supabase' }) ?? null
    })
    
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        title: 'New Prompt',
        description: 'Prompt description',
        user_id: user.id, // Clerk 사용자 ID
      })
    
    if (error) {
      console.error('Error creating prompt:', error)
    } else {
      console.log('Prompt created:', data)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드 */}
      <button type="submit">Create Prompt</button>
    </form>
  )
}
```

## 참고 자료

- [Clerk Supabase 통합 공식 문서](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

## 문제 해결

### 토큰이 전달되지 않는 경우

1. Clerk Dashboard에서 Supabase 통합이 활성화되어 있는지 확인합니다.
2. Supabase Dashboard에서 Third-Party Auth 통합이 설정되어 있는지 확인합니다.
3. 환경 변수가 올바르게 설정되어 있는지 확인합니다:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### RLS 정책이 작동하지 않는 경우

1. RLS가 테이블에 활성화되어 있는지 확인합니다.
2. `get_clerk_user_id()` 함수가 올바르게 생성되었는지 확인합니다.
3. Clerk 토큰이 올바르게 전달되고 있는지 확인합니다 (브라우저 개발자 도구의 Network 탭 확인).

