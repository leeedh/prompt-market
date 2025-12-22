
---

## 1) 코드베이스 전반 평가 요약 (구조 + 코드스타일)

### ✅ 전체 구조(아키텍처) 관점

* **라우팅 구조가 중복**되어 유지보수 비용이 크게 증가합니다.
  `app/...` 과 `app/[locale]/...`에 **동일 페이지가 1:1로 중복**(예: `app/my-page/page.tsx` ↔ `app/[locale]/my-page/page.tsx`, `admin/prompts`, `checkout`, `prompt/[id]` 등)되어 있습니다.
* **페이지 컴포넌트가 너무 큼(“God Page”)**
  30k~36k 라인 수준의 페이지가 존재하고(`my-page`, `prompt/[id]`), UI/상태/스토리지/비즈니스 규칙이 한 파일에 섞여 있어요.
* **도메인/기능 단위의 레이어가 없음**
  `lib/`가 사실상 `utils.ts`만 있고, 기능별(예: prompts, cart, auth)로 **domain/service/repository/store**가 분리되어 있지 않습니다.
* **localStorage 직접 접근이 페이지에 퍼져있음**
  스토리지 접근이 여러 페이지에 흩어져 있어 교체/확장(추후 서버 API, Supabase 등) 시 대규모 수정이 필요합니다.
* **Zustand store가 `hooks/` 폴더에 위치**
  store는 hook이 아니라 상태 레이어인데 `hooks/use-auth.tsx`, `hooks/use-cart.tsx`로 들어가 있어 구조적으로 혼동을 유발합니다.

### ✅ 코드스타일/일관성 관점

* `"use client"`가 페이지 레벨에 넓게 적용되어 있을 가능성이 큽니다(실제 페이지들이 클라이언트 컴포넌트로 시작).
  Next App Router의 장점(서버 컴포넌트/데이터 페칭/번들 절감)을 못 쓰는 구조가 됩니다.
* ESLint 스크립트는 있는데(`"lint": "eslint ."`), **구체 룰/Prettier/Import 정렬** 등 팀/프로젝트 표준이 보이지 않습니다(구성 파일 부재).
* 타입/모델이 기능별로 분산되거나 인라인(interface가 파일 내부에만 존재)될 확률이 높아 **타입 재사용성과 변경 안정성**이 떨어집니다.

---

## 2) “클린코드로 개선” 관점에서 반드시 손봐야 할 핵심 포인트(엄격 기준)

아래는 “고쳐도 좋다”가 아니라, **지금 상태에서 확장 가능한 코드베이스로 만들려면 필수**에 가까운 항목들입니다.

### A. 라우팅/국제화(i18n) 구조 정리 (최우선)

* 목표: **라우트 중복 제거**
* 권장: next-intl 표준 패턴으로 **`app/[locale]/...`만 단일 소스**로 두고, `app/...`(non-locale) 라우트는 제거하거나 redirect 전용으로 축소.

**즉시 효과**

* 동일 페이지 수정이 2배로 드는 문제 제거
* 버그/기능 누락(한쪽만 고치는 실수) 방지

---

### B. 기능 단위(Feature / Domain) 아키텍처 도입

지금은 `app/*/page.tsx`에서 모든 걸 다 합니다. 이걸 아래처럼 쪼개야 합니다.

* `features/<feature>/`

  * `components/` (UI 조각)
  * `hooks/` (UI 전용 hook)
  * `domain/` (타입/규칙)
  * `services/` (유스케이스)
  * `repositories/` (데이터 접근: localStorage / API)
  * `store/` (zustand)

**즉시 효과**

* 페이지는 “조립”만 하고, 로직은 기능 폴더로 이동
* localStorage → API 로 바꿀 때 repository만 바꾸면 됨

---

### C. 스토리지 접근(localStorage) 중앙화 + 교체 가능하게 만들기

현재 여러 페이지에서 `localStorage.getItem/setItem` 직접 호출이 보입니다.

**개선 원칙**

* localStorage는 “인프라”입니다. UI나 페이지가 알면 안 됩니다.
* Repository 패턴으로 감싸서 단일 진입점으로 만듭니다.

---

### D. “God Page” 분해 (my-page / prompt/[id] 등)

페이지를 아래처럼 역할로 쪼갭니다.

* `Page` = 라우팅 파라미터/메타/레이아웃 조립만
* `Feature Container` = 상태/데이터 연결
* `Presentational Components` = 순수 UI

---

### E. Next App Router를 제대로 쓰도록 “서버/클라이언트 경계” 재설계

* 가능한 많은 컴포넌트를 **서버 컴포넌트**로 유지
* 진짜 필요한 컴포넌트만 `"use client"`
* 상태 관리도 “페이지 전체 클라이언트화” 대신 **부분 클라이언트 islands**로 줄이기

---

### F. 코드 품질 게이트(린트/포맷/타입) 확립

* ESLint + Prettier + import 정렬 + unused 제거를 **커밋 훅**으로 강제
* TS `strict` 실질 강화(가능한 범위부터 점진 적용)

---

# 3) 자세한 구현 계획 (완성본)

아래는 “실제로 리팩토링 PR을 쪼개서 진행 가능한” 형태의 실행 계획입니다.
(중간에 멈춰도 코드베이스가 망가지지 않게 **단계별 안전장치** 포함)

---

## Phase 0. 기준선 확보 (반드시 먼저)

1. **`docs/architecture.md`** 생성

   * 현재 폴더 구조/라우팅/i18n 현황
   * 리팩토링 목표 구조(아래 Phase 2의 구조) 명시
2. `main`에서 리팩토링 브랜치 생성
3. “동작 유지”를 위한 최소 스모크 체크 정의

   * `/ko`, `/ko/login`, `/ko/my-page`, `/ko/prompt/:id`, `/ko/admin/prompts`, `/ko/checkout` 정도

---

## Phase 1. 라우팅 중복 제거 (가장 큰 ROI)

### 목표

* `app/[locale]/...`를 **유일한 라우트 소스**로 만들기
* `app/...`는 제거 또는 redirect 전용

### 작업 순서

1. `app/page.tsx`, `app/login/page.tsx`, `app/my-page/page.tsx`, `app/prompt/[id]/page.tsx`, `app/admin/*`, `app/checkout/*`, `app/cart/*`, `app/profile/*` 등 **non-locale 라우트 제거**
2. 만약 `/` 접근을 유지해야 한다면:

   * `app/page.tsx`는 “redirect to default locale(ko)”만 담당
3. 중복 제거 후, `app/[locale]/layout.tsx`만을 레이아웃 단일 기준으로 확정

### 산출물(완료 조건)

* 페이지 로직이 2벌 존재하지 않음
* locale 라우트에서만 모든 기능 동작

---

## Phase 2. 폴더 구조 재편 (features 중심)

### 목표 구조(예시)

```
/app
  /[locale]
    /(site)
      page.tsx
      login/page.tsx
      my-page/page.tsx
      prompt/[id]/page.tsx
      checkout/page.tsx
      cart/page.tsx
      profile/page.tsx
    /(admin)
      admin/page.tsx
      admin/prompts/page.tsx

/features
  /auth
    /domain (User, Session)
    /repositories (AuthRepository)
    /services (login, logout, signup usecases)
    /store (authStore)
    /components
  /cart
    /domain
    /repositories
    /services
    /store
    /components
  /prompts
    ...
/shared
  /ui (shadcn wrapper만, 필요 시)
  /lib (date, format, invariant, env)
  /types
  /constants
```

### 작업 순서

1. `hooks/use-auth.tsx`, `hooks/use-cart.tsx` 이동

   * `features/auth/store/authStore.ts`
   * `features/cart/store/cartStore.ts`
2. UI hook(`use-mobile`, `use-toast`)는

   * `shared/hooks/`로 이동 (진짜 hook만)
3. `lib/utils.ts`는 유지하되, 범용 유틸만 남기고 기능 로직이 섞였으면 분리

---

## Phase 3. localStorage 접근 중앙화 (Repository 도입)

### 목표

페이지/컴포넌트에서 `localStorage.*`를 **완전히 제거**

### 구현 가이드

1. `shared/lib/storage/StorageClient.ts`

   * `get(key)`, `set(key, value)`, `remove(key)`
   * JSON parse/stringify, try/catch, SSR 가드(`typeof window`)
2. 각 feature에 repository 구현

   * 예: `features/prompts/repositories/PromptRepository.local.ts`
   * 내부에서만 StorageClient 사용
3. 서비스 레이어가 repository를 사용하도록

   * 예: `features/prompts/services/getPromptDetail.ts`

### 완료 조건

* `grep localStorage` 했을 때 feature repository/StorageClient 외에는 0건

---

## Phase 4. “God Page” 해체 (가장 중요한 클린코드 작업)

대상(우선순위):

1. `app/[locale]/my-page/page.tsx` (36k)
2. `app/[locale]/prompt/[id]/page.tsx` (31k)
3. `admin/prompts`, `checkout`

### 해체 방식(템플릿)

* `page.tsx`는 아래만 남깁니다:

  * params 읽기
  * layout 조립
  * `<MyPageContainer />` 렌더

* `features/<x>/components/*Container.tsx`

  * 상태 연결(zustand)
  * 서비스 호출
  * child component에 props로 전달

* `features/<x>/components/*View.tsx`

  * 순수 UI
  * props 기반, side effect 최소

### 완료 조건

* page.tsx 파일이 “짧고 읽히는 수준”(대략 80~150줄 내)으로 축소
* 기능 변경 시 page가 아니라 feature 내부만 수정

---

## Phase 5. 서버/클라이언트 경계 재정리 (Next.js 성능/구조 개선)

### 목표

* 가능한 한 server component 유지
* client는 “상호작용 UI 섬”으로 최소화

### 작업 순서

1. `"use client"`가 붙은 페이지를 없애고,

   * 상호작용 컴포넌트만 client로 분리
2. 번역(next-intl)은 server에서 가능한 부분은 server에서 처리
3. 스토어가 필요한 화면만 client container로

---

## Phase 6. 품질 게이트 확립 (클린코드 강제 장치)

1. ESLint 설정 명시화(프로젝트 루트에 설정 파일 추가)

   * unused import/vars, import order, react hooks rules 등
2. Prettier 추가 + format 스크립트
3. (권장) husky + lint-staged로 커밋 시 강제
4. tsconfig strict 옵션 점진 강화(한 번에 올리면 폭발하니 단계적)

---

## Phase 7. 정리/문서화/회귀 방지

1. `docs/refactoring-notes.md`

   * 어떤 결정을 왜 했는지 기록(나중에 본인이 까먹는 걸 막는게 핵심)
2. 최소 단위 테스트(가능하면)

   * repository/service는 vitest 같은 걸로 빠르게 단위 테스트 가능
3. Lighthouse JSON(`docs/localhost_lighthouse.json`)은 산출물이라면 보관하되, 배포/빌드에 영향 없게 관리

---

## 리팩토링 완료 후 “좋은 상태”의 정의(체크리스트)

* [ ] 라우트 중복 0 (locale 단일)
* [ ] page.tsx는 조립만 한다
* [ ] localStorage 직접 접근 0 (repository만)
* [ ] 기능 로직은 features 내부에서만 산다
* [ ] store는 hooks 폴더가 아니라 store 레이어에 있다
* [ ] eslint/prettier가 커밋 단에서 강제된다

---

