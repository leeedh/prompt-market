"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, ShoppingCart, ArrowLeft, Sparkles } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useCart } from "@/features/cart/store/cartStore"
import { useAuth } from "@/features/auth/store/authStore"
import { ModeToggle } from "@/components/mode-toggle"
import { useTranslations } from "next-intl"

const mockPrompts = {
  "1": {
    id: "1",
    title: "블로그 포스트 자동 생성 프롬프트",
    price: 15000,
    category: "ChatGPT",
    thumbnail: "/blog-writing-ai.jpg",
  },
  "2": {
    id: "2",
    title: "제품 상세 이미지 생성 프롬프트",
    price: 25000,
    category: "Midjourney",
    thumbnail: "/product-photography-still-life.png",
  },
}

export default function CartPage() {
  const t = useTranslations()
  const { cartItems, removeFromCart, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  const items = cartItems.map((id) => mockPrompts[id as keyof typeof mockPrompts]).filter(Boolean)
  const total = items.reduce((sum, item) => sum + item.price, 0)

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

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">{t("cart.empty")}</h2>
            <p className="mb-6 text-muted-foreground">{t("cart.emptyDescription")}</p>
            <Link href="/">
              <Button>{t("cart.browsePrompts")}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
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
