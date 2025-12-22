import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

/**
 * OAuth 콜백 라우트 핸들러
 * 
 * 이 라우트는 OAuth 제공자(Google, GitHub 등)로부터 인증 코드를 받아
 * Supabase 세션으로 교환하고 사용자를 적절한 페이지로 리다이렉트합니다.
 * 
 * @param {NextRequest} request - Next.js 요청 객체
 * @returns {Promise<NextResponse>} 리다이렉트 응답
 * 
 * @example
 * 사용자가 Google 로그인을 완료하면:
 * GET /auth/callback?code=xxx&next=/dashboard
 * 
 * 이 핸들러는:
 * 1. 인증 코드를 Supabase 세션으로 교환
 * 2. 성공 시 'next' 파라미터 또는 기본 경로로 리다이렉트
 * 3. 실패 시 에러 페이지로 리다이렉트
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next' 파라미터가 있으면 해당 경로로, 없으면 기본 경로('/')로 리다이렉트
  let next = searchParams.get('next') ?? '/'

  // 'next'가 상대 경로가 아니면 기본 경로로 설정 (보안)
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 로드 밸런서를 통한 요청인지 확인
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // 개발 환경에서는 로드 밸런서가 없으므로 origin을 그대로 사용
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // 프로덕션 환경에서 로드 밸런서를 통한 경우
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // 에러 발생 시 에러 페이지로 리다이렉트
  // 실제 프로젝트에서는 적절한 에러 페이지를 만들어야 합니다
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

