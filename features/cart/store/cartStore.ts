"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartStore {
  currentUserId: string | null
  itemsByUser: Record<string, string[]>
  cartItems: string[]
  setUser: (userId: string | null) => void
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

const getUserKey = (userId: string | null) => userId ?? "__guest__"

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      currentUserId: null,
      itemsByUser: {},
      cartItems: [],
      setUser: (userId) =>
        set((state) => {
          const key = getUserKey(userId)
          const userItems = state.itemsByUser[key] ?? []
          return {
            currentUserId: userId,
            cartItems: userItems,
          }
        }),
      addToCart: (id) =>
        set((state) => {
          const key = getUserKey(state.currentUserId)
          const userItems = state.itemsByUser[key] ?? []

          if (userItems.includes(id)) {
            return state
          }

          const nextItems = [...userItems, id]

          return {
            itemsByUser: {
              ...state.itemsByUser,
              [key]: nextItems,
            },
            cartItems: nextItems,
          }
        }),
      removeFromCart: (id) =>
        set((state) => ({
          itemsByUser: {
            ...state.itemsByUser,
            [getUserKey(state.currentUserId)]: state.cartItems.filter(
              (item) => item !== id,
            ),
          },
          cartItems: state.cartItems.filter((item) => item !== id),
        })),
      clearCart: () =>
        set((state) => {
          const key = getUserKey(state.currentUserId)
          return {
            itemsByUser: {
              ...state.itemsByUser,
              [key]: [],
            },
            cartItems: [],
          }
        }),
    }),
    {
      name: "cart-storage",
    },
  ),
)

