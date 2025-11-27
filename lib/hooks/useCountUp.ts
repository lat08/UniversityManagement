'use client'

import { useEffect, useState, useRef } from 'react'

interface UseCountUpOptions {
  readonly duration?: number
  readonly start?: number
  readonly enabled?: boolean
}

export function useCountUp(target: number, options: UseCountUpOptions = {}) {
  const { duration = 500, start = 0, enabled = true } = options
  const [count, setCount] = useState(start)
  const prevTargetRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const mountedRef = useRef(false)

  // Validate and normalize target value
  const normalizedTarget = typeof target === 'number' && !isNaN(target) && isFinite(target) 
    ? Math.max(0, target) 
    : 0

  useEffect(() => {
    if (!enabled) {
      setCount(normalizedTarget)
      prevTargetRef.current = normalizedTarget
      return
    }

    if (!mountedRef.current) {
      mountedRef.current = true
      prevTargetRef.current = start
      setCount(start)
    }

    if (normalizedTarget === prevTargetRef.current) {
      return
    }

    const startValue = prevTargetRef.current ?? start
    const startTime = Date.now()
    const difference = normalizedTarget - startValue

    const updateCount = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + difference * easeOutQuart
      
      const isDecimal = normalizedTarget % 1 !== 0 || startValue % 1 !== 0
      const currentCount = isDecimal 
        ? Math.round(currentValue * 100) / 100
        : Math.round(currentValue)
      
      // Ensure count is valid number
      const validCount = typeof currentCount === 'number' && !isNaN(currentCount) && isFinite(currentCount)
        ? Math.max(0, currentCount)
        : 0
      
      setCount(validCount)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateCount)
      } else {
        setCount(normalizedTarget)
        prevTargetRef.current = normalizedTarget
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateCount)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [normalizedTarget, duration, start, enabled])

  return count
}

