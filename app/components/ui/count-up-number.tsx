'use client'

import { useCountUp } from '@/lib/hooks/useCountUp'

interface CountUpNumberProps {
  readonly value: number
  readonly duration?: number
  readonly className?: string
}

export function CountUpNumber({ value, duration = 1000, className }: CountUpNumberProps) {
  const count = useCountUp(value, { duration })
  return <span className={className}>{count}</span>
}

