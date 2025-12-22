# 프롬프트 기능 Supabase 연동 가이드

이 문서는 프롬프트 관련 기능을 Supabase와 연동하는 방법을 설명합니다.

## 📋 작업 완료 내역

### 1. Supabase 테이블 생성

- **파일 위치**: `supabase/migrations/001_create_prompts_table.sql`
- **테이블명**: `prompts`
- **RLS 정책**:
  - 읽기: 모든 사용자 (authenticated, anon) 가능
  - 쓰기: authenticated 사용자만 가능 (실제 admin 체크는 애플리케이션 레벨에서 수행)

### 2. Supabase Repository 생성

- **파일 위치**: `features/prompts/repositories/PromptRepository.supabase.ts`
- **주요 기능**:
  - `getAll()`: 프롬프트 목록 조회 (필터링 지원)
  - `getById()`: ID로 프롬프트 조회
  - `create()`: 프롬프트 생성
  - `update()`: 프롬프트 수정
  - `delete()`: 프롬프트 삭제

### 3. Seed 데이터 스크립트

- **파일 위치**: `scripts/seed-prompts.ts`
- **사용 방법**:
  ```bash
  # 환경 변수 설정 후
  FORCE_SEED=true pnpm tsx scripts/seed-prompts.ts
  ```

### 4. 페이지 연동 완료

- ✅ 메인 페이지 (`app/[locale]/page.tsx`)
- ✅ 프롬프트 상세 페이지 (`app/[locale]/prompt/[id]/page.tsx`)
- ✅ Admin 페이지 (`app/[locale]/admin/page.tsx`)
- ✅ Admin 프롬프트 관리 페이지 (`app/[locale]/admin/prompts/page.tsx`)

## 🚀 사용 방법

### 1. Supabase 테이블 생성

Supabase 대시보드에서 SQL Editor를 열고 다음 SQL을 실행하세요:

```sql
-- supabase/migrations/001_create_prompts_table.sql 파일의 내용을 복사하여 실행
```

또는 Supabase CLI를 사용하는 경우:

```bash
supabase db push
```

### 2. 초기 데이터 삽입

```bash
# 환경 변수 확인 (.env.local)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 기존 데이터 삭제 후 새로 삽입
FORCE_SEED=true pnpm tsx scripts/seed-prompts.ts

# 또는 기존 데이터 유지하고 추가만
pnpm tsx scripts/seed-prompts.ts
```

### 3. 애플리케이션 실행

```bash
pnpm dev
```

## 📝 주요 변경 사항

### Repository 패턴

기존의 `PromptRepository.local.ts`는 localStorage를 사용했지만, 이제 `PromptRepository.supabase.ts`를 사용하여 Supabase와 연동합니다.

**클라이언트 컴포넌트에서 사용**:
```typescript
import { createPromptRepositoryClient } from "@/features/prompts/repositories"
import { useSession } from "@clerk/nextjs"

const { session } = useSession()
const repository = createPromptRepositoryClient(async () => {
  return await session?.getToken({ template: "supabase" }) ?? null
})

const prompts = await repository.getAll({ status: "active" })
```

**서버 컴포넌트에서 사용**:
```typescript
import { createPromptRepository } from "@/features/prompts/repositories"

const repository = await createPromptRepository()
const prompts = await repository.getAll()
```

### 데이터 구조

Supabase 테이블의 컬럼명은 snake_case를 사용하며, TypeScript 인터페이스는 camelCase를 사용합니다. Repository에서 자동으로 변환합니다.

- `created_at` → `createdAt`
- `long_description` → `long_description` (상세 페이지에서 사용)
- `how_to_use` → `how_to_use`
- `author_bio` → `author_bio`

## ⚠️ 주의사항

1. **Admin 권한 체크**: 현재 RLS 정책은 authenticated 사용자만 쓰기를 허용합니다. 실제 admin 체크는 애플리케이션 레벨에서 수행해야 합니다.

2. **Clerk 인증**: Clerk 세션 토큰을 Supabase 클라이언트에 전달하여 인증된 요청을 수행합니다.

3. **다른 기능**: 장바구니, 구매 내역, 리뷰 등 다른 기능들은 아직 localStorage를 사용합니다.

## 🔄 향후 작업

- [ ] Admin 권한 체크 로직 추가
- [ ] 에러 핸들링 개선
- [ ] 로딩 상태 UI 개선
- [ ] 캐싱 전략 추가 (필요시)

