import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // URL에서 로케일을 가져오거나 기본값 사용
  let locale = await requestLocale;

  // 지원하지 않는 로케일인 경우 기본 로케일 사용
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

