import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Sparkles } from "lucide-react"
import { Link } from "@/i18n/routing"
import { ModeToggle } from "@/components/mode-toggle"

interface PageProps {
  params: { locale: string }
  searchParams: {
    code?: string
    message?: string
    orderId?: string
  }
}

export default function CheckoutFailPage({ searchParams }: PageProps) {
  const { code, message, orderId } = searchParams

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

      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <CardTitle className="text-2xl font-bold">결제가 실패했습니다</CardTitle>
              <p className="text-sm text-muted-foreground">
                결제 과정에서 오류가 발생했어요. 아래 오류 정보를 확인한 뒤 다시 시도해주세요.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">주문 번호</span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                )}
                {code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">에러 코드</span>
                    <span className="font-mono">{code}</span>
                  </div>
                )}
                {message && (
                  <div>
                    <span className="text-muted-foreground">메시지</span>
                    <p className="mt-1 text-sm">{message}</p>
                  </div>
                )}
                {!code && !message && (
                  <p className="text-sm text-muted-foreground">
                    상세 오류 정보가 전달되지 않았습니다. 잠시 후 다시 시도하거나, 문제가 지속되면 관리자에게
                    문의해주세요.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Link href="/cart">
                  <Button className="w-full" size="lg">
                    장바구니로 돌아가기
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    메인으로 이동
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground">
                이 화면은 토스페이먼츠 테스트 결제 환경에서만 표시됩니다. 실제 서비스에서는 실패 로그를 서버에서
                수집하고, 사용자에게 더 친절한 안내를 제공하는 것이 좋습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


