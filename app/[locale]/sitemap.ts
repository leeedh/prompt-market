import type { MetadataRoute } from 'next'
import { createPromptRepositoryServer } from '@/features/prompts/repositories/PromptRepository.supabase.server'
import { routing } from '@/i18n/routing'
import { getBaseUrl } from '@/lib/seo-utils'

/**
 * 동적 sitemap 생성
 * 
 * Next.js의 sitemap.ts 파일을 사용하여 검색 엔진이 사이트를 크롤링할 수 있도록
 * 모든 페이지의 URL을 포함한 sitemap.xml을 생성합니다.
 * 
 * 주요 기능:
 * - 메인 페이지 및 정적 페이지 포함
 * - 모든 활성화된 프롬프트 상세 페이지 포함
 * - 다국어 지원 (ko, en)
 * - lastModified, changeFrequency, priority 설정
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const currentDate = new Date()

  // 정적 페이지 목록
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/ko`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          ko: `${baseUrl}/ko`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          ko: `${baseUrl}/ko`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/ko/cart`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          ko: `${baseUrl}/ko/cart`,
          en: `${baseUrl}/en/cart`,
        },
      },
    },
    {
      url: `${baseUrl}/en/cart`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          ko: `${baseUrl}/ko/cart`,
          en: `${baseUrl}/en/cart`,
        },
      },
    },
  ]

  // 프롬프트 상세 페이지 목록 생성
  let promptPages: MetadataRoute.Sitemap = []
  
  try {
    const repository = await createPromptRepositoryServer()
    const prompts = await repository.getAll({ status: 'active' })

    promptPages = prompts.flatMap((prompt) => {
      // 각 로케일별로 프롬프트 상세 페이지 생성
      return routing.locales.map((locale) => ({
        url: `${baseUrl}/${locale}/prompt/${prompt.id}`,
        lastModified: prompt.createdAt ? new Date(prompt.createdAt) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [
              loc,
              `${baseUrl}/${loc}/prompt/${prompt.id}`,
            ])
          ) as Record<string, string>,
        },
        // 이미지 sitemap에 포함 (Google Image Search 최적화)
        images: prompt.thumbnail
          ? [
              {
                url: prompt.thumbnail.startsWith('http')
                  ? prompt.thumbnail
                  : `${baseUrl}${prompt.thumbnail}`,
                alt: prompt.title,
              },
            ]
          : [],
      }))
    })
  } catch (error) {
    console.error('Error generating sitemap for prompts:', error)
    // 에러가 발생해도 정적 페이지는 반환
  }

  return [...staticPages, ...promptPages]
}

