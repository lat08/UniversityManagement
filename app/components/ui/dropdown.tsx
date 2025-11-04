"use client"

import { useState, useEffect, useRef, ReactNode } from "react"
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
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = value ? options.find(opt => opt.value === value) : undefined

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

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
        <ChevronDown className="w-4 h-4 ml-2 text-gray-700 flex-shrink-0" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto",
            dropdownClassName
          )}
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
        </div>
      )}
    </div>
  )
}

