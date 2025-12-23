/**
 * SEO 관련 유틸리티 함수
 * 
 * 안전한 URL 생성 및 검증을 위한 헬퍼 함수들
 */

/**
 * 안전한 base URL 가져오기
 * 
 * 환경 변수에서 사이트 URL을 가져오고, 유효하지 않은 경우 기본값을 반환합니다.
 * 
 * @returns 사이트의 base URL (예: 'http://localhost:3000' 또는 'https://example.com')
 */
export function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  
  // 환경 변수가 없거나 빈 문자열인 경우 기본값 사용
  if (!siteUrl || siteUrl.trim() === '') {
    return 'http://localhost:3000'
  }
  
  // URL 형식 검증 (간단한 체크)
  try {
    // URL 생성 시도 (유효성 검증)
    new URL(siteUrl)
    return siteUrl
  } catch (error) {
    // URL이 유효하지 않은 경우 기본값 사용
    console.warn('Invalid NEXT_PUBLIC_SITE_URL, using default:', siteUrl)
    return 'http://localhost:3000'
  }
}

/**
 * 안전한 URL 객체 생성
 * 
 * 문자열 URL을 URL 객체로 변환하고, 유효하지 않은 경우 기본값을 반환합니다.
 * 
 * @param url - 변환할 URL 문자열
 * @param defaultUrl - 기본 URL (기본값: 'http://localhost:3000')
 * @returns URL 객체
 */
export function createSafeUrl(url?: string, defaultUrl: string = 'http://localhost:3000'): URL {
  if (!url || url.trim() === '') {
    return new URL(defaultUrl)
  }
  
  try {
    return new URL(url)
  } catch (error) {
    console.warn('Invalid URL, using default:', url)
    return new URL(defaultUrl)
  }
}

