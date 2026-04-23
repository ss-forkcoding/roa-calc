import { Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

interface TopBarProps {
  actions?: ReactNode
  subtitle?: string
}

export function TopBar({ actions, subtitle = "Return on AI · realtime" }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stroke-soft/60 bg-bg-weak/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
            <Sparkles className="size-4" />
            <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-primary-glow/40" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-text-strong">
              NGA · ROA
            </span>
            <span className="text-paragraph-xs text-text-soft">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
