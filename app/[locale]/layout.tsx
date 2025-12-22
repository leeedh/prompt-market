import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { ClerkProvider } from '@clerk/nextjs'
import { koKR, enUS } from '@clerk/localizations'
import '../globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Prompt Market - AI 프롬프트 마켓플레이스',
    template: '%s | Prompt Market',
  },
  description:
    '전문가가 만든 검증된 AI 프롬프트를 구매하고 판매하는 마켓플레이스. ChatGPT, Midjourney, Claude, Stable Diffusion 등 다양한 AI 도구용 고품질 프롬프트를 만나보세요.',
  keywords: [
    'AI 프롬프트',
    '프롬프트 마켓',
    'ChatGPT 프롬프트',
    'Midjourney 프롬프트',
    'Claude 프롬프트',
    'Stable Diffusion 프롬프트',
    'AI 도구',
    '프롬프트 스토어',
  ],
  authors: [{ name: 'Prompt Market' }],
  creator: 'Prompt Market',
  publisher: 'Prompt Market',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'Prompt Market',
    title: 'Prompt Market - AI 프롬프트 마켓플레이스',
    description:
      '전문가가 만든 검증된 AI 프롬프트를 구매하고 판매하는 마켓플레이스. ChatGPT, Midjourney, Claude, Stable Diffusion 등 다양한 AI 도구용 고품질 프롬프트를 만나보세요.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Prompt Market - AI 프롬프트 마켓플레이스',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt Market - AI 프롬프트 마켓플레이스',
    description:
      '전문가가 만든 검증된 AI 프롬프트를 구매하고 판매하는 마켓플레이스. ChatGPT, Midjourney, Claude, Stable Diffusion 등 다양한 AI 도구용 고품질 프롬프트를 만나보세요.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // 지원하지 않는 로케일인 경우 404
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // 번역 메시지 가져오기
  const messages = await getMessages()

  // 로케일에 따른 Clerk localization 선택
  // 'ko' 로케일일 때 한국어, 그 외에는 영어 사용
  const clerkLocalization = locale === 'ko' ? koKR : enUS

  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang={locale} suppressHydrationWarning>
        <body className={`font-sans antialiased`}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
              <Analytics />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

