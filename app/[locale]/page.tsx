"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShoppingCart,
  Search,
  Star,
  TrendingUp,
  Sparkles,
  User,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/features/cart/store/cartStore";
import { useAuth } from "@/features/auth/store/authStore";
import { useToast } from "@/shared/hooks/use-toast";
import { SignInButton, UserButton, SignedIn, SignedOut, useSession } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useTranslations } from "next-intl";
import { createPromptRepositoryClient, type Prompt } from "@/features/prompts/repositories";

const categories = [
  "all",
  "chatgpt",
  "midjourney",
  "claude",
  "stableDiffusion",
  "other",
];
const tags = [
  "marketing",
  "contentCreation",
  "imageGeneration",
  "coding",
  "translation",
  "summarization",
  "creation",
];

export default function HomePage() {
  const t = useTranslations();
  const { session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Supabase에서 프롬프트 목록 로드
  useEffect(() => {
    async function loadPrompts() {
      try {
        setIsLoading(true);
        const repository = createPromptRepositoryClient(async () => {
          return await session?.getToken({ template: "supabase" }) ?? null;
        });
        
        const loadedPrompts = await repository.getAll({
          status: "active", // 활성화된 프롬프트만 조회
        });
        
        setPrompts(loadedPrompts);
      } catch (error) {
        console.error("프롬프트 로드 중 오류:", error);
        toast({
          title: "오류",
          description: "프롬프트를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPrompts();
  }, [session, toast]);

  const categoryLabels: Record<string, string> = {
    all: t("home.categories.all"),
    chatgpt: t("home.categories.chatgpt"),
    midjourney: t("home.categories.midjourney"),
    claude: t("home.categories.claude"),
    stableDiffusion: t("home.categories.stableDiffusion"),
    other: t("home.categories.other"),
  };

  const tagLabels: Record<string, string> = {
    marketing: t("home.tagLabels.marketing"),
    contentCreation: t("home.tagLabels.contentCreation"),
    imageGeneration: t("home.tagLabels.imageGeneration"),
    coding: t("home.tagLabels.coding"),
    translation: t("home.tagLabels.translation"),
    summarization: t("home.tagLabels.summarization"),
    creation: t("home.tagLabels.creation"),
  };

  const filteredPrompts = prompts.filter((prompt) => {
    // 카테고리 매칭: "all"이거나 실제 카테고리 이름과 매칭
    const matchesCategory =
      selectedCategory === "all" || 
      prompt.category.toLowerCase() === categoryLabels[selectedCategory]?.toLowerCase() ||
      prompt.category === selectedCategory;
    // 태그 매칭: 선택된 태그의 번역된 라벨이 프롬프트의 태그에 포함되는지 확인
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => {
        const tagLabel = tagLabels[tag];
        return prompt.tags.some((promptTag) => 
          promptTag.toLowerCase().includes(tagLabel.toLowerCase()) ||
          tagLabel.toLowerCase().includes(promptTag.toLowerCase())
        );
      });
    const matchesSearch =
      searchQuery === "" ||
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTags && matchesSearch;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">{t("common.appName")}</span>
            </Link>

            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("common.searchPlaceholder")}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    {t("common.login")}
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/profile">
                  <Button variant="ghost" size="icon" aria-label="프로필 페이지로 이동">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/my-page">
                  <Button variant="ghost" size="sm">
                    {user?.name}
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative" aria-label={`장바구니 보기 (${cartItems.length}개 상품)`}>
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
              </Link>
              <LocaleSwitcher />
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance lg:text-5xl">
              {t("home.title")}
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              {t("home.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <h2 className="mb-3 font-semibold">{t("home.category")}</h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {categoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Filter */}
              <div>
                <h2 className="mb-3 font-semibold">{t("home.tags")}</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tagLabels[tag]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {isLoading ? "..." : filteredPrompts.length} {t("common.prompts")}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("common.sortBy")}</span>
                <Button variant="ghost" size="sm">
                  {t("common.popular")}
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">프롬프트를 불러오는 중...</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <Link href={`/prompt/${prompt.id}`}>
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      <Image
                        src={prompt.thumbnail || "/placeholder.svg"}
                        alt={prompt.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary">{prompt.category}</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{prompt.rating}</span>
                        <span className="text-muted-foreground">
                          ({prompt.reviews})
                        </span>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 text-balance">
                      <Link
                        href={`/prompt/${prompt.id}`}
                        className="hover:underline"
                      >
                        {prompt.title}
                      </Link>
                    </CardTitle>
                    <p className="line-clamp-2 text-sm text-muted-foreground text-pretty">
                      {prompt.description}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t pt-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {prompt.price.toLocaleString()}{t("common.currency")}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{prompt.sales} {t("common.sales")}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={cartItems.includes(prompt.id)}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!cartItems.includes(prompt.id)) {
                          addToCart(prompt.id);
                          toast({
                            title: t("common.addToCart"),
                            description: t("common.addToCartDescription", { title: prompt.title }),
                          });
                        }
                      }}
                    >
                      <ShoppingCart className="mr-1 h-4 w-4" />
                      {cartItems.includes(prompt.id)
                        ? t("common.inCart")
                        : t("common.add")}
                    </Button>
                  </CardFooter>
                </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredPrompts.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">{t("common.noResults")}</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
