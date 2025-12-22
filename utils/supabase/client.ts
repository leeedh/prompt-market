import { createBrowserClient } from '@supabase/ssr'

/**
 * 클라이언트 컴포넌트에서 사용할 Supabase 클라이언트를 생성합니다.
 * 
 * 이 함수는 'use client' 지시어가 있는 React 컴포넌트에서 사용됩니다.
 * Clerk 인증 토큰을 Supabase 클라이언트에 전달하여 Clerk와 Supabase를 통합합니다.
 * 
 * Clerk와 Supabase 통합:
 * - Clerk의 네이티브 Supabase 통합을 사용합니다 (JWT 템플릿은 deprecated)
 * - Clerk 세션 토큰을 Supabase 클라이언트에 전달하여 인증된 요청을 수행합니다
 * - Supabase의 Row Level Security (RLS) 정책이 Clerk 사용자 ID를 기반으로 작동합니다
 * 
 * @param getToken - Clerk 세션 토큰을 가져오는 함수 (선택적)
 * @returns {SupabaseClient} Supabase 클라이언트 인스턴스
 * 
 * @example
 * ```tsx
 * 'use client'
 * 
 * import { createClient } from '@/utils/supabase/client'
 * import { useSession } from '@clerk/nextjs'
 * 
 * export default function ClientComponent() {
 *   const { session } = useSession()
 *   const supabase = createClient(async () => {
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
 * 
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 * @see https://supabase.com/docs/guides/auth/third-party/clerk
 */
export function createClient(getToken?: () => Promise<string | null>) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Clerk 세션 토큰을 Supabase 클라이언트에 전달
        fetch: async (url, options = {}) => {
          const token = getToken ? await getToken() : null
          
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

