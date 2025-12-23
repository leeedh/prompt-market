"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sparkles, Mail, Calendar, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/store/authStore"
import { useToast } from "@/shared/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { ModeToggle } from "@/components/mode-toggle"

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, isAuthenticated, logout, updateProfile } = useAuth()
  const { user: clerkUser, isLoaded } = useUser()
  const { toast } = useToast()
  const [name, setName] = useState(authUser?.name || "")
  const [isEditing, setIsEditing] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clerk 사용자 정보로 이름 초기화
  useEffect(() => {
    if (clerkUser && !name) {
      const fullName = clerkUser.fullName || clerkUser.firstName || clerkUser.username || ""
      setName(fullName)
    }
  }, [clerkUser, name])

  // 프로필 이미지 로드 (Clerk의 이미지 URL 사용)
  useEffect(() => {
    if (clerkUser?.imageUrl) {
      setAvatarUrl(clerkUser.imageUrl)
    } else if (authUser) {
      const storedAvatar = localStorage.getItem(`avatar_${authUser.id}`)
      if (storedAvatar) {
        setAvatarUrl(storedAvatar)
      }
    }
  }, [clerkUser, authUser])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "이미지 파일은 5MB 이하여야 합니다.",
        variant: "destructive",
      })
      return
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    // FileReader로 이미지를 base64로 변환
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setAvatarUrl(base64String)
      // localStorage에 저장
      if (user) {
        localStorage.setItem(`avatar_${user.id}`, base64String)
        toast({
          title: "프로필 이미지 업데이트",
          description: "프로필 이미지가 성공적으로 업로드되었습니다.",
        })
      }
    }
    reader.readAsDataURL(file)
  }

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (isLoaded && (!isAuthenticated || !authUser)) {
      router.push("/login")
    }
  }, [isLoaded, isAuthenticated, authUser, router])

  // 로딩 중이거나 로그인하지 않은 경우 렌더링하지 않음
  if (!isLoaded || !isAuthenticated || !authUser) {
    return null
  }

  const handleSave = async () => {
    try {
      await updateProfile(name)
      setIsEditing(false)
      toast({
        title: "프로필이 저장되었습니다",
        description: "프로필 정보가 성공적으로 업데이트되었습니다.",
      })
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Link href="/">
                <Button variant="ghost">홈으로</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">내 프로필</h1>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>계정 정보</CardTitle>
              <CardDescription>프로필 정보를 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={user.name} />
                    ) : (
                      <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{authUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{authUser.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {clerkUser?.imageUrl 
                      ? "프로필 이미지는 Clerk에서 관리됩니다" 
                      : "프로필 이미지를 클릭하여 변경하세요"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <div className="flex gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button onClick={handleSave}>저장</Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setName(authUser.name)
                            setIsEditing(false)
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>수정</Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    이메일
                  </Label>
                  <Input value={authUser.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    가입일
                  </Label>
                  <Input value={formatDate(authUser.createdAt)} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 이동</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/my-page">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  구매 내역 보기
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
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
                장바구니 보기
              </Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="pt-6">
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                로그아웃
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
