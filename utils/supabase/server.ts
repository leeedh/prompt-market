import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

/**
 * 서버 컴포넌트에서 사용할 Supabase 클라이언트를 생성합니다.
 * 
 * 이 함수는 Next.js App Router의 서버 컴포넌트, Server Actions, Route Handlers에서 사용됩니다.
 * Clerk 인증 토큰을 Supabase 클라이언트에 전달하여 Clerk와 Supabase를 통합합니다.
 * 
 * Clerk와 Supabase 통합:
 * - Clerk의 네이티브 Supabase 통합을 사용합니다 (JWT 템플릿은 deprecated)
 * - Clerk 세션 토큰을 Supabase 클라이언트에 전달하여 인증된 요청을 수행합니다
 * - Supabase의 Row Level Security (RLS) 정책이 Clerk 사용자 ID를 기반으로 작동합니다
 * 
 * @returns {Promise<SupabaseClient>} Supabase 클라이언트 인스턴스
 * 
 * @example
 * ```tsx
 * // Server Component에서 사용
 * import { createClient } from '@/utils/supabase/server'
 * 
 * export default async function Page() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('prompts').select('*')
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 * 
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 * @see https://supabase.com/docs/guides/auth/third-party/clerk
 */
export async function createClient() {
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
            // Server Component에서 setAll이 호출된 경우
            // 미들웨어에서 세션을 새로고침하므로 무시해도 됩니다.
          }
        },
      },
      global: {
        // Clerk 세션 토큰을 Supabase 클라이언트에 전달
        // 이렇게 하면 Supabase가 Clerk 인증을 인식하고 RLS 정책을 적용할 수 있습니다
        // 
        // 네이티브 통합을 사용하는 경우:
        // - Clerk Dashboard에서 Supabase 통합을 활성화해야 합니다
        // - Supabase Dashboard에서 Third-Party Auth로 Clerk를 추가해야 합니다
        // - template: 'supabase'는 Clerk Dashboard에서 Supabase 템플릿이 설정된 경우에만 필요합니다
        fetch: async (url, options = {}) => {
          // 먼저 supabase 템플릿을 시도하고, 없으면 기본 토큰 사용
          let token = await getToken({ template: 'supabase' })
          if (!token) {
            // 템플릿이 없는 경우 기본 세션 토큰 사용
            token = await getToken()
          }
          
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

