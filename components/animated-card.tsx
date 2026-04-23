import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  const { ref, hasIntersected } = useIntersectionObserver()

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        hasIntersected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Card className="relative h-full gap-0 overflow-hidden border border-stroke-soft/70 bg-card/80 py-0 shadow-sm backdrop-blur-md">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
        {children}
      </Card>
    </div>
  )
}
