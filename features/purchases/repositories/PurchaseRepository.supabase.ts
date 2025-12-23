import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"

export interface PurchaseRow {
  id: string
  created_at: string
  buyer_id: string
  prompt_id: string
  payment_order_id: string
}

export interface Purchase {
  id: string
  createdAt: string
  buyerId: string
  promptId: string
  paymentOrderId: string
}

/**
 * Supabase 기반 구매 내역 Repository
 *
 * - 한 행이 사용자-프롬프트 단위의 구매를 나타냅니다.
 * - 동일한 결제(payment_order_id)에서 여러 프롬프트를 산 경우, 여러 행이 생성됩니다.
 */
export class PurchaseRepositorySupabase {
  private supabase: SupabaseClient

  constructor(supabaseOrGetToken?: SupabaseClient | (() => Promise<string | null>)) {
    if (supabaseOrGetToken && typeof supabaseOrGetToken !== "function") {
      this.supabase = supabaseOrGetToken
    } else {
      this.supabase = createClient(supabaseOrGetToken as (() => Promise<string | null>) | undefined)
    }
  }

  private mapRow(row: PurchaseRow): Purchase {
    return {
      id: row.id,
      createdAt: row.created_at,
      buyerId: row.buyer_id,
      promptId: row.prompt_id,
      paymentOrderId: row.payment_order_id,
    }
  }

  /**
   * 현재 사용자 구매 내역 조회
   */
  async getByBuyer(buyerId: string): Promise<Purchase[]> {
    const { data, error } = await this.supabase
      .from("purchases")
      .select("*")
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching purchases:", error)
      throw new Error(`Failed to fetch purchases: ${error.message}`)
    }

    return (data || []).map((row) => this.mapRow(row as PurchaseRow))
  }

  /**
   * 특정 프롬프트를 이미 구매했는지 여부 확인
   */
  async hasPurchased(buyerId: string, promptId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", buyerId)
      .eq("prompt_id", promptId)
      .limit(1)

    if (error) {
      console.error("Error checking purchase:", error)
      throw new Error(`Failed to check purchase: ${error.message}`)
    }

    return !!data && data.length > 0
  }

  /**
   * 여러 프롬프트에 대한 구매 레코드 생성
   *
   * @param buyerId - 구매자 ID
   * @param promptIds - 구매한 프롬프트 ID 배열
   * @param paymentOrderId - 외부 결제 주문 ID
   */
  async createMany(buyerId: string, promptIds: string[], paymentOrderId: string): Promise<Purchase[]> {
    if (promptIds.length === 0) {
      return []
    }

    const rows = promptIds.map((promptId) => ({
      buyer_id: buyerId,
      prompt_id: promptId,
      payment_order_id: paymentOrderId,
    }))

    const { data, error } = await this.supabase
      .from("purchases")
      .insert(rows)
      .select("*")

    if (error) {
      console.error("Error creating purchases:", error)
      throw new Error(`Failed to create purchases: ${error.message}`)
    }

    return (data || []).map((row) => this.mapRow(row as PurchaseRow))
  }
}

export function createPurchaseRepositoryClient(getToken?: () => Promise<string | null>) {
  return new PurchaseRepositorySupabase(getToken)
}


