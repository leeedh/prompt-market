import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/seo-utils'

/**
 * robots.txt 파일 생성
 * 
 * 검색 엔진 크롤러에게 사이트의 크롤링 규칙을 제공합니다.
 * 
 * 주요 설정:
 * - 모든 크롤러가 대부분의 페이지를 크롤링할 수 있도록 허용
 * - 관리자 페이지 및 API 라우트는 크롤링 차단
 * - sitemap 위치 명시
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // 관리자 페이지는 크롤링 차단
          '/admin/',
          '/api/',
          // 인증 관련 페이지는 크롤링 차단 (로그인 페이지는 제외)
          '/auth/',
          // 체크아웃 및 결제 페이지는 크롤링 차단 (개인정보 포함 가능성)
          '/checkout/',
          // 사용자 개인 페이지는 크롤링 차단
          '/profile/',
          '/my-page/',
          // 로그인 페이지는 크롤링 허용 (SEO를 위해)
          // '/login/'는 disallow에 포함하지 않음
        ],
      },
      // Googlebot에 대한 특별 설정
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/checkout/',
          '/profile/',
          '/my-page/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // 호스트 정보 (선택사항, 대부분의 경우 불필요)
    // host: baseUrl,
  }
}

