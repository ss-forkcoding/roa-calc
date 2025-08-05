"use client"

import { useEffect, useState } from "react"

export function useCountUp(end: number, duration = 1000, start = 0, trigger = true) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    if (!trigger) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // easeOutCubic 이징 함수
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentCount = start + (end - start) * easeOutCubic

      setCount(Math.floor(currentCount))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration, start, trigger])

  return count
}
