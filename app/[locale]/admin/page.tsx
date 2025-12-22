"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles, Package } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/features/auth/store/authStore"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { useToast } from "@/shared/hooks/use-toast"
import { createPromptRepositoryClient, type Prompt } from "@/features/prompts/repositories"
import { useSession } from "@clerk/nextjs"

interface Prompt {
  id: string
  title: string
  description: string
  price: number
  category: string
  tags: string[]
  createdAt: string
  status: "active" | "inactive"
}

const categories = ["ChatGPT", "Midjourney", "Claude", "Stable Diffusion", "기타"]

export default function AdminPage() {
  const { session } = useSession()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "ChatGPT",
    tags: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Supabase에서 프롬프트 목록 로드
  useEffect(() => {
    async function loadPrompts() {
      if (!isAuthenticated) return
      
      try {
        setIsLoading(true)
        const repository = createPromptRepositoryClient(async () => {
          return await session?.getToken({ template: "supabase" }) ?? null
        })
        
        const loadedPrompts = await repository.getAll()
        setPrompts(loadedPrompts)
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

    loadPrompts()
  }, [isAuthenticated, session, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const repository = createPromptRepositoryClient(async () => {
        return await session?.getToken({ template: "supabase" }) ?? null
      })

      const newPrompt = await repository.create({
        title: formData.title,
        description: formData.description,
        price: Number.parseInt(formData.price),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: "active",
      })

      // 목록 업데이트
      setPrompts([...prompts, newPrompt])

      // Reset form
      setFormData({ title: "", description: "", price: "", category: "ChatGPT", tags: "" })
      
      toast({
        title: "성공",
        description: "프롬프트가 성공적으로 등록되었습니다!",
      })
    } catch (error) {
      console.error("프롬프트 등록 중 오류:", error)
      toast({
        title: "오류",
        description: "프롬프트 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null
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
              <h1 className="text-xl font-bold">관리자 페이지</h1>
              <ModeToggle />
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span>홈으로</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push("/admin/prompts")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">프롬프트 관리</h3>
                <p className="text-sm text-muted-foreground">등록된 프롬프트 확인 및 수정</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-6 text-2xl font-bold">새 프롬프트 등록</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="프롬프트 제목을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명 *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    placeholder="프롬프트에 대한 자세한 설명을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">가격 (원) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="1000"
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="마케팅, 콘텐츠 생성, SEO"
                  />
                  <p className="text-xs text-muted-foreground">태그를 쉼표로 구분하여 입력하세요</p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push("/admin/prompts")}>
                    관리 페이지로
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "등록 중..." : "프롬프트 등록"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
