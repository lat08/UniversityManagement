"use client"

import { useState, useEffect, useRef, ReactNode } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils/utils"

interface DropdownSearchOption<T = string> {
  value: T
  label: string
  disabled?: boolean
}

interface DropdownSearchProps<T = string> {
  readonly options: DropdownSearchOption<T>[]
  readonly value?: T
  readonly placeholder?: string
  readonly searchPlaceholder?: string
  readonly onChange: (value: T) => void
  readonly disabled?: boolean
  readonly className?: string
  readonly buttonClassName?: string
  readonly dropdownClassName?: string
  readonly showEmptyOption?: boolean
  readonly emptyOptionLabel?: string
  readonly renderValue?: (value: T | undefined, selectedOption?: DropdownSearchOption<T>) => ReactNode
  readonly onSearch?: (query: string) => void
  readonly filterOptions?: (options: DropdownSearchOption<T>[], query: string) => DropdownSearchOption<T>[]
}

export function DropdownSearch<T = string>({
  options,
  value,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  onChange,
  disabled = false,
  className,
  buttonClassName,
  dropdownClassName,
  showEmptyOption = false,
  emptyOptionLabel = "Tất cả",
  renderValue,
  onSearch,
  filterOptions,
}: DropdownSearchProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = value ? options.find(opt => opt.value === value) : undefined

  const filteredOptions = filterOptions
    ? filterOptions(options, searchQuery)
    : options.filter(opt =>
        opt.label && typeof opt.label === 'string' && opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )

  // Calculate dropdown position when opening and update on scroll/resize
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const updatePosition = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
            width: rect.width,
          })
        }
      }

      updatePosition()
      setTimeout(() => searchInputRef.current?.focus(), 100)

      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (onSearch) {
      onSearch(searchQuery)
    }
  }, [searchQuery, onSearch])

  const handleSelect = (optionValue: T) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
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

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className={cn(
            "fixed z-[100] bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 flex flex-col",
            dropdownClassName
          )}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-600 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-48">
            {showEmptyOption && (
              <button
                type="button"
                onClick={() => handleSelect(undefined as T)}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors",
                  value === undefined && "bg-blue-50 text-blue-700 font-medium"
                )}
              >
                {emptyOptionLabel}
              </button>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                Không tìm thấy
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors",
                    option.disabled && "opacity-50 cursor-not-allowed",
                    value === option.value && "bg-blue-50 text-blue-700 font-medium"
                  )}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

