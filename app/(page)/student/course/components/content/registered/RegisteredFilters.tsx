"use client"

import { memo, useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { SearchInput, Dropdown, Button } from "@/app/components/ui"
import { useRegisteredFiltersStore } from "../../../lib/stores/registeredFiltersStore"

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'registered', label: 'Đã đăng ký' },
  { value: 'locked', label: 'Đã khóa' },
]

interface RegisteredFiltersProps {
  totalCourses: number
  totalCredits: number
  onRegisterButtonClick?: () => void
}

function RegisteredFilters({ totalCourses, totalCredits, onRegisterButtonClick }: RegisteredFiltersProps) {
  const searchQuery = useRegisteredFiltersStore((state) => state.tempFilters.searchQuery)
  const selectedStatus = useRegisteredFiltersStore((state) => state.tempFilters.selectedStatus)
  const setTempFilters = useRegisteredFiltersStore((state) => state.setTempFilters)
  const applyFilters = useRegisteredFiltersStore((state) => state.applyFilters)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setTempFilters({ searchQuery: value })
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Set new debounce timer (500ms)
    debounceTimerRef.current = setTimeout(() => {
      applyFilters()
    }, 500)
  }

  const handleStatusChange = (value: string) => {
    setTempFilters({ selectedStatus: value })
    applyFilters()
  }

  return (
    <div>
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
          Môn học đã đăng ký
        </h2>
        <p className="text-sm lg:text-base mt-1">
          <span className="font-semibold text-red-600">{totalCourses}</span> <span className="text-gray-600">môn học,</span> <span className="font-semibold text-red-600">{totalCredits}</span> <span className="text-gray-600">tín chỉ</span>
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <div className="sm:col-span-1 lg:col-span-2">
          <SearchInput
            placeholder="Tìm kiếm theo mã, tên môn học..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Dropdown
            options={STATUS_OPTIONS}
            value={selectedStatus || ''}
            placeholder="Tất cả trạng thái"
            onChange={handleStatusChange}
            className="flex-1"
          />
          <Button
            onClick={() => onRegisterButtonClick?.()}
            className="bg-[#0053AD] hover:bg-[#003d82] text-white"
          >
            <Plus className="w-4 h-4" />
            Đăng ký
          </Button>
        </div>
      </div>
    </div>
  )
}

export default memo(RegisteredFilters)
