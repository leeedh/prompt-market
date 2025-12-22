import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // WebP 및 AVIF 형식 지원으로 이미지 최적화
    formats: ['image/avif', 'image/webp'],
    // 이미지 최적화 활성화 (프로덕션에서만)
    unoptimized: process.env.NODE_ENV === 'development',
    // 이미지 도메인 설정 (필요시 추가)
    remotePatterns: [],
  },
  // 프로덕션 빌드 최적화
  compress: true,
}

export default withNextIntl(nextConfig)
