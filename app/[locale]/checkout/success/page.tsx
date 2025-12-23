import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ModeToggle } from "@/components/mode-toggle";

interface PageProps {
  params: { locale: string };
  searchParams: {
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  };
}

export default function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { paymentKey, orderId, amount } = searchParams;

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
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl font-bold">
                결제가 완료되었습니다
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                테스트 결제가 정상적으로 처리되었습니다. 아래 결제 정보를 확인할
                수 있습니다.
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
                {paymentKey && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제 키</span>
                    <span className="font-mono truncate max-w-[220px] text-right">
                      {paymentKey}
                    </span>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제 금액</span>
                    <span className="font-semibold">
                      {Number(amount).toLocaleString()}원
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Link href="/my-page">
                  <Button className="w-full" size="lg">
                    구매 내역 보러가기
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    프롬프트 계속 둘러보기
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground">
                이 화면은 토스페이먼츠 테스트 결제 환경에서만 표시됩니다. 실제
                결제 승인/정산 로직은 서버에서 구현해야 합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
