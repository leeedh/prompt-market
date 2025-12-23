# TODO - 프롬프트 스토어 개발 현황

## 📋 현재 구현 상태 요약

### ✅ 완료된 기능

#### 1. 기본 인프라 및 레이아웃

- [x] Next.js 프로젝트 설정
- [x] UI 컴포넌트 라이브러리 (shadcn/ui) 구성
- [x] 전역 레이아웃 및 스타일링
- [x] 반응형 디자인 기본 구조

#### 2. 인증 시스템 (Clerk 기반)

- [x] Clerk 로그인/회원가입 모달 연동 (`@clerk/nextjs`)
- [x] `useAuth` 래퍼로 Clerk 사용자 상태 노출 (localStorage 의존 제거)
- [x] 프로필 정보 표시 및 이름 수정 (`/profile`)
- [x] 로그아웃 기능

#### 3. 메인 페이지 (`/`)

- [x] Hero 섹션
- [x] 헤더 (로고, 검색바, 장바구니 아이콘, 사용자 프로필 영역)
- [x] 카테고리 필터 사이드바
- [x] 태그 필터 (다중 선택)
- [x] 실시간 검색 기능 (제목, 설명 검색)
- [x] 프롬프트 카드 목록 표시
- [x] 정렬 옵션 UI (인기순)
- [x] 장바구니 담기 버튼

#### 4. 프롬프트 상세 페이지 (`/prompt/[id]`)

- [x] 상품 정보 영역 (이미지, 제목, 카테고리, 태그, 평점, 리뷰 수, 판매량)
- [x] 탭 구조 (상세 설명, 포함 내용, 사용 방법, 리뷰)
- [x] 판매자 정보 영역
- [x] 구매/장바구니 버튼
- [x] 좋아요/공유 버튼 UI

#### 5. 장바구니 페이지 (`/cart`)

- [x] 장바구니 목록 표시
- [x] 빈 장바구니 상태 처리
- [x] 개별 상품 삭제 기능
- [x] 장바구니 비우기 기능
- [x] 결제 정보 요약 (상품 금액, 할인, 총 결제 금액)
- [x] 결제하기 버튼

#### 6. 결제 페이지 (`/checkout`)

- [x] 구매자 정보 입력 (이메일)
- [x] 결제 수단 선택 UI (신용카드, 카카오페이, 네이버페이)
- [x] 주문 상품 요약
- [x] Mock 결제 처리 (localStorage에 구매 기록 저장)
- [x] 결제 완료 후 구매 내역 페이지로 이동
- [x] 장바구니 자동 비우기

#### 7. 구매 내역 페이지 (`/my-page`)

- [x] 구매 내역 목록 표시
- [x] 빈 구매 내역 상태 처리
- [x] 주문 카드 (주문 번호, 구매 날짜, 주문 상태)
- [x] 주문 상품 목록 및 총 결제 금액
- [x] 다운로드 버튼 UI
- [x] 관리자 기능 (판매 현황, 프롬프트 관리) - 추가 구현됨

#### 8. 관리자 기능

- [x] 관리자 페이지 (`/admin`)
- [x] 프롬프트 관리 페이지 (`/admin/prompts`)
- [x] 프롬프트 등록/수정/삭제 기능
- [x] 프롬프트 활성화/비활성화 기능
- [x] 판매 현황 대시보드

#### 9. 데이터 관리

- [x] Supabase 프롬프트 읽기 연동 (홈/상세, `PromptRepositorySupabase`)
- [x] Supabase 프롬프트 테이블 마이그레이션 추가 (`supabase/migrations/001_create_prompts_table.sql`)
- [x] localStorage 기반 장바구니/구매 내역/관리자 프롬프트 저장
- [x] zustand를 통한 장바구니 상태 관리

---

## 🚧 미완성 / 개선 필요 기능

### 1. 사용자 경험 개선

#### 토스트 알림 시스템

- [x] 장바구니 담기 시 토스트 알림 추가

  - 현재: 피드백 없음
  - 필요: "장바구니에 상품을 담았습니다." 토스트 표시
  - 위치: `app/page.tsx`, `app/prompt/[id]/page.tsx`의 `addToCart` 호출 시
  - 참고: `components/ui/toast.tsx`, `hooks/use-toast.ts` 이미 구현되어 있음

- [x] 프로필 저장 시 토스트 알림 추가
  - 현재: 피드백 없음
  - 필요: "프로필이 저장되었습니다." 토스트 표시
  - 위치: `app/profile/page.tsx`의 `handleSave` 함수

#### 장바구니 중복 체크

- [x] 이미 장바구니에 있는 상품인지 확인
- [x] 장바구니에 있는 상품의 '담기' 버튼 비활성화
- [x] 버튼 텍스트를 "장바구니에 있음"으로 변경
- [x] 위치: `app/page.tsx`의 `PromptCard`, `app/prompt/[id]/page.tsx`

### 2. 프롬프트 상세 페이지 기능

#### 구매 완료 확인 및 프롬프트 내용 표시

- [x] 사용자의 구매 내역에서 해당 프롬프트 구매 여부 확인
- [x] 구매 완료 시:
  - [x] 구매 버튼 영역 제거
  - [x] 실제 프롬프트 내용(`prompt_text`) 표시
  - [x] '복사' 버튼 추가 (프롬프트 내용 클립보드 복사)
- [x] 구매 전:
  - [x] 프롬프트 내용 마스킹 처리
- [x] 위치: `app/prompt/[id]/page.tsx`
- [x] 데이터: localStorage의 `purchases` 배열에서 확인

#### 좋아요 기능

- [x] 좋아요 상태 저장 (localStorage 또는 향후 Supabase)
- [ ] 좋아요한 프롬프트 목록 페이지 (향후 구현)
- [x] 위치: `app/prompt/[id]/page.tsx`

#### 공유 기능

- [x] 프롬프트 URL 클립보드 복사
- [ ] 소셜 미디어 공유 (선택사항, 향후 구현)
- [x] 위치: `app/prompt/[id]/page.tsx`

### 3. 프로필 페이지 기능

#### 프로필 이미지 업로드

- [x] 이미지 파일 선택 기능
- [x] 이미지 미리보기
- [ ] Supabase Storage 업로드 (향후 구현)
- [ ] `profiles` 테이블의 `avatar_url` 업데이트 (향후 구현)
- [x] 위치: `app/profile/page.tsx` (localStorage 기반 구현 완료)

### 4. 구매 내역 페이지 기능

#### 프롬프트 다운로드

- [x] 구매한 프롬프트 다운로드 기능 구현
- [x] 프롬프트 내용을 텍스트 파일로 다운로드
- [x] 위치: `app/my-page/page.tsx`

### 5. 리뷰 시스템

#### 리뷰 작성 기능

- [x] 리뷰 작성 폼 (평점, 내용)
- [x] 리뷰 저장 로직 (localStorage 기반)
- [x] 리뷰 목록 표시 개선 (localStorage에서 로드)
- [x] 위치: `app/prompt/[id]/page.tsx`의 리뷰 탭

### 6. 데이터베이스 마이그레이션 (Supabase)

#### 인증 시스템

- [ ] Supabase Auth 연동 여부 결정 (현재 Clerk 사용, Supabase 토큰은 Clerk JWT 템플릿으로 발급)
- [x] Clerk → Supabase JWT 템플릿 사용 (`createPromptRepositoryClient`에서 `session.getToken({ template: "supabase" })`)
- [ ] 회원가입 시 `profiles` 테이블 자동 생성 (Trigger) — Clerk 사용자 메타데이터와 연동 필요
- [ ] 로그인/로그아웃 로직을 Supabase Auth로 전환 또는 Clerk 유지 여부 결정
- [ ] 위치: `features/auth/store/authStore.ts`

#### 데이터베이스 스키마 구축

- [ ] `profiles` 테이블 생성
- [x] `prompts` 테이블 생성 + RLS 정책 (`supabase/migrations/001_create_prompts_table.sql`)
- [ ] `carts` 테이블 생성 (unique constraint: user_id + prompt_id)
- [ ] `purchases` 테이블 생성
- [ ] RLS (Row Level Security) 정책 설정 (프롬프트 외 테이블 미구현)

#### 데이터 마이그레이션

- [ ] localStorage 데이터를 Supabase로 마이그레이션 스크립트
- [ ] 기존 사용자 데이터 보존

#### API 엔드포인트 (Supabase Client)

- [x] 프롬프트 목록 조회 API (`PromptRepositorySupabase.getAll`)
- [x] 프롬프트 상세 조회 API (`PromptRepositorySupabase.getById`)
- [ ] 장바구니 CRUD API
- [ ] 구매 내역 조회 API
- [ ] 프로필 업데이트 API

#### 데이터 소스 정합성

- [ ] 장바구니/결제/마이페이지/관리자 프롬프트가 `mockPrompts`/localStorage 기반 → Supabase `prompts` 사용으로 전환
- [ ] 구매 여부/다운로드 로직을 Supabase `purchases`로 전환 (현재 localStorage `purchases`)
- [ ] 장바구니에 담기는 ID와 Supabase 프롬프트 ID 정합성 확보 (현 `cartItems`는 "1", "2" 고정)

### 7. 결제 시스템 (토스페이먼츠)

#### 토스페이먼츠 연동

- [ ] 토스페이먼츠 SDK 설치 및 설정
- [ ] 결제창 호출 로직 구현
- [ ] 결제 승인 처리
- [ ] 결제 실패 처리
- [ ] 위치: `app/checkout/page.tsx`

#### 결제 보안 강화

- [ ] 서버 사이드 결제 금액 검증
- [ ] 클라이언트가 보낸 가격 정보 무시
- [ ] 서버에서 `carts` 테이블 조회하여 총액 계산
- [ ] 결제 승인 후 트랜잭션 처리:
  - [ ] `purchases` 테이블에 구매 기록 저장
  - [ ] `carts` 테이블에서 구매한 상품 삭제

### 8. 관리자 기능 개선

#### 프롬프트 관리

- [ ] 프롬프트 이미지 업로드 (Supabase Storage)
- [ ] `prompt_text` 필드 추가 (실제 프롬프트 내용)
- [ ] `image_urls` 배열 필드 추가
- [ ] 위치: `app/admin/prompts/page.tsx`, `app/admin/page.tsx`

### 9. 성능 및 최적화

#### 이미지 최적화

- [ ] Next.js Image 컴포넌트 사용
- [ ] 이미지 lazy loading
- [ ] 위치: 모든 이미지 표시 컴포넌트

#### 데이터 페칭 최적화

- [ ] React Query 또는 SWR 도입 (Supabase 마이그레이션 후)
- [ ] 캐싱 전략 수립

### 10. 에러 처리 및 검증

#### 폼 검증

- [ ] 이메일 형식 검증 강화
- [ ] 비밀번호 강도 검증
- [ ] 프롬프트 등록 시 필수 필드 검증

#### 에러 처리

- [ ] 네트워크 에러 처리
- [ ] 사용자 친화적인 에러 메시지
- [ ] 에러 바운더리 추가

### 11. 접근성 및 SEO

#### 접근성

- [ ] 키보드 네비게이션 개선
- [ ] ARIA 레이블 추가
- [ ] 스크린 리더 지원

#### SEO

- [ ] 메타 태그 최적화
- [ ] Open Graph 태그 추가
- [ ] 구조화된 데이터 (JSON-LD) 추가

---

## 📝 우선순위별 작업 계획

### Phase 1: 즉시 개선 (1-2일)

1. 장바구니/결제/마이페이지에서 Supabase `prompts` 사용하도록 교체 (mock ID 1,2 제거)
2. 구매 여부/다운로드 판단을 Supabase `purchases` 기반으로 정리 (localStorage 의존 제거)
3. Clerk ↔ Supabase Auth 전략 결정 및 `profiles` 테이블 자동 생성 트리거 설계

### Phase 2: 기능 완성 (3-5일)

4. 좋아요/공유 기능 구현
5. 프롬프트 다운로드 기능
6. 리뷰 작성 기능
7. 프로필 이미지 업로드 (localStorage 먼저, Supabase는 이후)

### Phase 3: 데이터베이스 마이그레이션 (1-2주)

8. Supabase 프로젝트 설정
9. 데이터베이스 스키마 구축
10. 인증 시스템 마이그레이션
11. 데이터 CRUD API 구현
12. localStorage → Supabase 데이터 마이그레이션

### Phase 4: 결제 시스템 (1주)

13. 토스페이먼츠 연동
14. 서버 사이드 결제 검증
15. 결제 플로우 완성

### Phase 5: 최적화 및 개선 (지속적)

16. 성능 최적화
17. 에러 처리 강화
18. 접근성 및 SEO 개선

---

## 🔍 참고 사항

### 현재 데이터 구조

- **인증**: Clerk 세션 (`@clerk/nextjs`), `features/auth/store/authStore.ts` 래퍼, Supabase JWT 템플릿 사용
- **프롬프트 목록/상세**: Supabase `prompts` 테이블 (홈/상세에서 `PromptRepositorySupabase`)
- **장바구니**: `localStorage`의 `cart-storage` 키 (zustand)
- **구매 내역**: `localStorage`의 `purchases` 키 (`PurchaseRepository.local`)
- **관리자 프롬프트/판매 데이터**: `localStorage`의 `admin_prompts`, `sales_data` 키

### Mock 데이터 위치

- 장바구니/결제: `app/[locale]/cart/page.tsx`, `app/[locale]/checkout/page.tsx`의 `mockPrompts` 객체
- 구매 내역 다운로드: `app/[locale]/my-page/page.tsx`의 `mockPromptDetails` 객체 (ID "1", "2" 기반)

### 향후 마이그레이션 시 주의사항

- 모든 localStorage 접근을 Supabase API 호출로 변경
- 트랜잭션 처리가 필요한 부분 (결제, 장바구니 삭제) 주의
- RLS 정책으로 사용자별 데이터 접근 제어
- 서버 사이드 검증 필수 (특히 결제 금액)
