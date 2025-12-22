/**
 * StorageClient: localStorage 추상화 레이어
 * 
 * SSR 환경에서 안전하게 동작하도록 window 객체 체크를 포함합니다.
 * 향후 localStorage → Supabase/API로 교체 시 이 인터페이스만 유지하면 됩니다.
 */

export interface StorageClient {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
}

class LocalStorageClient implements StorageClient {
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && window.localStorage !== undefined
  }

  get<T>(key: string): T | null {
    if (!this.isAvailable()) {
      return null
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return null
      }
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Failed to get item from localStorage with key "${key}":`, error)
      return null
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available')
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set item to localStorage with key "${key}":`, error)
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) {
      return
    }

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove item from localStorage with key "${key}":`, error)
    }
  }

  clear(): void {
    if (!this.isAvailable()) {
      return
    }

    try {
      window.localStorage.clear()
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }
}

// 싱글톤 인스턴스
export const storageClient: StorageClient = new LocalStorageClient()

