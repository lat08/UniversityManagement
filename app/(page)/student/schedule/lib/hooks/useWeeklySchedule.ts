import { useState, useEffect } from 'react'

export const useWeeklySchedule = () => {
  const [selectedSemester, setSelectedSemester] = useState("Học kỳ 1 - Năm học 2025-2026")
  const [selectedWeek, setSelectedWeek] = useState("Tuần 4 [từ ngày 29/9/2025 đến ngày 5/10/2025]")
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isWeekOpen, setIsWeekOpen] = useState(false)
  const [isTooltipPinned, setIsTooltipPinned] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  const getColorClasses = (color: string, isHovered: boolean) => {
    const colors: Record<string, { bg: string; hover: string; border: string }> = {
      blue: {
        bg: "bg-blue-200",
        hover: "bg-blue-300",
        border: "border-blue-400",
      },
      red: {
        bg: "bg-red-200",
        hover: "bg-red-300",
        border: "border-red-400",
      },
      green: {
        bg: "bg-green-200",
        hover: "bg-green-300",
        border: "border-green-400",
      },
      yellow: {
        bg: "bg-yellow-200",
        hover: "bg-yellow-300",
        border: "border-yellow-400",
      },
    }

    const colorClass = colors[color] || colors.blue
    return `${isHovered ? colorClass.hover : colorClass.bg} ${colorClass.border} border-2 text-gray-900`
  }

  const handleMouseEnter = (courseId: string, event: React.MouseEvent) => {
    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    
    setHoveredCourse(courseId)
    setIsTooltipPinned(false) // Reset pin state
    
    const element = event.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()
    const container = element.closest('.mx-auto')
    const containerRect = container?.getBoundingClientRect()
    
    if (containerRect) {
      setHoverPosition({
        x: rect.right - containerRect.left + 10, // Position to the right of the cell, relative to container
        y: rect.top - containerRect.top,
      })
    }
  }

  const handleMouseLeave = () => {
    // Only hide if tooltip is not pinned
    if (!isTooltipPinned) {
      const timeout = setTimeout(() => {
        setHoveredCourse(null)
        setIsTooltipPinned(false)
      }, 200)
      setHideTimeout(timeout)
    }
  }

  const handleTooltipMouseEnter = () => {
    // Clear any hide timeout and pin the tooltip
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    setIsTooltipPinned(true)
  }

  const handleTooltipMouseLeave = () => {
    // Unpin and hide tooltip when leaving it
    setIsTooltipPinned(false)
    setHoveredCourse(null)
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
  }

  const handleTooltipClick = (e: React.MouseEvent) => {
    // Prevent event bubbling to avoid closing tooltip
    e.stopPropagation()
  }

  // Close dropdowns and tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Close dropdowns
      if (!target.closest('.dropdown-container')) {
        setIsSemesterOpen(false)
        setIsWeekOpen(false)
      }
      
      // Close tooltip if clicking outside
      if (!target.closest('.course-tooltip') && !target.closest('.course-cell')) {
        setHoveredCourse(null)
        setIsTooltipPinned(false)
        if (hideTimeout) {
          clearTimeout(hideTimeout)
          setHideTimeout(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [hideTimeout])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
    }
  }, [hideTimeout])

  return {
    selectedSemester,
    setSelectedSemester,
    selectedWeek,
    setSelectedWeek,
    hoveredCourse,
    hoverPosition,
    isSemesterOpen,
    setIsSemesterOpen,
    isWeekOpen,
    setIsWeekOpen,
    isTooltipPinned,
    getColorClasses,
    handleMouseEnter,
    handleMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    handleTooltipClick,
  }
}
