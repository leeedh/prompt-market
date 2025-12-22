"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Smartphone, Sparkles } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/features/cart/store/cartStore"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/store/authStore"
import { ModeToggle } from "@/components/mode-toggle"
import { purchaseRepository } from "@/features/purchases/repositories/PurchaseRepository.local"

const mockPrompts = {
  "1": {
    id: "1",
    title: "블로그 포스트 자동 생성 프롬프트",
    price: 15000,
  },
  "2": {
    id: "2",
    title: "제품 상세 이미지 생성 프롬프트",
    price: 25000,
  },
}

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const items = cartItems.map((id) => mockPrompts[id as keyof typeof mockPrompts]).filter(Boolean)
  const total = items.reduce((sum, item) => sum + item.price, 0)

  const handlePayment = async () => {
    if (!email) {
      alert("이메일을 입력해주세요")
      return
    }

    setIsProcessing(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newPurchase = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: items,
      total: total,
      email: email,
      paymentMethod: paymentMethod,
    }
    purchaseRepository.create(newPurchase)

    clearCart()
    router.push("/my-page")
  }

  if (!isAuthenticated) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Prompt Market</span>
              </Link>
              <ModeToggle />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">장바구니가 비어있습니다</h2>
            <Link href="/">
              <Button>프롬프트 둘러보기</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Prompt Market</span>
            </Link>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Link href="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold">장바구니로 돌아가기</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">결제</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Email */}
            <Card>
              <CardHeader>
                <CardTitle>구매자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">구매한 프롬프트가 이메일로 전송됩니다</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>결제 수단</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex flex-1 items-center gap-3 cursor-pointer">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">신용/체크카드</p>
                        <p className="text-sm text-muted-foreground">모든 카드 사용 가능</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="kakaopay" id="kakaopay" />
                    <Label htmlFor="kakaopay" className="flex flex-1 items-center gap-3 cursor-pointer">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">카카오페이</p>
                        <p className="text-sm text-muted-foreground">간편 결제</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="naverpay" id="naverpay" />
                    <Label htmlFor="naverpay" className="flex flex-1 items-center gap-3 cursor-pointer">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">네이버페이</p>
                        <p className="text-sm text-muted-foreground">간편 결제</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle>주문 상품</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 border-b pb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.title}</span>
                        <span className="font-medium">{item.price.toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-b pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">상품 금액</span>
                      <span>{total.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">부가세</span>
                      <span>포함</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제 금액</span>
                    <span className="text-primary">{total.toLocaleString()}원</span>
                  </div>

                  <Button className="w-full" size="lg" onClick={handlePayment} disabled={isProcessing}>
                    {isProcessing ? "결제 처리중..." : `${total.toLocaleString()}원 결제하기`}
                  </Button>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• 디지털 상품은 구매 후 즉시 다운로드 가능합니다</p>
                    <p>• 구매 후 환불이 불가능합니다</p>
                    <p>• 결제 시 이용약관에 동의하게 됩니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
