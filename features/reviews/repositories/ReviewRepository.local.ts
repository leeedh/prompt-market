import { storageClient } from "@/shared/lib/storage/StorageClient"

export interface Review {
  id: string
  author: string
  rating: number
  date: string
  content: string
}

export class ReviewRepository {
  private getStorageKey(promptId: string): string {
    return `reviews_${promptId}`
  }

  /**
   * 프롬프트의 모든 리뷰 조회
   */
  getByPromptId(promptId: string): Review[] {
    const key = this.getStorageKey(promptId)
    return storageClient.get<Review[]>(key) || []
  }

  /**
   * 리뷰 추가
   */
  create(promptId: string, review: Review): void {
    const reviews = this.getByPromptId(promptId)
    const updatedReviews = [review, ...reviews]
    const key = this.getStorageKey(promptId)
    storageClient.set(key, updatedReviews)
  }
}

// 싱글톤 인스턴스
export const reviewRepository = new ReviewRepository()

