/**
 * Clerk와 Supabase 통합을 위한 헬퍼 함수
 * 
 * 이 파일은 Clerk 인증을 사용하는 Supabase 클라이언트를 생성하는 헬퍼 함수를 제공합니다.
 * 
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 * @see https://supabase.com/docs/guides/auth/third-party/clerk
 */

import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * 서버 사이드에서 Clerk 토큰을 사용하는 Supabase 클라이언트를 생성합니다.
 * 
 * 이 함수는 Next.js App Router의 서버 컴포넌트, Server Actions, Route Handlers에서 사용됩니다.
 * Clerk의 `auth().getToken()`을 사용하여 Supabase 클라이언트에 인증 토큰을 전달합니다.
 * 
 * @returns {Promise<SupabaseClient>} Supabase 클라이언트 인스턴스
 * 
 * @example
 * ```tsx
 * // Server Component에서 사용
 * import { createClerkSupabaseClient } from '@/utils/supabase/clerk'
 * 
 * export default async function Page() {
 *   const supabase = await createClerkSupabaseClient()
 *   const { data } = await supabase.from('prompts').select('*')
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 */
export async function createClerkSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  const { getToken } = await auth()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 setAll이 호출된 경우 무시
          }
        },
      },
      global: {
        fetch: async (url, options = {}) => {
          // Clerk의 Supabase 템플릿 토큰 가져오기
          const token = await getToken({ template: 'supabase' })
          
          const headers = new Headers(options.headers)
          if (token) {
            headers.set('Authorization', `Bearer ${token}`)
          }
          
          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    }
  )
}

/**
 * 클라이언트 사이드에서 Clerk 토큰을 사용하는 Supabase 클라이언트를 생성합니다.
 * 
 * 이 함수는 'use client' 지시어가 있는 React 컴포넌트에서 사용됩니다.
 * Clerk의 `useSession()` 훅을 사용하여 세션 토큰을 가져옵니다.
 * 
 * @param getToken - Clerk 세션 토큰을 가져오는 함수
 * @returns {SupabaseClient} Supabase 클라이언트 인스턴스
 * 
 * @example
 * ```tsx
 * 'use client'
 * 
 * import { createClerkSupabaseClient } from '@/utils/supabase/clerk'
 * import { useSession } from '@clerk/nextjs'
 * 
 * export default function ClientComponent() {
 *   const { session } = useSession()
 *   const supabase = createClerkSupabaseClient(async () => {
 *     return await session?.getToken({ template: 'supabase' })
 *   })
 *   
 *   const handleClick = async () => {
 *     const { data } = await supabase.from('prompts').select('*')
 *     console.log(data)
 *   }
 *   
 *   return <button onClick={handleClick}>Load Data</button>
 * }
 * ```
 */
export function createClerkSupabaseClientClient(
  getToken: () => Promise<string | null>
): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const token = await getToken()
          
          const headers = new Headers(options.headers)
          if (token) {
            headers.set('Authorization', `Bearer ${token}`)
          }
          
          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    }
  )
}

