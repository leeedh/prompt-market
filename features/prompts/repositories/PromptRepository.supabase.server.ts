/**
 * 서버 컴포넌트에서 사용할 Supabase Prompt Repository
 * 
 * 이 파일은 서버 전용이므로 클라이언트 번들에 포함되지 않습니다.
 * 서버 컴포넌트, Server Actions, Route Handlers에서만 사용하세요.
 */

import { createClient } from "@/utils/supabase/server"
import { PromptRepositorySupabase } from "./PromptRepository.supabase"

/**
 * 서버 컴포넌트에서 사용할 Repository 인스턴스 생성 함수
 * 
 * @example
 * ```tsx
 * // Server Component
 * import { createPromptRepositoryServer } from '@/features/prompts/repositories/PromptRepository.supabase.server'
 * 
 * export default async function Page() {
 *   const repository = await createPromptRepositoryServer()
 *   const prompts = await repository.getAll()
 *   return <div>{prompts.map(p => <div key={p.id}>{p.title}</div>)}</div>
 * }
 * ```
 */
export async function createPromptRepositoryServer() {
  const supabase = await createClient()
  return new PromptRepositorySupabase(supabase)
}

