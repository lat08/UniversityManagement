"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils/utils"

export interface TabItem<T = string> {
  key: T
  label: string
  badge?: number | ReactNode
  disabled?: boolean
}

interface TabsProps<T = string> {
  readonly items: TabItem<T>[]
  readonly activeKey: T
  readonly onChange: (key: T) => void
  readonly className?: string
  readonly disabled?: boolean
}

export function Tabs<T = string>({
  items,
  activeKey,
  onChange,
  className,
  disabled = false,
}: TabsProps<T>) {
  const activeIndex = items.findIndex(item => item.key === activeKey)

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="flex w-full border border-[var(--border)] rounded-lg bg-[var(--muted)] relative">
        <div
          className="absolute top-0 bottom-0 bg-[var(--primary)] rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
          style={{
            width: `${100 / items.length}%`,
            left: `${activeIndex * (100 / items.length)}%`,
            transform: 'translateX(0)'
          }}
        />

        {items.map((item, index) => {
          const isActive = activeKey === item.key
          const isItemDisabled = disabled || item.disabled

          return (
            <div key={String(item.key)} className="flex-1 relative z-10">
              <button
                type="button"
                onClick={() => !isItemDisabled && onChange(item.key)}
                disabled={isItemDisabled}
                className={cn(
                  "w-full cursor-pointer px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 relative transition-all duration-300",
                  isActive
                    ? "text-[var(--primary-foreground)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  isItemDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="relative z-100">{item.label}</span>
                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={cn(
                      "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold transition-all duration-300",
                      isActive
                        ? "bg-[var(--badge-active-bg)] text-[var(--badge-active-text)] scale-110 shadow-sm"
                        : "bg-[var(--badge-bg)] text-[var(--badge-text)] hover:scale-105 hover:shadow-sm"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>

              {!isActive && index < items.length - 1 && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-[var(--border)] transition-opacity duration-300" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

