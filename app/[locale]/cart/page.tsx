"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, ShoppingCart, ArrowLeft, Sparkles } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useCart } from "@/features/cart/store/cartStore"
import { useAuth } from "@/features/auth/store/authStore"
import { ModeToggle } from "@/components/mode-toggle"
import { useTranslations } from "next-intl"
import { createPromptRepositoryClient, type Prompt } from "@/features/prompts/repositories"

export default function CartPage() {
  const t = useTranslations()
  const { cartItems, removeFromCart, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Supabase에서 장바구니에 담긴 프롬프트 정보 로드
  useEffect(() => {
    if (cartItems.length === 0) {
      setPrompts([])
      return
    }

    async function loadCartPrompts() {
      try {
        setIsLoading(true)
        // 프롬프트 목록은 RLS 정책상 모든 사용자(anon 포함)가 읽기 가능하므로
        // Clerk 토큰 없이 공개 Supabase 클라이언트로 조회합니다.
        const repository = createPromptRepositoryClient()

        // 간단하게: 활성 프롬프트 전체를 불러온 뒤 cartItems 기준으로 필터링
        const all = await repository.getAll({ status: "active" })
        const map = new Map(all.map((p) => [p.id, p]))
        setPrompts(cartItems.map((id) => map.get(id)).filter(Boolean) as Prompt[])
      } catch (error) {
        console.error("장바구니 프롬프트 로드 중 오류:", error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadCartPrompts()
  }, [cartItems])

  const total = useMemo(
    () => prompts.reduce((sum, item) => sum + item.price, 0),
    [prompts],
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">{t("common.appName")}</span>
            </Link>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold">{t("common.continueShopping")}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">{t("cart.title")}</h1>

        {(!isLoading && prompts.length === 0) ? (
          <div className="py-12 text-center">
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">{t("cart.empty")}</h2>
            <p className="mb-6 text-muted-foreground">{t("cart.emptyDescription")}</p>
            <Link href="/">
              <Button>{t("cart.browsePrompts")}</Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">장바구니를 불러오는 중...</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {prompts.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          width={144}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-balance">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold">{item.price.toLocaleString()}{t("common.currency")}</p>
                          <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="mr-1 h-4 w-4" />
                            {t("common.delete")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end">
                <Button variant="outline" onClick={clearCart}>
                  {t("cart.clearCart")}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold">{t("cart.orderSummary")}</h2>

                    <div className="space-y-2 border-b pb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("cart.productAmount")}</span>
                        <span>{total.toLocaleString()}{t("common.currency")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("cart.discount")}</span>
                        <span>0{t("common.currency")}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-lg font-bold">
                      <span>{t("cart.total")}</span>
                      <span className="text-primary">{total.toLocaleString()}{t("common.currency")}</span>
                    </div>

                    {isAuthenticated ? (
                      <Link href="/checkout">
                        <Button className="w-full" size="lg">
                          {t("cart.checkout")}
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/login">
                        <Button className="w-full" size="lg">
                          {t("cart.loginToCheckout")}
                        </Button>
                      </Link>
                    )}

                    <p className="text-center text-xs text-muted-foreground">
                      {t("cart.refundNotice")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
