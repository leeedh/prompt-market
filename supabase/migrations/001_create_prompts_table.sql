-- prompts 테이블 생성
-- PRD 문서의 스키마를 기반으로 생성합니다.

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews INTEGER DEFAULT 0 CHECK (reviews >= 0),
  sales INTEGER DEFAULT 0 CHECK (sales >= 0),
  author TEXT,
  thumbnail TEXT,
  prompt_text TEXT,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  -- 추가 필드 (상세 페이지에서 사용)
  long_description TEXT,
  features TEXT[] DEFAULT '{}',
  contents TEXT,
  how_to_use TEXT,
  author_bio TEXT
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON public.prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);

-- RLS 활성화
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 읽기 가능 (public read)
CREATE POLICY "Public can read prompts"
  ON public.prompts
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS 정책: admin만 쓰기 가능 (INSERT, UPDATE, DELETE)
-- 주의: 실제 admin 체크는 Clerk의 사용자 메타데이터나 별도 admin 테이블을 통해 확인해야 합니다.
-- 여기서는 authenticated 사용자만 쓰기를 허용하도록 설정하고,
-- 실제 admin 체크는 애플리케이션 레벨에서 수행합니다.
-- 향후 admin 테이블이 생성되면 이 정책을 수정해야 합니다.

-- INSERT 정책: authenticated 사용자만 (실제로는 admin만 가능하도록 앱 레벨에서 체크)
CREATE POLICY "Authenticated users can insert prompts"
  ON public.prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE 정책: authenticated 사용자만 (실제로는 admin만 가능하도록 앱 레벨에서 체크)
CREATE POLICY "Authenticated users can update prompts"
  ON public.prompts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE 정책: authenticated 사용자만 (실제로는 admin만 가능하도록 앱 레벨에서 체크)
CREATE POLICY "Authenticated users can delete prompts"
  ON public.prompts
  FOR DELETE
  TO authenticated
  USING (true);

-- 주석 추가
COMMENT ON TABLE public.prompts IS '프롬프트 상품 정보를 저장하는 테이블';
COMMENT ON COLUMN public.prompts.id IS '프롬프트 고유 ID (UUID)';
COMMENT ON COLUMN public.prompts.title IS '프롬프트 제목';
COMMENT ON COLUMN public.prompts.description IS '프롬프트 간단 설명';
COMMENT ON COLUMN public.prompts.long_description IS '프롬프트 상세 설명';
COMMENT ON COLUMN public.prompts.price IS '프롬프트 가격 (원)';
COMMENT ON COLUMN public.prompts.category IS '카테고리 (ChatGPT, Midjourney, Claude, Stable Diffusion, 기타)';
COMMENT ON COLUMN public.prompts.tags IS '태그 배열';
COMMENT ON COLUMN public.prompts.prompt_text IS '실제 프롬프트 내용 (구매 후 확인 가능)';
COMMENT ON COLUMN public.prompts.status IS '상태 (active: 판매 중, inactive: 판매 중지)';

