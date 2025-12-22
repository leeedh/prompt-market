'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

/**
 * 테마 토글 컴포넌트
 * 
 * 다크 모드와 라이트 모드를 전환할 수 있는 버튼입니다.
 * next-themes의 useTheme 훅을 사용하여 현재 테마를 감지하고,
 * Lucide 아이콘(Sun, Moon)을 사용하여 시각적 피드백을 제공합니다.
 * 
 * @see https://ui.shadcn.com/docs/dark-mode/next
 * @see https://github.com/pacocoursey/next-themes
 */
export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // 클라이언트에서만 마운트되었는지 확인 (hydration mismatch 방지)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 마운트되지 않았거나 테마가 설정되지 않은 경우, 로딩 상태 표시
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="테마 전환">
        <Sun className="h-5 w-5" />
        <span className="sr-only">테마 전환</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">테마 전환</span>
    </Button>
  )
}

