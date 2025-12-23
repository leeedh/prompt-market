"use client"

import { useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Link, useRouter } from "@/i18n/routing"
import { SignIn, SignUp } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { ModeToggle } from "@/components/mode-toggle"
import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const t = useTranslations()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, router])

  // 로딩 중이거나 이미 로그인된 경우 빈 화면 표시
  if (!isLoaded || isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">{t("common.appName")}</span>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("login.login")}</TabsTrigger>
              <TabsTrigger value="register">{t("login.register")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <div className="flex justify-center">
                <SignIn
                  routing="hash"
                  signUpUrl="/login"
                  afterSignInUrl="/"
                />
              </div>
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <div className="flex justify-center">
                <SignUp
                  routing="hash"
                  signInUrl="/login"
                  afterSignUpUrl="/"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
