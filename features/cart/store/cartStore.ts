"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartStore {
  cartItems: string[]
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      cartItems: [],
      addToCart: (id) =>
        set((state) => {
          if (state.cartItems.includes(id)) {
            return state
          }
          return { cartItems: [...state.cartItems, id] }
        }),
      removeFromCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item !== id),
        })),
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: "cart-storage",
    },
  ),
)

