import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"

export interface ProfileRow {
  id: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  name: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Supabase 기반 Profile Repository
 *
 * - auth.users와 1:1 매핑되는 profiles 테이블을 대상으로 합니다.
 * - RLS 정책상 사용자는 자신의 프로필만 조회/수정할 수 있습니다.
 */
export class ProfileRepositorySupabase {
  private supabase: SupabaseClient

  constructor(supabaseOrGetToken?: SupabaseClient | (() => Promise<string | null>)) {
    if (supabaseOrGetToken && typeof supabaseOrGetToken !== "function") {
      this.supabase = supabaseOrGetToken
    } else {
      this.supabase = createClient(supabaseOrGetToken as (() => Promise<string | null>) | undefined)
    }
  }

  private mapRow(row: ProfileRow): Profile {
    return {
      id: row.id,
      name: row.name,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  /**
   * 현재 사용자 프로필 조회
   */
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      // 레코드 없음
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Error fetching profile:", error)
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return this.mapRow(data as ProfileRow)
  }

  /**
   * 이름 업데이트
   */
  async updateName(id: string, name: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({ name })
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("Error updating profile name:", error)
      throw new Error(`Failed to update profile name: ${error.message}`)
    }

    return this.mapRow(data as ProfileRow)
  }

  /**
   * 아바타 URL 업데이트
   */
  async updateAvatarUrl(id: string, avatarUrl: string | null): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("Error updating profile avatar:", error)
      throw new Error(`Failed to update profile avatar: ${error.message}`)
    }

    return this.mapRow(data as ProfileRow)
  }
}

export function createProfileRepositoryClient(getToken?: () => Promise<string | null>) {
  return new ProfileRepositorySupabase(getToken)
}


