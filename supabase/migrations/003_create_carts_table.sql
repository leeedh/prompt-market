-- carts 테이블 생성
-- 장바구니 항목: 사용자별 프롬프트 1개씩(unique)

CREATE TABLE IF NOT EXISTS public.carts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE
);

-- 한 사용자가 같은 프롬프트를 중복으로 담지 못하도록 제약
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_prompt_unique
  ON public.carts(user_id, prompt_id);

-- RLS 활성화
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- 본인 장바구니만 읽기
CREATE POLICY "Users can view own cart"
  ON public.carts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 본인 장바구니만 쓰기 (추가/수정/삭제)
CREATE POLICY "Users can modify own cart"
  ON public.carts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.carts IS '사용자 장바구니 항목을 저장하는 테이블';
COMMENT ON COLUMN public.carts.user_id IS '장바구니 소유자 ID (auth.users.id)';
COMMENT ON COLUMN public.carts.prompt_id IS '담긴 프롬프트 ID (prompts.id)';


