import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // 한국어를 기본 로케일로 설정
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
});

// 타입 안전한 네비게이션 헬퍼 생성
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);

