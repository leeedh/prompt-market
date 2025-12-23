-- purchases 테이블 생성
-- 한 행이 "사용자-프롬프트" 단위 구매를 나타냅니다.

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  payment_order_id TEXT NOT NULL,
  UNIQUE (payment_order_id, prompt_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id
  ON public.purchases(buyer_id);

CREATE INDEX IF NOT EXISTS idx_purchases_prompt_id
  ON public.purchases(prompt_id);

CREATE INDEX IF NOT EXISTS idx_purchases_created_at
  ON public.purchases(created_at DESC);

-- RLS 활성화
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- 본인 구매 내역만 조회 가능
CREATE POLICY "Users can view own purchases"
  ON public.purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

-- 본인 구매 내역만 생성 가능
CREATE POLICY "Users can insert own purchases"
  ON public.purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

COMMENT ON TABLE public.purchases IS '사용자별 프롬프트 구매 내역을 저장하는 테이블';
COMMENT ON COLUMN public.purchases.buyer_id IS '구매자 ID (auth.users.id)';
COMMENT ON COLUMN public.purchases.prompt_id IS '구매한 프롬프트 ID (prompts.id)';
COMMENT ON COLUMN public.purchases.payment_order_id IS '결제 주문 ID (토스페이먼츠 등 외부 결제 ID)';


