"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Package,
  ArrowLeft,
  Sparkles,
  Edit,
  Trash2,
  Search,
  Plus,
  LayoutGrid,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/store/authStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/hooks/use-toast";
import { ModeToggle } from "@/components/mode-toggle";
import { purchaseRepository } from "@/features/purchases/repositories/PurchaseRepository.local";
import { promptRepository } from "@/features/prompts/repositories/PromptRepository.local";
import { salesDataService } from "@/features/prompts/services/salesDataService";

interface Purchase {
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

interface Prompt {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  rating?: number;
  reviews?: number;
  sales?: number;
  author?: string;
  thumbnail?: string;
  createdAt?: string;
  status?: "active" | "inactive";
}

const categories = [
  "ChatGPT",
  "Midjourney",
  "Claude",
  "Stable Diffusion",
  "기타",
];

export default function MyPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "ChatGPT",
    tags: "",
    status: "active" as "active" | "inactive",
  });
  const [salesData, setSalesData] = useState<{
    [promptId: string]: {
      monthlyRevenue: number;
      weeklySales: number;
      lastSale?: string;
    };
  }>({});
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const isAdmin = user?.email === "admin@promptmarket.com";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const loadedPurchases = purchaseRepository.getAll();
    setPurchases(loadedPurchases);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const loadedPrompts = promptRepository.getAll();
      setPrompts(loadedPrompts);
      setFilteredPrompts(loadedPrompts);

      const sales = salesDataService.getOrInitialize(loadedPrompts);
      setSalesData(sales);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    let result = prompts;

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedCategory !== "전체") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    setFilteredPrompts(result);
  }, [searchQuery, selectedCategory, prompts, isAdmin]);

  const savePrompts = (newPrompts: Prompt[]) => {
    setPrompts(newPrompts);
    localStorage.setItem("admin_prompts", JSON.stringify(newPrompts));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPrompt: Prompt = {
      id: editingPrompt?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      price: Number.parseInt(formData.price),
      category: formData.category,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: formData.status,
      createdAt: editingPrompt?.createdAt || new Date().toISOString(),
      rating: editingPrompt?.rating || 0,
      reviews: editingPrompt?.reviews || 0,
      sales: editingPrompt?.sales || 0,
    };

    if (editingPrompt) {
      savePrompts(
        prompts.map((p) => (p.id === editingPrompt.id ? newPrompt : p))
      );
    } else {
      savePrompts([...prompts, newPrompt]);
    }

    handleDialogClose();
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      description: prompt.description,
      price: prompt.price.toString(),
      category: prompt.category,
      tags: prompt.tags.join(", "),
      status: prompt.status || "active",
    });
    setIsDialogOpen(true);
  };

  const handleNewPrompt = () => {
    setEditingPrompt(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "ChatGPT",
      tags: "",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      savePrompts(prompts.filter((p) => p.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    savePrompts(
      prompts.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p
      )
    );
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPrompt(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "ChatGPT",
      tags: "",
      status: "active",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 프롬프트 다운로드 함수
  const handleDownloadPrompt = (itemId: string, itemTitle: string) => {
    // mockPromptDetails에서 프롬프트 내용 가져오기
    const mockPromptDetails: { [key: string]: { prompt_text?: string } } = {
      "1": {
        prompt_text:
          "당신은 SEO 최적화 전문가입니다. 다음 주제와 키워드를 사용하여 고품질의 블로그 포스트를 작성해주세요.\n\n주제: [주제 입력]\n키워드: [키워드 입력]\n\n다음 구조를 따라 작성해주세요:\n1. 매력적인 제목 (키워드 포함)\n2. 메타 디스크립션 (150자 이내)\n3. 목차\n4. 본문 (각 섹션에 키워드 자연스럽게 포함)\n5. 결론\n\n톤앤매너: [선택: 전문적/친근함/격식있음]",
      },
      "2": {
        prompt_text:
          "제품 사진을 위한 프롬프트: [제품명], [스타일], [배경], [조명], 전문적인 제품 사진",
      },
    };

    const promptData = mockPromptDetails[itemId];
    const promptText =
      promptData?.prompt_text || "프롬프트 내용을 찾을 수 없습니다.";

    // 텍스트 파일로 다운로드
    const blob = new Blob([promptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${itemTitle.replace(/\s+/g, "_")}_프롬프트.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "다운로드 완료",
      description: `${itemTitle} 프롬프트가 다운로드되었습니다.`,
    });
  };

  const salesStats = isAdmin
    ? {
        totalRevenue: Object.values(salesData).reduce(
          (sum, data) => sum + data.monthlyRevenue,
          0
        ),
        totalSales: prompts.reduce((sum, p) => sum + (p.sales || 0), 0),
        averagePrice:
          prompts.length > 0
            ? prompts.reduce((sum, p) => sum + p.price, 0) / prompts.length
            : 0,
        topSelling: [...prompts]
          .sort((a, b) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 5),
      }
    : null;

  if (!isAuthenticated) {
    return null;
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
              <Link
                href="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>홈으로</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">마이페이지</h1>
          <Link href="/profile">
            <Button variant="outline">프로필 설정</Button>
          </Link>
        </div>

        <Tabs defaultValue="purchases" className="w-full">
          <TabsList>
            <TabsTrigger value="purchases" className="gap-2">
              <Package className="h-4 w-4" />
              구매 내역
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="sales" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  판매 현황
                </TabsTrigger>
                <TabsTrigger value="admin-prompts" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  프롬프트 관리
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="purchases" className="mt-6">
            {purchases.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold">
                  구매 내역이 없습니다
                </h2>
                <p className="mb-6 text-muted-foreground">
                  프롬프트를 구매하고 작업 효율을 높여보세요!
                </p>
                <Link href="/">
                  <Button>프롬프트 둘러보기</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {purchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>주문 #{purchase.id}</CardTitle>
                        <Badge>완료</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(purchase.date)}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {purchase.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.price.toLocaleString()}원
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDownloadPrompt(item.id, item.title)
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            다운로드
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-between pt-3 text-lg font-bold">
                        <span>총 결제 금액</span>
                        <span className="text-primary">
                          {purchase.total.toLocaleString()}원
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {isAdmin && (
            <TabsContent value="sales" className="mt-6">
              <div className="space-y-6">
                {/* Revenue Stats */}
                {salesStats && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          이달 총 수익
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">
                          {salesStats.totalRevenue.toLocaleString()}원
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          총 판매량
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {salesStats.totalSales}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          평균 가격
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {Math.round(salesStats.averagePrice).toLocaleString()}
                          원
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          활성 프롬프트
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          {prompts.filter((p) => p.status === "active").length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Top Selling Prompts */}
                {salesStats && salesStats.topSelling.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        베스트 셀러
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {salesStats.topSelling.map((prompt, index) => (
                          <div
                            key={prompt.id}
                            className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">
                                {prompt.title}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {prompt.category} •{" "}
                                {prompt.price.toLocaleString()}원
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                {prompt.sales || 0}건
                              </div>
                              <div className="text-sm text-muted-foreground">
                                판매
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">
                                {(
                                  (prompt.sales || 0) * prompt.price
                                ).toLocaleString()}
                                원
                              </div>
                              <div className="text-sm text-muted-foreground">
                                수익
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* All Prompts Sales Detail */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      프롬프트별 판매 현황
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {prompts.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        등록된 프롬프트가 없습니다
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {prompts.map((prompt) => {
                          const sales = salesData[prompt.id] || {
                            monthlyRevenue: 0,
                            weeklySales: 0,
                          };
                          return (
                            <div
                              key={prompt.id}
                              className="rounded-lg border p-4"
                            >
                              <div className="mb-3 flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <Badge variant="secondary">
                                      {prompt.category}
                                    </Badge>
                                    <Badge
                                      variant={
                                        prompt.status === "active"
                                          ? "default"
                                          : "outline"
                                      }
                                    >
                                      {prompt.status === "active"
                                        ? "활성"
                                        : "비활성"}
                                    </Badge>
                                  </div>
                                  <h3 className="font-semibold">
                                    {prompt.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {prompt.price.toLocaleString()}원
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div>
                                  <div className="text-xs text-muted-foreground">
                                    총 판매
                                  </div>
                                  <div className="text-lg font-bold">
                                    {prompt.sales || 0}건
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">
                                    이번 주
                                  </div>
                                  <div className="text-lg font-bold text-green-600">
                                    {sales.weeklySales}건
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">
                                    총 수익
                                  </div>
                                  <div className="text-lg font-bold text-primary">
                                    {(
                                      (prompt.sales || 0) * prompt.price
                                    ).toLocaleString()}
                                    원
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">
                                    이달 수익
                                  </div>
                                  <div className="text-lg font-bold text-orange-600">
                                    {sales.monthlyRevenue.toLocaleString()}원
                                  </div>
                                </div>
                              </div>
                              {sales.lastSale && (
                                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                                  마지막 판매: {formatDate(sales.lastSale)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="admin-prompts" className="mt-6">
              {/* Stats */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      전체 프롬프트
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{prompts.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      활성 프롬프트
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {prompts.filter((p) => p.status === "active").length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      비활성 프롬프트
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {prompts.filter((p) => p.status === "inactive").length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      총 판매량
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {prompts.reduce((sum, p) => sum + (p.sales || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Actions */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold">프롬프트 관리</h2>
                <Button onClick={handleNewPrompt}>
                  <Plus className="mr-2 h-4 w-4" />
                  프롬프트 등록
                </Button>
              </div>

              <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="프롬프트 검색..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체 카테고리</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompts List */}
              {filteredPrompts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery || selectedCategory !== "전체"
                        ? "검색 결과가 없습니다"
                        : "등록된 프롬프트가 없습니다"}
                    </p>
                    {!searchQuery && selectedCategory === "전체" && (
                      <Button className="mt-4" onClick={handleNewPrompt}>
                        프롬프트 등록하기
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredPrompts.map((prompt) => (
                    <Card key={prompt.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">
                                {prompt.category}
                              </Badge>
                              <Badge
                                variant={
                                  prompt.status === "active"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {prompt.status === "active" ? "활성" : "비활성"}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">
                              {prompt.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {prompt.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {prompt.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-bold text-primary">
                              {prompt.price.toLocaleString()}원
                            </div>
                            <div className="text-xs text-muted-foreground">
                              판매: {prompt.sales || 0} | 리뷰:{" "}
                              {prompt.reviews || 0}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleStatus(prompt.id)}
                              title={
                                prompt.status === "active"
                                  ? "비활성화"
                                  : "활성화"
                              }
                            >
                              {prompt.status === "active" ? "비활성" : "활성"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(prompt)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(prompt.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? "프롬프트 수정" : "프롬프트 등록"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="프롬프트 제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
                placeholder="프롬프트에 대한 자세한 설명을 입력하세요"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">가격 (원) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  min="0"
                  step="1000"
                  placeholder="10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태 *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="마케팅, 콘텐츠 생성, SEO"
              />
              <p className="text-xs text-muted-foreground">
                태그를 쉼표로 구분하여 입력하세요
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                취소
              </Button>
              <Button type="submit">{editingPrompt ? "수정" : "등록"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
