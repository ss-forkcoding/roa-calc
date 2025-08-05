"use client"

import { useCountUp } from "@/hooks/use-count-up"
import { useEffect, useState } from "react"

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatFn?: (value: number) => string
  trigger?: boolean
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1000,
  formatFn = (v) => v.toString(),
  trigger = true,
  className,
}: AnimatedNumberProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const animatedValue = useCountUp(value, duration, 0, shouldAnimate)

  useEffect(() => {
    if (trigger) {
      setShouldAnimate(false)
      const timer = setTimeout(() => setShouldAnimate(true), 100)
      return () => clearTimeout(timer)
    }
  }, [value, trigger])

  return <span className={className}>{formatFn(animatedValue)}</span>
}
