import { createClient } from "@/utils/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Supabase를 사용하는 Prompt Repository
 * 
 * 이 클래스는 Supabase 데이터베이스와 상호작용하여 프롬프트 데이터를 관리합니다.
 * RLS 정책에 따라:
 * - 모든 사용자(인증/비인증)는 읽기 가능
 * - 인증된 사용자만 쓰기 가능 (실제 admin 체크는 애플리케이션 레벨에서 수행)
 */
export interface Prompt {
  id: string
  title: string
  description: string
  price: number
  category: string
  tags: string[]
  rating?: number
  reviews?: number
  sales?: number
  author?: string
  thumbnail?: string
  prompt_text?: string
  image_urls?: string[]
  createdAt?: string
  status?: "active" | "inactive"
  // 상세 페이지용 추가 필드
  long_description?: string
  features?: string[]
  contents?: string
  how_to_use?: string
  author_bio?: string
}

/**
 * Supabase 데이터베이스 스키마와 매핑되는 타입
 */
export interface PromptRow {
  id: string
  created_at: string
  title: string
  description: string
  price: number
  category: string
  tags: string[]
  rating: number | null
  reviews: number | null
  sales: number | null
  author: string | null
  thumbnail: string | null
  prompt_text: string | null
  image_urls: string[]
  status: "active" | "inactive"
  long_description: string | null
  features: string[]
  contents: string | null
  how_to_use: string | null
  author_bio: string | null
}

export class PromptRepositorySupabase {
  private supabase: SupabaseClient

  /**
   * 클라이언트 컴포넌트에서 사용: getToken 함수를 전달
   * 서버 컴포넌트에서 사용: SupabaseClient를 직접 전달
   */
  constructor(supabaseOrGetToken?: SupabaseClient | (() => Promise<string | null>)) {
    if (supabaseOrGetToken && typeof supabaseOrGetToken !== 'function') {
      // SupabaseClient를 직접 전달한 경우 (서버 컴포넌트)
      this.supabase = supabaseOrGetToken
    } else {
      // getToken 함수를 전달한 경우 (클라이언트 컴포넌트)
      this.supabase = createClient(supabaseOrGetToken as (() => Promise<string | null>) | undefined)
    }
  }

  /**
   * Supabase Row를 Prompt 인터페이스로 변환
   */
  private mapRowToPrompt(row: PromptRow): Prompt {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      category: row.category,
      tags: row.tags || [],
      rating: row.rating ?? undefined,
      reviews: row.reviews ?? undefined,
      sales: row.sales ?? undefined,
      author: row.author ?? undefined,
      thumbnail: row.thumbnail ?? undefined,
      prompt_text: row.prompt_text ?? undefined,
      image_urls: row.image_urls || [],
      createdAt: row.created_at,
      status: row.status,
      long_description: row.long_description ?? undefined,
      features: row.features || [],
      contents: row.contents ?? undefined,
      how_to_use: row.how_to_use ?? undefined,
      author_bio: row.author_bio ?? undefined,
    }
  }

  /**
   * Prompt 인터페이스를 Supabase Row로 변환
   */
  private mapPromptToRow(prompt: Partial<Prompt>): Partial<PromptRow> {
    const row: Partial<PromptRow> = {}

    if (prompt.title !== undefined) row.title = prompt.title
    if (prompt.description !== undefined) row.description = prompt.description
    if (prompt.price !== undefined) row.price = prompt.price
    if (prompt.category !== undefined) row.category = prompt.category
    if (prompt.tags !== undefined) row.tags = prompt.tags
    if (prompt.rating !== undefined) row.rating = prompt.rating ?? null
    if (prompt.reviews !== undefined) row.reviews = prompt.reviews ?? null
    if (prompt.sales !== undefined) row.sales = prompt.sales ?? null
    if (prompt.author !== undefined) row.author = prompt.author ?? null
    if (prompt.thumbnail !== undefined) row.thumbnail = prompt.thumbnail ?? null
    if (prompt.prompt_text !== undefined) row.prompt_text = prompt.prompt_text ?? null
    if (prompt.image_urls !== undefined) row.image_urls = prompt.image_urls || []
    if (prompt.status !== undefined) row.status = prompt.status || "active"
    if (prompt.long_description !== undefined) row.long_description = prompt.long_description ?? null
    if (prompt.features !== undefined) row.features = prompt.features || []
    if (prompt.contents !== undefined) row.contents = prompt.contents ?? null
    if (prompt.how_to_use !== undefined) row.how_to_use = prompt.how_to_use ?? null
    if (prompt.author_bio !== undefined) row.author_bio = prompt.author_bio ?? null

    return row
  }

  /**
   * 모든 프롬프트 조회
   * @param filters - 필터 옵션 (카테고리, 상태 등)
   */
  async getAll(filters?: {
    category?: string
    status?: "active" | "inactive"
    search?: string
  }): Promise<Prompt[]> {
    let query = this.supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false })

    // 필터 적용
    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching prompts:", error)
      throw new Error(`Failed to fetch prompts: ${error.message}`)
    }

    return (data || []).map((row) => this.mapRowToPrompt(row as PromptRow))
  }

  /**
   * ID로 프롬프트 조회
   */
  async getById(id: string): Promise<Prompt | null> {
    const { data, error } = await this.supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // 레코드를 찾을 수 없음
        return null
      }
      console.error("Error fetching prompt:", error)
      throw new Error(`Failed to fetch prompt: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return this.mapRowToPrompt(data as PromptRow)
  }

  /**
   * 프롬프트 생성
   * 주의: 실제 admin 체크는 애플리케이션 레벨에서 수행해야 합니다.
   */
  async create(prompt: Omit<Prompt, "id" | "createdAt">): Promise<Prompt> {
    const row = this.mapPromptToRow(prompt)

    const { data, error } = await this.supabase
      .from("prompts")
      .insert([row])
      .select()
      .single()

    if (error) {
      console.error("Error creating prompt:", error)
      throw new Error(`Failed to create prompt: ${error.message}`)
    }

    return this.mapRowToPrompt(data as PromptRow)
  }

  /**
   * 프롬프트 업데이트
   * 주의: 실제 admin 체크는 애플리케이션 레벨에서 수행해야 합니다.
   */
  async update(id: string, updates: Partial<Prompt>): Promise<Prompt> {
    const row = this.mapPromptToRow(updates)

    const { data, error } = await this.supabase
      .from("prompts")
      .update(row)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating prompt:", error)
      throw new Error(`Failed to update prompt: ${error.message}`)
    }

    return this.mapRowToPrompt(data as PromptRow)
  }

  /**
   * 프롬프트 삭제
   * 주의: 실제 admin 체크는 애플리케이션 레벨에서 수행해야 합니다.
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("prompts")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting prompt:", error)
      throw new Error(`Failed to delete prompt: ${error.message}`)
    }
  }
}

/**
 * 클라이언트 컴포넌트에서 사용할 Repository 인스턴스 생성 함수
 */
export function createPromptRepositoryClient(getToken?: () => Promise<string | null>) {
  return new PromptRepositorySupabase(getToken)
}

