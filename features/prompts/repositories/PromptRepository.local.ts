import { storageClient } from "@/shared/lib/storage/StorageClient"

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
}

const STORAGE_KEY = "admin_prompts"

export class PromptRepository {
  /**
   * 모든 프롬프트 조회
   */
  getAll(): Prompt[] {
    return storageClient.get<Prompt[]>(STORAGE_KEY) || []
  }

  /**
   * ID로 프롬프트 조회
   */
  getById(id: string): Prompt | null {
    const prompts = this.getAll()
    return prompts.find((p) => p.id === id) || null
  }

  /**
   * 프롬프트 저장 (전체 교체)
   */
  saveAll(prompts: Prompt[]): void {
    storageClient.set(STORAGE_KEY, prompts)
  }

  /**
   * 프롬프트 추가
   */
  create(prompt: Prompt): void {
    const prompts = this.getAll()
    prompts.push(prompt)
    this.saveAll(prompts)
  }

  /**
   * 프롬프트 업데이트
   */
  update(id: string, updates: Partial<Prompt>): void {
    const prompts = this.getAll()
    const index = prompts.findIndex((p) => p.id === id)
    if (index !== -1) {
      prompts[index] = { ...prompts[index], ...updates }
      this.saveAll(prompts)
    }
  }

  /**
   * 프롬프트 삭제
   */
  delete(id: string): void {
    const prompts = this.getAll()
    const filtered = prompts.filter((p) => p.id !== id)
    this.saveAll(filtered)
  }
}

// 싱글톤 인스턴스
export const promptRepository = new PromptRepository()

