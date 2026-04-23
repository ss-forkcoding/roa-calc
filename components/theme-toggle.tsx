"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const current = mounted ? (theme === "system" ? resolvedTheme : theme) : "dark"
  const isDark = current === "dark"

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon"
      variant="outline"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="relative size-9 border-stroke-soft bg-bg-white text-text-strong hover:bg-bg-soft"
    >
      <Sun
        className={`size-4 transition-all ${isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}
      />
      <Moon
        className={`absolute size-4 transition-all ${isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`}
      />
    </Button>
  )
}
