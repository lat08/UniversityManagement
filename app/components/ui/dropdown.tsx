"use client"

import { useState, useEffect, useRef, useCallback, ReactNode } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/utils"

interface DropdownOption<T = string> {
  value: T
  label: string
  disabled?: boolean
}

interface DropdownProps<T = string> {
  readonly options: DropdownOption<T>[]
  readonly value?: T
  readonly placeholder?: string
  readonly onChange: (value: T) => void
  readonly disabled?: boolean
  readonly className?: string
  readonly buttonClassName?: string
  readonly dropdownClassName?: string
  readonly showEmptyOption?: boolean
  readonly emptyOptionLabel?: string
  readonly renderValue?: (value: T | undefined, selectedOption?: DropdownOption<T>) => ReactNode
}

export function Dropdown<T = string>({
  options,
  value,
  placeholder = "Chọn...",
  onChange,
  disabled = false,
  className,
  buttonClassName,
  dropdownClassName,
  showEmptyOption = false,
  emptyOptionLabel = "Tất cả",
  renderValue,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false })
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = value ? options.find(opt => opt.value === value) : undefined

  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current && typeof window !== 'undefined') {
      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      const estimatedDropdownHeight = Math.min(240, options.length * 40 + 16)
      
      const openUpward = spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow
      
      setDropdownPosition({
        top: openUpward 
          ? rect.top + window.scrollY - estimatedDropdownHeight - 8
          : rect.bottom + window.scrollY + 8,
        left: Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth + window.scrollX - rect.width - 8)),
        width: rect.width,
        openUpward,
      })
    }
  }, [options.length])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    updateDropdownPosition()
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("resize", updateDropdownPosition)
    window.addEventListener("scroll", updateDropdownPosition, true)
    setShouldRender(true)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", updateDropdownPosition)
      window.removeEventListener("scroll", updateDropdownPosition, true)
    }
  }, [isOpen, updateDropdownPosition])

  useEffect(() => {
    if (!isOpen && shouldRender) {
      const timer = setTimeout(() => setShouldRender(false), 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen, shouldRender])

  const handleSelect = (optionValue: T) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const displayValue = renderValue 
    ? renderValue(value, selectedOption)
    : selectedOption?.label || placeholder

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full",
          disabled && "opacity-50 cursor-not-allowed",
          buttonClassName
        )}
      >
        <span className="text-sm text-gray-900 truncate">
          {displayValue}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 ml-2 text-gray-700 flex-shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {shouldRender && typeof window !== 'undefined' && document.body && createPortal(
        <div
          ref={dropdownRef}
          className={cn(
            "fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-all",
            isOpen 
              ? "opacity-100 translate-y-0 scale-100 duration-200 ease-out" 
              : dropdownPosition.openUpward
              ? "opacity-0 -translate-y-1 scale-[0.98] duration-150 ease-in pointer-events-none"
              : "opacity-0 translate-y-1 scale-[0.98] duration-150 ease-in pointer-events-none",
            dropdownClassName
          )}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {showEmptyOption && (
            <button
              type="button"
              onClick={() => handleSelect(undefined as T)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
            >
              {emptyOptionLabel}
            </button>
          )}
          {options.map((option, index) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors",
                !showEmptyOption && index === 0 && "first:rounded-t-lg",
                index === options.length - 1 && "last:rounded-b-lg",
                option.disabled && "opacity-50 cursor-not-allowed",
                value === option.value && "bg-blue-50 text-blue-700 font-medium"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

