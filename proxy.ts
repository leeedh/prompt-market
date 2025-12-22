import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { updateSession } from './utils/supabase/middleware';
import { clerkMiddleware } from '@clerk/nextjs/server';
import { type NextRequest } from 'next/server';

/**
 * Next.js Proxy (이전 middleware.ts)
 * 
 * Next.js 16에서는 middleware.ts가 deprecated되고 proxy.ts를 사용합니다.
 * 
 * 이 프록시는 세 가지 주요 기능을 수행합니다:
 * 1. Clerk 미들웨어: 인증 및 권한 관리
 * 2. Supabase 세션 업데이트: 사용자 인증 세션 새로고침 (선택적)
 * 3. next-intl 미들웨어: 다국어 라우팅 처리
 * 
 * 실행 순서:
 * 1. Clerk 미들웨어 실행 (인증 처리)
 * 2. Supabase 세션 업데이트 (인증 토큰 갱신, 선택적)
 * 3. next-intl 미들웨어 실행 (로케일 처리)
 */
const intlMiddleware = createMiddleware(routing);
const clerkMiddlewareHandler = clerkMiddleware();

/**
 * Next.js Proxy 함수
 * 
 * Next.js 16에서는 proxy.ts의 default export를 사용합니다.
 * 여러 미들웨어를 체인으로 연결하여 실행합니다.
 */
export default async function proxy(request: NextRequest) {
  // 1. 먼저 Clerk 미들웨어를 실행합니다
  const clerkResponse = await clerkMiddlewareHandler(request);
  
  // Clerk 응답이 리다이렉트인 경우 그대로 반환
  if (clerkResponse.status === 307 || clerkResponse.status === 308 || clerkResponse.status === 301 || clerkResponse.status === 302) {
    return clerkResponse;
  }
  
  // 2. Supabase 세션을 업데이트합니다 (선택적 - Clerk를 메인 인증으로 사용하는 경우 주석 처리 가능)
  const supabaseResponse = await updateSession(request);
  
  // Supabase 응답이 리다이렉트인 경우 그대로 반환
  if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
    return supabaseResponse;
  }
  
  // 3. next-intl 미들웨어 실행
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - … static files and images (for performance)
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api, trpc, _vercel (API routes)
     * - files with extensions (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|trpc|_vercel|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
};

