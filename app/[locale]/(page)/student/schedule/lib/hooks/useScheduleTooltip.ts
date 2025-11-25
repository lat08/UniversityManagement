import { useState, useCallback, useEffect } from "react"

interface TooltipState {
  hoveredCourse: string | null
  hoverPosition: { x: number; y: number }
  isTooltipPinned: boolean
}

export const useScheduleTooltip = () => {
  const [state, setState] = useState<TooltipState>({
    hoveredCourse: null,
    hoverPosition: { x: 0, y: 0 },
    isTooltipPinned: false,
  })
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = useCallback((courseId: string, event: React.MouseEvent) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    
    const element = event.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()
    
    setState({
      hoveredCourse: courseId,
      hoverPosition: { x: rect.right + 10, y: rect.top },
      isTooltipPinned: false,
    })
  }, [hideTimeout])

  const handleMouseLeave = useCallback(() => {
    if (!state.isTooltipPinned) {
      const timeout = setTimeout(() => {
        setState(prev => ({
          ...prev,
          hoveredCourse: null,
          isTooltipPinned: false,
        }))
      }, 200)
      setHideTimeout(timeout)
    }
  }, [state.isTooltipPinned])

  const handleTooltipMouseEnter = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    setState(prev => ({ ...prev, isTooltipPinned: true }))
  }, [hideTimeout])

  const handleTooltipMouseLeave = useCallback(() => {
    setState({
      hoveredCourse: null,
      hoverPosition: { x: 0, y: 0 },
      isTooltipPinned: false,
    })
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
  }, [hideTimeout])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (!target.closest('.course-tooltip') && !target.closest('.course-cell')) {
        setState({
          hoveredCourse: null,
          hoverPosition: { x: 0, y: 0 },
          isTooltipPinned: false,
        })
        if (hideTimeout) {
          clearTimeout(hideTimeout)
          setHideTimeout(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [hideTimeout])

  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
    }
  }, [hideTimeout])

  return {
    hoveredCourse: state.hoveredCourse,
    hoverPosition: state.hoverPosition,
    handleMouseEnter,
    handleMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
  }
}
