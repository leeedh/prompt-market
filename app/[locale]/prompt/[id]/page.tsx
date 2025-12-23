"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Star, ShoppingCart, Heart, Share2, TrendingUp, ArrowLeft, Sparkles, Copy, Check } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/features/cart/store/cartStore"
import { useAuth } from "@/features/auth/store/authStore"
import { useRouter } from "next/navigation"
import { useToast } from "@/shared/hooks/use-toast"
import { reviewRepository } from "@/features/reviews/repositories/ReviewRepository.local"
import { ModeToggle } from "@/components/mode-toggle"
import { createPromptRepositoryClient, type Prompt } from "@/features/prompts/repositories"
import { useSession } from "@clerk/nextjs"

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { session } = useSession()
  const { addToCart, cartItems } = useCart()
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewContent, setReviewContent] = useState("")
  const [reviews, setReviews] = useState<any[]>([])

  // Supabase에서 프롬프트 데이터 로드
  useEffect(() => {
    async function loadPrompt() {
      try {
        setIsLoading(true)
        const repository = createPromptRepositoryClient(async () => {
          return await session?.getToken({ template: "supabase" }) ?? null
        })
        
        const loadedPrompt = await repository.getById(id)
        setPrompt(loadedPrompt)
        
        if (loadedPrompt) {
          // 리뷰 로드
          const storedReviews = reviewRepository.getByPromptId(id)
          if (storedReviews.length > 0) {
            setReviews(storedReviews)
          }
        }
      } catch (error) {
        console.error("프롬프트 로드 중 오류:", error)
        toast({
          title: "오류",
          description: "프롬프트를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPrompt()
  }, [id, session, toast])

  // 좋아요 상태 로드
  useEffect(() => {
    if (isAuthenticated && user) {
      const favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || "[]")
      setIsFavorite(favorites.includes(id))
    }
  }, [id, isAuthenticated, user])

  // 구매 여부 확인
  useEffect(() => {
    if (isAuthenticated && user) {
      const purchases = JSON.parse(localStorage.getItem("purchases") || "[]")
      const hasPurchased = purchases.some((purchase: any) =>
        purchase.items.some((item: any) => item.id === id)
      )
      setIsPurchased(hasPurchased)
    }
  }, [id, isAuthenticated, user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Prompt Market</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center">프롬프트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Prompt Market</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center">프롬프트를 찾을 수 없습니다.</p>
          <Link href="/">
            <Button className="mx-auto mt-4">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast({
        title: "로그인이 필요합니다",
        description: "구매를 진행하려면 먼저 로그인해주세요.",
      })
      router.push("/login")
      return
    }
    if (!cartItems.includes(prompt.id)) {
      addToCart(prompt.id)
      toast({
        title: "장바구니에 추가되었습니다",
        description: `${prompt.title}이(가) 장바구니에 담겼습니다.`,
      })
    }
    router.push("/cart")
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "로그인이 필요합니다",
        description: "장바구니에 담으려면 먼저 로그인해주세요.",
      })
      router.push("/login")
      return
    }
    if (cartItems.includes(prompt.id)) {
      toast({
        title: "이미 장바구니에 있습니다",
        description: "이 상품은 이미 장바구니에 담겨있습니다.",
        variant: "default",
      })
      return
    }
    addToCart(prompt.id)
    toast({
      title: "장바구니에 추가되었습니다",
      description: `${prompt.title}이(가) 장바구니에 담겼습니다.`,
    })
  }

  const handleFavorite = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (!user) return

    const favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || "[]")
    const newFavorites = isFavorite
      ? favorites.filter((favId: string) => favId !== id)
      : [...favorites, id]
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "좋아요 취소" : "좋아요 추가",
      description: isFavorite ? "좋아요를 취소했습니다." : "좋아요를 추가했습니다.",
    })
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      toast({
        title: "링크가 복사되었습니다",
        description: "프롬프트 링크가 클립보드에 복사되었습니다.",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast({
        title: "복사 실패",
        description: "링크 복사에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleCopyPrompt = async () => {
    if (!prompt.prompt_text) return
    try {
      await navigator.clipboard.writeText(prompt.prompt_text)
      setIsCopied(true)
      toast({
        title: "프롬프트가 복사되었습니다",
        description: "프롬프트 내용이 클립보드에 복사되었습니다.",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast({
        title: "복사 실패",
        description: "프롬프트 복사에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitReview = () => {
    if (!reviewContent.trim()) {
      toast({
        title: "리뷰 작성 실패",
        description: "리뷰 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const newReview = {
      id: Date.now().toString(),
      author: user?.name || "익명",
      rating: reviewRating,
      date: new Date().toLocaleDateString("ko-KR"),
      content: reviewContent,
    }

    const updatedReviews = [newReview, ...reviews]
    setReviews(updatedReviews)
    
    // Repository를 통해 저장 (향후 Supabase로 마이그레이션 시 Repository만 변경)
    reviewRepository.create(id, newReview)

    setReviewContent("")
    setReviewRating(5)
    setIsReviewDialogOpen(false)
    toast({
      title: "리뷰가 등록되었습니다",
      description: "리뷰를 작성해주셔서 감사합니다.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Prompt Market</span>
            </Link>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold">돌아가기</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast({
                      title: "로그인이 필요합니다",
                      description: "장바구니를 보려면 먼저 로그인해주세요.",
                    })
                    router.push("/login")
                    return
                  }
                  router.push("/cart")
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                장바구니
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thumbnail */}
            <div className="aspect-video overflow-hidden rounded-lg bg-muted relative">
              <Image
                src={prompt.thumbnail || "/placeholder.svg"}
                alt={prompt.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Title & Basic Info */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge>{prompt.category}</Badge>
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="mb-3 text-3xl font-bold text-balance">{prompt.title}</h1>
              <p className="text-lg text-muted-foreground text-pretty">{prompt.description}</p>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{prompt.rating || 0}</span>
                  <span className="text-muted-foreground">({prompt.reviews || reviews.length}개 리뷰)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>{prompt.sales || 0}개 판매</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">
                  상세 설명
                </TabsTrigger>
                <TabsTrigger value="contents" className="flex-1">
                  포함 내용
                </TabsTrigger>
                <TabsTrigger value="howto" className="flex-1">
                  사용 방법
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  리뷰
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>프롬프트 설명</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-pretty leading-relaxed">{prompt.long_description || prompt.description}</p>

                    <div>
                      <h4 className="mb-2 font-semibold">주요 특징</h4>
                      <ul className="space-y-2">
                        {(prompt.features || []).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                              ✓
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contents">
                <Card>
                  <CardHeader>
                    <CardTitle>포함된 내용</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">{prompt.contents || "내용이 없습니다."}</pre>
                  </CardContent>
                </Card>
                {isPurchased && prompt.prompt_text && (
                  <Card className="mt-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>프롬프트 내용</CardTitle>
                        <Button size="sm" onClick={handleCopyPrompt} variant="outline">
                          {isCopied ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              복사됨
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              복사
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{prompt.prompt_text}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {!isPurchased && prompt.prompt_text && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>프롬프트 내용</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-muted p-4 blur-sm select-none">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                          {prompt.prompt_text.replace(/./g, "●")}
                        </pre>
                      </div>
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        구매 후 프롬프트 내용을 확인할 수 있습니다.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="howto">
                <Card>
                  <CardHeader>
                    <CardTitle>사용 방법</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">{prompt.how_to_use || "사용 방법이 없습니다."}</pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {isAuthenticated && (
                  <Card>
                    <CardContent className="pt-6">
                      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">리뷰 작성하기</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>리뷰 작성</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>평점</Label>
                              <div className="flex gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setReviewRating(i + 1)}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`h-6 w-6 ${
                                        i < reviewRating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="review-content">리뷰 내용</Label>
                              <Textarea
                                id="review-content"
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                                placeholder="리뷰를 작성해주세요..."
                                rows={5}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                                취소
                              </Button>
                              <Button onClick={handleSubmitReview}>등록</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                )}
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{review.author[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{review.author}</p>
                            <p className="text-sm text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-pretty leading-relaxed">{review.content}</p>
                    </CardContent>
                  </Card>
                ))}
                {reviews.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">아직 리뷰가 없습니다.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <div className="mb-2 text-3xl font-bold">{prompt.price.toLocaleString()}원</div>
                    <p className="text-sm text-muted-foreground">부가세 포함</p>
                  </div>

                  {!isPurchased ? (
                    <div className="space-y-2">
                      <Button className="w-full" size="lg" onClick={handlePurchase}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {isAuthenticated ? "바로 구매" : "로그인하고 구매"}
                      </Button>
                      <Button
                        className="w-full bg-transparent"
                        variant="outline"
                        size="lg"
                        disabled={cartItems.includes(prompt.id)}
                        onClick={handleAddToCart}
                      >
                        {cartItems.includes(prompt.id) ? "장바구니에 있음" : "장바구니 담기"}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="flex-1 bg-transparent"
                          onClick={handleFavorite}
                        >
                          <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                        <Button variant="outline" size="icon" className="flex-1 bg-transparent" onClick={handleShare}>
                          {isCopied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="rounded-lg bg-primary/10 p-4 text-center">
                        <p className="text-sm font-semibold text-primary">구매 완료</p>
                        <p className="text-xs text-muted-foreground mt-1">프롬프트 내용을 확인하세요</p>
                      </div>
                      <Button
                        className="w-full bg-transparent"
                        variant="outline"
                        size="lg"
                        onClick={handleCopyPrompt}
                      >
                        {isCopied ? (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-5 w-5" />
                            프롬프트 복사
                          </>
                        )}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="flex-1 bg-transparent"
                          onClick={handleFavorite}
                        >
                          <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                        <Button variant="outline" size="icon" className="flex-1 bg-transparent" onClick={handleShare}>
                          {isCopied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>판매자 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarFallback>{(prompt.author || "A")[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{prompt.author || "작성자"}</p>
                      <p className="text-sm text-muted-foreground">{prompt.author_bio || ""}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    판매자 프롬프트 보기
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
