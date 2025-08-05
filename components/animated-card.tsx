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
        hasIntersected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      <Card className="bg-white shadow-lg border border-gray-200 h-full">{children}</Card>
    </div>
  )
}
