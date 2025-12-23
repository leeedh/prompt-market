# SEO 최적화 가이드

이 문서는 Prompt Market 프로젝트에 적용된 SEO 최적화 작업을 설명합니다.

## 📋 적용된 SEO 최적화 항목

### 1. Sitemap 생성 (`app/[locale]/sitemap.ts`)

- **목적**: 검색 엔진이 사이트의 모든 페이지를 크롤링할 수 있도록 URL 목록 제공
- **기능**:
  - 모든 활성화된 프롬프트 상세 페이지 자동 포함
  - 다국어 지원 (ko, en)
  - 이미지 sitemap 포함 (Google Image Search 최적화)
  - lastModified, changeFrequency, priority 설정
- **접근 경로**: `/sitemap.xml`

### 2. Robots.txt 생성 (`app/[locale]/robots.ts`)

- **목적**: 검색 엔진 크롤러에게 크롤링 규칙 제공
- **설정**:
  - 관리자 페이지 (`/admin/`) 크롤링 차단
  - API 라우트 (`/api/`) 크롤링 차단
  - 인증 관련 페이지 (`/auth/`) 크롤링 차단
  - 체크아웃 및 개인 페이지 크롤링 차단
  - sitemap 위치 명시
- **접근 경로**: `/robots.txt`

### 3. 동적 메타데이터 생성

#### 프롬프트 상세 페이지 (`app/[locale]/prompt/[id]/layout.tsx`)

- **generateMetadata 함수**: 각 프롬프트에 맞는 동적 메타데이터 생성
- **포함 내용**:
  - 프롬프트 제목, 설명, 가격 정보
  - Open Graph 태그 (소셜 미디어 공유 최적화)
  - Twitter Card 태그
  - 다국어 alternate 링크
  - 키워드 (카테고리, 태그 기반)

#### 메인 레이아웃 (`app/[locale]/layout.tsx`)

- **기본 메타데이터**: 사이트 전체 기본 메타데이터 설정
- **포함 내용**:
  - 사이트 제목, 설명, 키워드
  - Open Graph 및 Twitter Card 설정
  - 다국어 alternate 링크
  - robots 설정 (Googlebot 최적화)

### 4. 구조화된 데이터 (JSON-LD)

#### Product 스키마 (`components/seo/structured-data.tsx`)

- **위치**: 프롬프트 상세 페이지
- **포함 정보**:
  - 상품명, 설명, 이미지
  - 가격, 통화, 재고 상태
  - 평점 및 리뷰 수
  - 카테고리 및 키워드
- **효과**: Google 검색 결과에 리치 스니펫 표시 가능

#### Organization 스키마

- **위치**: 메인 레이아웃 (모든 페이지)
- **포함 정보**:
  - 사이트 이름, URL, 로고
  - 사이트 설명
- **효과**: 검색 엔진이 사이트 정보를 더 잘 이해

#### BreadcrumbList 스키마

- **위치**: 메인 페이지
- **포함 정보**: 페이지 경로 정보
- **효과**: 검색 결과에 브레드크럼 표시 가능

## 🔧 환경 변수 설정

SEO 최적화를 위해 다음 환경 변수를 설정해야 합니다:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

- **용도**: 절대 URL 생성 (sitemap, 메타데이터, 구조화된 데이터)
- **기본값**: `http://localhost:3000` (개발 환경)

## 📊 SEO 최적화 체크리스트

### 완료된 항목 ✅

- [x] Sitemap 생성 (동적 프롬프트 페이지 포함)
- [x] Robots.txt 생성
- [x] 동적 메타데이터 생성 (프롬프트 상세 페이지)
- [x] Open Graph 태그 설정
- [x] Twitter Card 태그 설정
- [x] 구조화된 데이터 (JSON-LD) 추가
  - [x] Product 스키마
  - [x] Organization 스키마
  - [x] BreadcrumbList 스키마
- [x] 다국어 alternate 링크 설정
- [x] Canonical URL 설정
- [x] 이미지 최적화 (sitemap에 포함)

### 향후 개선 가능 항목 🔄

- [ ] FAQ 스키마 추가 (AEO 대응)
- [ ] 리뷰 스키마 추가 (Review 스키마)
- [ ] 동적 Open Graph 이미지 생성
- [ ] 메타 설명 A/B 테스트
- [ ] Google Search Console 연동
- [ ] Google Analytics 4 연동
- [ ] 성능 최적화 (Core Web Vitals)

## 🎯 2025년 SEO 트렌드 대응

### 1. AI 기반 검색 최적화 (AEO)

- **현재 상태**: 기본 구조화된 데이터 제공
- **개선 방안**:
  - FAQ 스키마 추가
  - 명확한 답변 형식의 콘텐츠 제공
  - 요약 박스 형태의 정보 제공

### 2. E-E-A-T 강화

- **경험 (Experience)**: 실제 사용자 리뷰 시스템 구축
- **전문성 (Expertise)**: 프롬프트 작성자 정보 강화
- **권위 (Authoritativeness)**: 신뢰할 수 있는 출처 명시
- **신뢰성 (Trustworthiness)**: 투명한 정책 및 약관 제공

### 3. 모바일 최적화

- **현재 상태**: 반응형 디자인 적용
- **개선 방안**:
  - 모바일 페이지 속도 최적화
  - 모바일 친화적인 네비게이션 개선
  - 터치 최적화

## 📝 참고 자료

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Robots](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)

## 🔍 검증 방법

### 1. Sitemap 확인

```bash
# 개발 환경
curl http://localhost:3000/sitemap.xml

# 프로덕션 환경
curl https://your-domain.com/sitemap.xml
```

### 2. Robots.txt 확인

```bash
curl http://localhost:3000/robots.txt
```

### 3. 메타데이터 확인

- 브라우저 개발자 도구에서 `<head>` 태그 확인
- [Google Rich Results Test](https://search.google.com/test/rich-results) 사용
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) 사용

### 4. 구조화된 데이터 확인

- [Google Rich Results Test](https://search.google.com/test/rich-results) 사용
- [Schema.org Validator](https://validator.schema.org/) 사용

## 📈 성과 측정

SEO 최적화 효과를 측정하기 위해 다음 지표를 모니터링하세요:

1. **검색 엔진 노출**: Google Search Console에서 노출 수 확인
2. **클릭률 (CTR)**: 검색 결과에서의 클릭률
3. **순위**: 주요 키워드의 검색 순위
4. **트래픽**: 검색 엔진을 통한 유입 트래픽
5. **리치 스니펫**: 구조화된 데이터로 인한 리치 스니펫 표시 여부

