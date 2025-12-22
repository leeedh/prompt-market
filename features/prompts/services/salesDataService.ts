import { storageClient } from "@/shared/lib/storage/StorageClient"
import type { Prompt } from "../repositories/PromptRepository.local"

export interface SalesData {
  [promptId: string]: {
    monthlyRevenue: number
    weeklySales: number
    lastSale?: string
  }
}

const STORAGE_KEY = "sales_data"

export class SalesDataService {
  /**
   * 모든 판매 데이터 조회
   */
  getAll(): SalesData {
    return storageClient.get<SalesData>(STORAGE_KEY) || {}
  }

  /**
   * 판매 데이터 저장
   */
  saveAll(data: SalesData): void {
    storageClient.set(STORAGE_KEY, data)
  }

  /**
   * 프롬프트 목록을 기반으로 초기 판매 데이터 생성
   */
  initializeForPrompts(prompts: Prompt[]): SalesData {
    const salesData: SalesData = {}
    
    prompts.forEach((prompt) => {
      salesData[prompt.id] = {
        monthlyRevenue: Math.floor(Math.random() * 500000),
        weeklySales: Math.floor(Math.random() * 50),
        lastSale: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }
    })

    this.saveAll(salesData)
    return salesData
  }

  /**
   * 판매 데이터 가져오기 (없으면 초기화)
   */
  getOrInitialize(prompts: Prompt[]): SalesData {
    const existing = this.getAll()
    if (Object.keys(existing).length === 0) {
      return this.initializeForPrompts(prompts)
    }
    return existing
  }
}

// 싱글톤 인스턴스
export const salesDataService = new SalesDataService()

