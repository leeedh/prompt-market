import { storageClient } from "@/shared/lib/storage/StorageClient"

export interface Purchase {
  id: string
  date: string
  items: Array<{
    id: string
    title: string
    price: number
  }>
  total: number
  email: string
  paymentMethod: string
}

const STORAGE_KEY = "purchases"

export class PurchaseRepository {
  /**
   * 모든 구매 내역 조회
   */
  getAll(): Purchase[] {
    return storageClient.get<Purchase[]>(STORAGE_KEY) || []
  }

  /**
   * ID로 구매 내역 조회
   */
  getById(id: string): Purchase | null {
    const purchases = this.getAll()
    return purchases.find((p) => p.id === id) || null
  }

  /**
   * 구매 내역 저장 (전체 교체)
   */
  saveAll(purchases: Purchase[]): void {
    storageClient.set(STORAGE_KEY, purchases)
  }

  /**
   * 구매 내역 추가
   */
  create(purchase: Purchase): void {
    const purchases = this.getAll()
    purchases.push(purchase)
    this.saveAll(purchases)
  }
}

// 싱글톤 인스턴스
export const purchaseRepository = new PurchaseRepository()

