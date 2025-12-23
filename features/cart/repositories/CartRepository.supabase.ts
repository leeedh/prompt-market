import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"

export interface CartItemRow {
  id: number
  created_at: string
  user_id: string
  prompt_id: string
}

export interface CartItem {
  id: number
  createdAt: string
  userId: string
  promptId: string
}

/**
 * Supabase 기반 장바구니 Repository
 *
 * - 한 사용자는 동일한 프롬프트를 한 번만 담을 수 있습니다 (DB unique 제약)
 * - RLS 정책에 의해 본인 장바구니만 조회/수정 가능합니다.
 */
export class CartRepositorySupabase {
  private supabase: SupabaseClient

  /**
   * 클라이언트 컴포넌트: getToken 전달
   * 서버 컴포넌트: SupabaseClient 직접 전달
   */
  constructor(supabaseOrGetToken?: SupabaseClient | (() => Promise<string | null>)) {
    if (supabaseOrGetToken && typeof supabaseOrGetToken !== "function") {
      this.supabase = supabaseOrGetToken
    } else {
      this.supabase = createClient(supabaseOrGetToken as (() => Promise<string | null>) | undefined)
    }
  }

  private mapRow(row: CartItemRow): CartItem {
    return {
      id: row.id,
      createdAt: row.created_at,
      userId: row.user_id,
      promptId: row.prompt_id,
    }
  }

  /**
   * 현재 사용자 장바구니 조회
   */
  async getByUser(userId: string): Promise<CartItem[]> {
    const { data, error } = await this.supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching cart items:", error)
      throw new Error(`Failed to fetch cart items: ${error.message}`)
    }

    return (data || []).map((row) => this.mapRow(row as CartItemRow))
  }

  /**
   * 장바구니에 프롬프트 추가
   * - 이미 존재하면 noop
   */
  async addToCart(userId: string, promptId: string): Promise<void> {
    const { error } = await this.supabase
      .from("carts")
      .insert([{ user_id: userId, prompt_id: promptId }])
      .select()
      .single()

    if (error) {
      // unique 위반인 경우는 이미 담긴 상태이므로 조용히 무시
      if (error.code === "23505") {
        return
      }
      console.error("Error adding to cart:", error)
      throw new Error(`Failed to add to cart: ${error.message}`)
    }
  }

  /**
   * 장바구니에서 특정 프롬프트 제거
   */
  async removeFromCart(userId: string, promptId: string): Promise<void> {
    const { error } = await this.supabase
      .from("carts")
      .delete()
      .eq("user_id", userId)
      .eq("prompt_id", promptId)

    if (error) {
      console.error("Error removing from cart:", error)
      throw new Error(`Failed to remove from cart: ${error.message}`)
    }
  }

  /**
   * 사용자의 장바구니 비우기
   */
  async clearCart(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("carts")
      .delete()
      .eq("user_id", userId)

    if (error) {
      console.error("Error clearing cart:", error)
      throw new Error(`Failed to clear cart: ${error.message}`)
    }
  }
}

export function createCartRepositoryClient(getToken?: () => Promise<string | null>) {
  return new CartRepositorySupabase(getToken)
}


