import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * 미들웨어에서 사용할 Supabase 세션 업데이트 함수입니다.
 * 
 * 이 함수는 모든 요청에서 사용자 세션을 새로고침하고, 만료된 토큰을 갱신합니다.
 * 인증되지 않은 사용자를 로그인 페이지로 리다이렉트할 수도 있습니다.
 * 
 * @param {NextRequest} request - Next.js 요청 객체
 * @returns {Promise<NextResponse>} 업데이트된 응답 객체
 * 
 * @example
 * ```ts
 * // middleware.ts
 * import { updateSession } from '@/utils/supabase/middleware'
 * 
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 요청 쿠키에 먼저 설정
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          // 응답 쿠키에도 설정
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 중요: createServerClient와 getUser() 사이에 코드를 추가하지 마세요.
  // 이는 사용자가 랜덤하게 로그아웃되는 버그를 유발할 수 있습니다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
  // (선택사항: 필요에 따라 주석 처리하거나 수정하세요)
  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith('/login') &&
  //   !request.nextUrl.pathname.startsWith('/auth')
  // ) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  // 중요: supabaseResponse 객체를 그대로 반환해야 합니다.
  // 새로운 응답 객체를 만들 경우 쿠키가 제대로 전달되지 않을 수 있습니다.
  return supabaseResponse
}

