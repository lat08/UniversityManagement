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

  useEffect(() => {
    if (!enabled) {
      setCount(target)
      prevTargetRef.current = target
      return
    }

    if (!mountedRef.current) {
      mountedRef.current = true
      prevTargetRef.current = start
      setCount(start)
    }

    if (target === prevTargetRef.current) {
      return
    }

    const startValue = prevTargetRef.current ?? start
    const startTime = Date.now()
    const difference = target - startValue

    const updateCount = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + difference * easeOutQuart
      
      const isDecimal = target % 1 !== 0 || startValue % 1 !== 0
      const currentCount = isDecimal 
        ? Math.round(currentValue * 100) / 100
        : Math.round(currentValue)
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateCount)
      } else {
        setCount(target)
        prevTargetRef.current = target
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateCount)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [target, duration, start, enabled])

  return count
}

