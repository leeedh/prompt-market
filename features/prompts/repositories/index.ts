/**
 * Prompt Repository 인덱스 파일
 * 
 * 환경에 따라 적절한 Repository를 export합니다.
 * 현재는 Supabase Repository를 기본으로 사용합니다.
 * 
 * 주의: 서버 전용 함수는 이 파일에서 export하지 않습니다.
 * 서버 컴포넌트에서는 `PromptRepository.supabase.server.ts`를 직접 import하세요.
 */

// Supabase Repository (프로덕션)
// 클라이언트 컴포넌트용만 export (서버 전용은 별도 파일로 분리)
export {
  PromptRepositorySupabase,
  createPromptRepositoryClient,
  type Prompt,
  type PromptRow,
} from "./PromptRepository.supabase"

// Local Repository (개발/테스트용, 필요시 사용)
export { PromptRepository, promptRepository as localPromptRepository } from "./PromptRepository.local"

