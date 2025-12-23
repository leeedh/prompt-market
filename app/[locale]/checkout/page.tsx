"use client"

import { useEffect, useMemo, useState } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useCart } from "@/features/cart/store/cartStore"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/store/authStore"
import { ModeToggle } from "@/components/mode-toggle"
import { createPromptRepositoryClient, type Prompt } from "@/features/prompts/repositories"

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY

export default function CheckoutPage() {
  const { cartItems } = useCart()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  const total = useMemo(
    () => prompts.reduce((sum, item) => sum + item.price, 0),
    [prompts],
  )

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

  // 장바구니에 담긴 프롬프트 정보를 Supabase에서 로드
  useEffect(() => {
    if (cartItems.length === 0) {
      setPrompts([])
      return
    }

    async function loadCartPrompts() {
      try {
        // 프롬프트 목록은 RLS 정책상 모든 사용자(anon 포함)가 읽기 가능하므로
        // Clerk 토큰 없이 공개 Supabase 클라이언트로 조회합니다.
        const repository = createPromptRepositoryClient()

        const all = await repository.getAll({ status: "active" })
        const map = new Map(all.map((p) => [p.id, p]))
        setPrompts(cartItems.map((id) => map.get(id)).filter(Boolean) as Prompt[])
      } catch (error) {
        console.error("결제 페이지 프롬프트 로드 중 오류:", error)
      }
    }

    void loadCartPrompts()
  }, [cartItems])

  const handlePayment = async () => {
    if (!email) {
      alert("이메일을 입력해주세요")
      return
    }

    if (!CLIENT_KEY) {
      alert("결제 클라이언트 키가 설정되어 있지 않습니다. 환경 변수를 확인해주세요.")
      return
    }

    if (!isScriptLoaded || !(window as any).TossPayments) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.")
      return
    }

    setIsProcessing(true)

    try {
      const orderId = `order_${Date.now()}`
      const primaryTitle = prompts[0]?.title ?? "프롬프트 결제"
      const orderName =
        prompts.length > 1 ? `${primaryTitle} 외 ${prompts.length - 1}건` : primaryTitle

      const { origin, pathname } = window.location
      const basePath = pathname.replace(/\/checkout$/, "")
      const successUrl = `${origin}${basePath}/checkout/success`
      const failUrl = `${origin}${basePath}/checkout/fail`

      const tossPayments = (window as any).TossPayments(CLIENT_KEY)
      const payment = tossPayments.payment({
        customerKey: user?.id ?? (window as any).TossPayments.ANONYMOUS,
      })

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: total,
        },
        orderId,
        orderName,
        successUrl,
        failUrl,
        customerEmail: email,
        customerName: user?.name ?? "",
        card: {
          useEscrow: false,
          flowMode: "DEFAULT",
          useCardPoint: false,
          useAppCardOnly: false,
          useInternationalCardOnly: false,
        },
      })
    } catch (error: any) {
      if (error?.code === "USER_CANCEL") {
        return
      }
      console.error("결제 요청 중 오류:", error)
      alert("결제 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (prompts.length === 0) {
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

            {/* TossPayments 결제창 안내 영역 */}
            <Card>
              <CardHeader>
                <CardTitle>결제 안내</CardTitle>
              </CardHeader>
              <CardContent>
                {!CLIENT_KEY ? (
                  <p className="text-sm text-destructive">
                    환경 변수 <code className="font-mono">NEXT_PUBLIC_TOSS_CLIENT_KEY</code> 가 설정되어 있지
                    않아 테스트 결제를 진행할 수 없습니다.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    아래 &quot;결제하기&quot; 버튼을 누르면 토스페이먼츠 결제창이 열립니다. 결제 수단과 카드 정보를
                    선택한 뒤 결제를 완료해 주세요.
                  </p>
                )}
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
                    {prompts.map((item) => (
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

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={isProcessing || !CLIENT_KEY}
                  >
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

      {/* TossPayments SDK */}
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />
    </div>
  )
}

