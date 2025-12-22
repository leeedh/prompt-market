"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, ArrowLeft, Sparkles, Search, LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/features/auth/store/authStore"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { createPromptRepositoryClient, type Prompt } from "@/features/prompts/repositories"
import { useSession } from "@clerk/nextjs"
import { useToast } from "@/shared/hooks/use-toast"

interface Prompt {
  id: string
  title: string
  description: string
  price: number
  category: string
  tags: string[]
  rating?: number
  reviews?: number
  sales?: number
  author?: string
  thumbnail?: string
  createdAt?: string
  status?: "active" | "inactive"
}

const categories = ["ChatGPT", "Midjourney", "Claude", "Stable Diffusion", "기타"]

export default function AdminPromptsPage() {
  const { session } = useSession()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("전체")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "ChatGPT",
    tags: "",
    status: "active" as "active" | "inactive",
  })
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
        setFilteredPrompts(loadedPrompts)
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

  useEffect(() => {
    let result = prompts

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedCategory !== "전체") {
      result = result.filter((p) => p.category === selectedCategory)
    }

    setFilteredPrompts(result)
  }, [searchQuery, selectedCategory, prompts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const repository = createPromptRepositoryClient(async () => {
        return await session?.getToken({ template: "supabase" }) ?? null
      })

      if (editingPrompt) {
        // 업데이트
        const updatedPrompt = await repository.update(editingPrompt.id, {
          title: formData.title,
          description: formData.description,
          price: Number.parseInt(formData.price),
          category: formData.category,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          status: formData.status,
        })

        setPrompts(prompts.map((p) => (p.id === editingPrompt.id ? updatedPrompt : p)))
        toast({
          title: "성공",
          description: "프롬프트가 성공적으로 수정되었습니다!",
        })
      } else {
        // 생성
        const newPrompt = await repository.create({
          title: formData.title,
          description: formData.description,
          price: Number.parseInt(formData.price),
          category: formData.category,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          status: formData.status,
        })

        setPrompts([...prompts, newPrompt])
        toast({
          title: "성공",
          description: "프롬프트가 성공적으로 등록되었습니다!",
        })
      }

      handleDialogClose()
    } catch (error) {
      console.error("프롬프트 저장 중 오류:", error)
      toast({
        title: "오류",
        description: "프롬프트 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setFormData({
      title: prompt.title,
      description: prompt.description,
      price: prompt.price.toString(),
      category: prompt.category,
      tags: prompt.tags.join(", "),
      status: prompt.status || "active",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return
    }

    try {
      const repository = createPromptRepositoryClient(async () => {
        return await session?.getToken({ template: "supabase" }) ?? null
      })

      await repository.delete(id)
      setPrompts(prompts.filter((p) => p.id !== id))
      toast({
        title: "성공",
        description: "프롬프트가 삭제되었습니다.",
      })
    } catch (error) {
      console.error("프롬프트 삭제 중 오류:", error)
      toast({
        title: "오류",
        description: "프롬프트 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const repository = createPromptRepositoryClient(async () => {
        return await session?.getToken({ template: "supabase" }) ?? null
      })

      const prompt = prompts.find((p) => p.id === id)
      if (!prompt) return

      const newStatus = prompt.status === "active" ? "inactive" : "active"
      const updatedPrompt = await repository.update(id, { status: newStatus })
      
      setPrompts(prompts.map((p) => (p.id === id ? updatedPrompt : p)))
      toast({
        title: "성공",
        description: `프롬프트가 ${newStatus === "active" ? "활성화" : "비활성화"}되었습니다.`,
      })
    } catch (error) {
      console.error("프롬프트 상태 변경 중 오류:", error)
      toast({
        title: "오류",
        description: "프롬프트 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingPrompt(null)
    setFormData({ title: "", description: "", price: "", category: "ChatGPT", tags: "", status: "active" })
  }

  if (!isAuthenticated) {
    return null
  }

  const stats = {
    total: prompts.length,
    active: prompts.filter((p) => p.status === "active").length,
    inactive: prompts.filter((p) => p.status === "inactive").length,
    totalSales: prompts.reduce((sum, p) => sum + (p.sales || 0), 0),
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
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                관리자 홈
              </Link>
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
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">전체 프롬프트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">활성 프롬프트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">비활성 프롬프트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 판매량</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalSales}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">프롬프트 관리</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Link href="/admin">
              <Button>프롬프트 등록</Button>
            </Link>
          </div>
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">프롬프트를 불러오는 중...</p>
            </CardContent>
          </Card>
        ) : filteredPrompts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "전체" ? "검색 결과가 없습니다" : "등록된 프롬프트가 없습니다"}
              </p>
              {!searchQuery && selectedCategory === "전체" && (
                <Link href="/admin">
                  <Button className="mt-4">프롬프트 등록하기</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{prompt.category}</Badge>
                        <Badge variant={prompt.status === "active" ? "default" : "outline"}>
                          {prompt.status === "active" ? "활성" : "비활성"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{prompt.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{prompt.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
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
                      <div className="text-xl font-bold text-primary">{prompt.price.toLocaleString()}원</div>
                      <div className="text-xs text-muted-foreground">
                        판매: {prompt.sales || 0} | 리뷰: {prompt.reviews || 0}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(prompt.id)}
                        title={prompt.status === "active" ? "비활성화" : "활성화"}
                      >
                        {prompt.status === "active" ? "비활성" : "활성"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(prompt)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(prompt.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>프롬프트 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">가격 (원) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태 *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
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
                placeholder="마케팅, 콘텐츠 생성"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                취소
              </Button>
              <Button type="submit">수정</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
