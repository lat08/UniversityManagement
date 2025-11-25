'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface TooltipState {
  hoveredCourse: string | null;
  hoverPosition: { x: number; y: number };
  isTooltipPinned: boolean;
}

export const useScheduleTooltip = () => {
  const [state, setState] = useState<TooltipState>({
    hoveredCourse: null,
    hoverPosition: { x: 0, y: 0 },
    isTooltipPinned: false,
  });
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  }, [hideTimeout]);

  const handleMouseEnter = useCallback(
    (courseId: string, event: React.MouseEvent) => {
      clearHideTimeout();

      const element = event.currentTarget as HTMLElement;
      const rect = element.getBoundingClientRect();

      setState({
        hoveredCourse: courseId,
        hoverPosition: { x: rect.right + 10, y: rect.top },
        isTooltipPinned: false,
      });
    },
    [clearHideTimeout],
  );

  const handleMouseLeave = useCallback(() => {
    if (state.isTooltipPinned) {
      return;
    }
    const timeout = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        hoveredCourse: null,
        isTooltipPinned: false,
      }));
    }, 200);
    setHideTimeout(timeout);
  }, [state.isTooltipPinned]);

  const handleTooltipMouseEnter = useCallback(() => {
    clearHideTimeout();
    setState((prev) => ({ ...prev, isTooltipPinned: true }));
  }, [clearHideTimeout]);

  const handleTooltipMouseLeave = useCallback(() => {
    setState({
      hoveredCourse: null,
      hoverPosition: { x: 0, y: 0 },
      isTooltipPinned: false,
    });
    clearHideTimeout();
  }, [clearHideTimeout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.course-tooltip') && !target.closest('.course-cell')) {
        setState({
          hoveredCourse: null,
          hoverPosition: { x: 0, y: 0 },
          isTooltipPinned: false,
        });
        clearHideTimeout();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearHideTimeout]);

  useEffect(
    () => () => {
      clearHideTimeout();
    },
    [clearHideTimeout],
  );

  return useMemo(
    () => ({
      hoveredCourse: state.hoveredCourse,
      hoverPosition: state.hoverPosition,
      handleMouseEnter,
      handleMouseLeave,
      handleTooltipMouseEnter,
      handleTooltipMouseLeave,
    }),
    [state, handleMouseEnter, handleMouseLeave, handleTooltipMouseEnter, handleTooltipMouseLeave],
  );
};

