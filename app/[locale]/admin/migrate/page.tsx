"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/store/authStore";
import { storageClient } from "@/shared/lib/storage/StorageClient";
import { createPurchaseRepositoryClient } from "@/features/purchases/repositories/PurchaseRepository.supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "@clerk/nextjs";

interface LegacyPurchase {
  id: string;
  date: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
  }>;
  total: number;
  email: string;
  paymentMethod: string;
}

/**
 * localStorage → Supabase 구매 내역 마이그레이션 페이지
 *
 * - admin 전용 유틸 페이지입니다.
 * - 기존 localStorage "purchases" 데이터를 Supabase "purchases" 테이블로 옮깁니다.
 * - 한 Purchase의 items 배열이 여러 개라면, promptId 개수만큼 행이 생성됩니다.
 */
export default function AdminMigratePage() {
  const { user, isAuthenticated } = useAuth();
  const { session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.email === "admin@promptmarket.com") {
      setIsAdmin(true);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Prompt Market</span>
              </Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>접근 불가</AlertTitle>
            <AlertDescription>이 페이지는 관리자만 접근할 수 있습니다.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleMigratePurchases = async () => {
    setIsMigrating(true);
    setResultMessage(null);
    setErrorMessage(null);

    try {
      const legacy = storageClient.get<LegacyPurchase[]>("purchases") || [];

      if (legacy.length === 0) {
        setResultMessage("localStorage에 구매 내역이 없습니다. 마이그레이션할 데이터가 없습니다.");
        return;
      }

      const promptIds = new Set<string>();
      const purchasePromptIds: string[][] = [];

      legacy.forEach((purchase) => {
        const ids: string[] = [];
        purchase.items.forEach((item) => {
          ids.push(item.id);
          promptIds.add(item.id);
        });
        purchasePromptIds.push(ids);
      });

      if (promptIds.size === 0) {
        setResultMessage("구매 내역에 포함된 프롬프트 ID가 없습니다.");
        return;
      }

      const getToken = async () => {
        return (await session?.getToken({ template: "supabase" })) ?? null;
      };
      const purchaseRepository = createPurchaseRepositoryClient(getToken);

      const buyerId = user!.id;

      let createdCount = 0;
      for (let i = 0; i < legacy.length; i += 1) {
        const legacyPurchase = legacy[i];
        const ids = purchasePromptIds[i];
        if (ids.length === 0) continue;

        const paymentOrderId = legacyPurchase.id || `local-${legacyPurchase.date}-${i}`;
        const created = await purchaseRepository.createMany(buyerId, ids, paymentOrderId);
        createdCount += created.length;
      }

      setResultMessage(`Supabase로 ${createdCount}건의 구매 레코드를 마이그레이션했습니다.`);
    } catch (error) {
      console.error("Migration error:", error);
      setErrorMessage("마이그레이션 중 오류가 발생했습니다. 콘솔 로그를 확인하세요.");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Prompt Market</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>localStorage → Supabase 구매 내역 마이그레이션</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              이 도구는 브라우저 localStorage에 저장된 <code>purchases</code> 데이터를 Supabase{" "}
              <code>purchases</code> 테이블로 옮깁니다.
              <br />
              한 번만 실행한 뒤, 정상 동작이 확인되면 이 페이지는 제거해도 됩니다.
            </p>

            <Button onClick={handleMigratePurchases} disabled={isMigrating}>
              {isMigrating ? "마이그레이션 수행 중..." : "구매 내역 마이그레이션 실행"}
            </Button>

            {resultMessage && (
              <Alert>
                <AlertTitle>완료</AlertTitle>
                <AlertDescription>{resultMessage}</AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


