"use client"

/**
 * Clerk 기반 인증 스토어
 * 
 * 이 파일은 Clerk 인증 시스템을 사용하는 래퍼입니다.
 * 기존 코드와의 호환성을 유지하면서 Clerk의 기능을 사용합니다.
 * 
 * @see https://clerk.com/docs/nextjs/getting-started/quickstart
 */

import { useUser, useClerk } from "@clerk/nextjs"

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

/**
 * Clerk 기반 인증 훅
 * 
 * 기존 useAuth와 호환되는 인터페이스를 제공하지만,
 * 내부적으로는 Clerk의 useUser와 useClerk를 사용합니다.
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, logout } = useAuth()
 * ```
 */
export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()

  // Clerk 사용자 정보를 기존 User 인터페이스로 변환
  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        name: clerkUser.fullName || clerkUser.firstName || clerkUser.username || "",
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      }
    : null

  const isAuthenticated = isLoaded && !!clerkUser

  const logout = async () => {
    await signOut()
  }

  // updateProfile은 Clerk의 사용자 프로필 업데이트 API를 사용
  // 실제 구현은 Clerk Dashboard에서 관리하거나, useUser().user.update()를 사용
  const updateProfile = async (name: string) => {
    if (clerkUser) {
      await clerkUser.update({
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
      })
    }
  }

  // login과 register는 Clerk의 SignIn/SignUp 컴포넌트를 사용하므로
  // 여기서는 더 이상 필요하지 않지만, 호환성을 위해 빈 함수 제공
  const login = async (_email: string, _password: string): Promise<boolean> => {
    // Clerk의 SignIn 컴포넌트를 사용하므로 여기서는 아무것도 하지 않음
    return false
  }

  const register = async (_email: string, _password: string, _name: string): Promise<boolean> => {
    // Clerk의 SignUp 컴포넌트를 사용하므로 여기서는 아무것도 하지 않음
    return false
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  }
}

