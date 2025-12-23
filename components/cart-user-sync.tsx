"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/store/authStore";
import { useCart } from "@/features/cart/store/cartStore";

/**
 * Clerk 사용자 ID와 장바구니 스토어를 동기화하는 컴포넌트
 *
 * - 로그인/로그아웃/계정 전환 시마다 currentUserId를 갱신합니다.
 * - 각 사용자별 장바구니는 localStorage 내에서 분리 관리됩니다.
 */
export function CartUserSync() {
  const { user } = useAuth();
  const setUser = useCart((state) => state.setUser);

  useEffect(() => {
    setUser(user?.id ?? null);
  }, [user?.id, setUser]);

  return null;
}


