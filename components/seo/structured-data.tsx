/**
 * 구조화된 데이터 (JSON-LD) 컴포넌트
 * 
 * Schema.org 마크업을 사용하여 검색 엔진이 콘텐츠를 더 잘 이해할 수 있도록 합니다.
 * 
 * 지원하는 스키마:
 * - Product: 상품 정보 (프롬프트)
 * - Organization: 사이트 운영자 정보
 * - BreadcrumbList: 페이지 경로
 * 
 * 주의: 클라이언트 컴포넌트에서 사용 시 하이드레이션 불일치를 방지하기 위해
 * useEffect를 사용하여 클라이언트에서만 렌더링합니다.
 */

'use client'

import { useEffect, useState } from 'react'
import type { Prompt } from '@/features/prompts/repositories'

interface StructuredDataProps {
  type: 'product' | 'organization' | 'breadcrumb'
  data: ProductStructuredData | OrganizationStructuredData | BreadcrumbStructuredData
}

interface ProductStructuredData {
  prompt: Prompt
  baseUrl: string
  locale: string
}

interface OrganizationStructuredData {
  name: string
  url: string
  logo?: string
  description?: string
}

interface BreadcrumbStructuredData {
  items: Array<{ name: string; url: string }>
}

/**
 * Product 스키마 생성 (프롬프트 상세 페이지용)
 */
function generateProductSchema(data: ProductStructuredData) {
  const { prompt, baseUrl, locale } = data
  const url = `${baseUrl}/${locale}/prompt/${prompt.id}`
  const imageUrl = prompt.thumbnail
    ? prompt.thumbnail.startsWith('http')
      ? prompt.thumbnail
      : `${baseUrl}${prompt.thumbnail}`
    : `${baseUrl}/og-image.png`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prompt.title,
    description: prompt.description,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: 'Prompt Market',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'KRW',
      price: prompt.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: prompt.author || 'Prompt Market',
      },
    },
    aggregateRating: prompt.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: prompt.rating,
          reviewCount: prompt.reviews || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    category: prompt.category,
    keywords: prompt.tags.join(', '),
  }
}

/**
 * Organization 스키마 생성 (사이트 정보)
 */
function generateOrganizationSchema(data: OrganizationStructuredData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo || `${data.url}/og-image.png`,
    description:
      data.description ||
      '전문가가 만든 검증된 AI 프롬프트를 구매하고 판매하는 마켓플레이스',
    sameAs: [
      // 향후 소셜 미디어 링크 추가 가능
    ],
  }
}

/**
 * BreadcrumbList 스키마 생성 (페이지 경로)
 */
function generateBreadcrumbSchema(data: BreadcrumbStructuredData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const [mounted, setMounted] = useState(false)

  // 클라이언트에서만 렌더링하여 하이드레이션 불일치 방지
  useEffect(() => {
    setMounted(true)
  }, [])

  // 서버 사이드에서는 null 반환 (하이드레이션 불일치 방지)
  if (!mounted) {
    return null
  }

  let schema: object

  switch (type) {
    case 'product':
      schema = generateProductSchema(data as ProductStructuredData)
      break
    case 'organization':
      schema = generateOrganizationSchema(data as OrganizationStructuredData)
      break
    case 'breadcrumb':
      schema = generateBreadcrumbSchema(data as BreadcrumbStructuredData)
      break
    default:
      return null
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

