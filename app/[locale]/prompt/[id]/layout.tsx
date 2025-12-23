import type { Metadata } from 'next'
import { createPromptRepositoryServer } from '@/features/prompts/repositories/PromptRepository.supabase.server'
import { routing } from '@/i18n/routing'
import { getBaseUrl } from '@/lib/seo-utils'

/**
 * 프롬프트 상세 페이지 레이아웃
 * 
 * 이 레이아웃은 프롬프트 상세 페이지의 메타데이터를 동적으로 생성합니다.
 * 클라이언트 컴포넌트인 페이지 컴포넌트와 분리하여 서버에서 메타데이터를 생성합니다.
 */

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { id, locale } = await params
  const baseUrl = getBaseUrl()
  const currentLocale = locale || routing.defaultLocale

  try {
    const repository = await createPromptRepositoryServer()
    const prompt = await repository.getById(id)

    if (!prompt) {
      return {
        title: '프롬프트를 찾을 수 없습니다 | Prompt Market',
        description: '요청하신 프롬프트를 찾을 수 없습니다.',
      }
    }

    // 이미지 URL 처리
    const imageUrl = prompt.thumbnail
      ? prompt.thumbnail.startsWith('http')
        ? prompt.thumbnail
        : `${baseUrl}${prompt.thumbnail}`
      : `${baseUrl}/og-image.png`

    // 카테고리와 태그를 키워드로 활용
    const keywords = [
      prompt.category,
      ...prompt.tags,
      'AI 프롬프트',
      '프롬프트 마켓',
      prompt.title,
    ].filter(Boolean)

    // 가격 정보를 포함한 설명
    const description = `${prompt.description} | ${prompt.price.toLocaleString()}원 | 평점 ${prompt.rating || 0}/5 | ${prompt.sales || 0}개 판매`

    return {
      title: `${prompt.title} | Prompt Market`,
      description,
      keywords,
      authors: prompt.author ? [{ name: prompt.author }] : undefined,
      openGraph: {
        type: 'product',
        locale: currentLocale === 'ko' ? 'ko_KR' : 'en_US',
        url: `${baseUrl}/${currentLocale}/prompt/${id}`,
        siteName: 'Prompt Market',
        title: prompt.title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: prompt.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: prompt.title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `${baseUrl}/${currentLocale}/prompt/${id}`,
        languages: Object.fromEntries(
          routing.locales.map((loc) => [
            loc,
            `${baseUrl}/${loc}/prompt/${id}`,
          ])
        ) as Record<string, string>,
      },
    }
  } catch (error) {
    console.error('Error generating metadata for prompt:', error)
    return {
      title: '프롬프트 상세 | Prompt Market',
      description: 'AI 프롬프트 마켓플레이스에서 프롬프트를 확인하세요.',
    }
  }
}

export default async function PromptDetailLayout({
  children,
}: LayoutProps) {
  return <>{children}</>
}

