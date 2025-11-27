'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Dropdown, Input } from '@/app/components/ui';
import { X, Calendar } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { format, parse } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { toast } from 'react-hot-toast';
import { scheduleChangeApi } from '../lib/api/scheduleChangeApi';
import type { LeaveRequest, AvailableRoom, AvailabilityQuery } from '../lib/types/types';
import { CLASS_PERIODS, getPeriodLabel, getPeriodTimeRange } from '../lib/types/types';
import 'react-day-picker/dist/style.css';

interface ApproveScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  request: LeaveRequest | null;
}

export const ApproveScheduleChangeModal = ({
  isOpen,
  onClose,
  onSuccess,
  request,
}: ApproveScheduleChangeModalProps) => {
  const t = useTranslations('admin.scheduleChangeManagement.modals.approve');
  const tSchedule = useTranslations('common.schedule');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  
  const [makeupDate, setMakeupDate] = useState<Date | undefined>(undefined);
  const [dateInputValue, setDateInputValue] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [startPeriod, setStartPeriod] = useState<number>(0);
  const [endPeriod, setEndPeriod] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [reviewNote, setReviewNote] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const selectedRoomIdRef = useRef<string>('');

  // Helper function to calculate date from cancelled week and day of week
  const calculateCancelledDate = useCallback((cancelledWeek: number, dayOfWeek: number, createdAt: string): Date | null => {
    try {
      const createdDate = new Date(createdAt);
      const createdDayOfWeek = createdDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Convert to our dayOfWeek format (2=Monday, 8=Sunday)
      const createdDayOfWeekFormatted = createdDayOfWeek === 0 ? 8 : createdDayOfWeek + 1;
      
      // Calculate days difference
      let daysDiff = dayOfWeek - createdDayOfWeekFormatted;
      if (daysDiff < 0) daysDiff += 7;
      
      // Estimate: assume cancelled week is relative to created date
      const weekOffset = (cancelledWeek - 1) * 7;
      const cancelledDate = new Date(createdDate);
      cancelledDate.setDate(createdDate.getDate() + daysDiff + weekOffset);
      
      return cancelledDate;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, onClose]);

  // Initialize form with proposed schedule if available
  useEffect(() => {
    if (!isOpen) {
      setMakeupDate(undefined);
      setDateInputValue('');
      setStartPeriod(0);
      setEndPeriod(0);
      setSelectedRoomId('');
      selectedRoomIdRef.current = '';
      setReviewNote('');
      setAvailableRooms([]);
      setLoadingAvailability(false);
    } else if (request) {
      // If request has proposed schedule, pre-fill the form
      if (request.makeUpDate && request.startPeriod > 0 && request.endPeriod > 0) {
        const proposedDate = new Date(request.makeUpDate);
        setMakeupDate(proposedDate);
        setDateInputValue(format(proposedDate, 'dd/MM/yyyy'));
        setStartPeriod(request.startPeriod);
        setEndPeriod(request.endPeriod);
      } else {
        // Otherwise, set default periods from request
        setStartPeriod(request.startPeriod);
        setEndPeriod(request.endPeriod);
      }
    }
  }, [isOpen, request]);

  // Load availability when date and periods are selected
  useEffect(() => {
    // Only load if modal is open, we have all required data and request is valid
    if (!isOpen || !makeupDate || !request || !request.requestId || startPeriod <= 0 || endPeriod <= 0) {
      if (!isOpen || !makeupDate || startPeriod <= 0 || endPeriod <= 0) {
        setAvailableRooms([]);
        setSelectedRoomId('');
      }
      return;
    }

    let isMounted = true;

    const loadAvailability = async () => {
      setLoadingAvailability(true);
      if (isMounted) {
        setAvailableRooms([]);
      }

      try {
        const query: AvailabilityQuery = {
          makeupDate: format(makeupDate, 'yyyy-MM-dd'),
          startPeriod,
          endPeriod,
        };

        const result = await scheduleChangeApi.getAvailability(request.requestId, query);
        
        if (isMounted) {
          const rooms = result.rooms || [];
          setAvailableRooms(rooms);

          // If request has proposed room code and we haven't selected a room yet, try to find and select it
          if (request.makeUpRoomCode && !selectedRoomIdRef.current && rooms.length > 0) {
            const normalizedCode = request.makeUpRoomCode.toLowerCase();
            const proposedRoom = rooms.find((r) => {
              const roomName = r.roomName ? r.roomName.toLowerCase() : '';
              const roomId = r.roomId ? r.roomId.toLowerCase() : '';
              return roomName.includes(normalizedCode) || roomId === normalizedCode;
            });
            if (proposedRoom) {
              selectedRoomIdRef.current = proposedRoom.roomId;
              setSelectedRoomId(proposedRoom.roomId);
            }
          }
        }
      } catch (error) {
        if (!isMounted) return;
        
        // Only show error toast if it's not a validation/authentication error
        const apiError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
        const errorMessage = apiError?.response?.data?.message || apiError?.message || t('availabilityError');
        const status = apiError?.response?.status;
        
        // Don't show toast for 401/403 errors (authentication issues)
        if (status !== 401 && status !== 403) {
          console.error('Error loading availability:', error);
          // Only show error if user is actively interacting, not on initial load
          if (makeupDate && startPeriod > 0 && endPeriod > 0) {
            toast.error(errorMessage);
          }
        }
        
        setAvailableRooms([]);
      } finally {
        if (isMounted) {
          setLoadingAvailability(false);
        }
      }
    };

    // Add a small delay to avoid rapid successive calls
    const timeoutId = setTimeout(() => {
      loadAvailability();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isOpen, makeupDate, startPeriod, endPeriod, request, t]);

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);
    
    if (value.length === 10) {
      try {
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        if (!isNaN(parsedDate.getTime())) {
          setMakeupDate(parsedDate);
          setShowCalendar(false);
        }
      } catch {
        // Invalid date format
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setMakeupDate(date);
      setDateInputValue(format(date, 'dd/MM/yyyy'));
      setShowCalendar(false);
    }
  };

  // Handler to use proposed schedule - must be before early return
  const handleUseProposedSchedule = useCallback(() => {
    if (!request) return;
    const makeUpDate = request.makeUpDate ? new Date(request.makeUpDate) : null;
    if (makeUpDate && request.startPeriod > 0 && request.endPeriod > 0) {
      setMakeupDate(makeUpDate);
      setDateInputValue(format(makeUpDate, 'dd/MM/yyyy'));
      setStartPeriod(request.startPeriod);
      setEndPeriod(request.endPeriod);
      
      // Try to find and select proposed room if available rooms are already loaded
      if (request.makeUpRoomCode && availableRooms.length > 0) {
        const normalizedCode = request.makeUpRoomCode.toLowerCase();
        const proposedRoom = availableRooms.find((r) => {
          const roomName = r.roomName ? r.roomName.toLowerCase() : '';
          const roomId = r.roomId ? r.roomId.toLowerCase() : '';
          return roomName.includes(normalizedCode) || roomId === normalizedCode;
        });
        if (proposedRoom) {
          selectedRoomIdRef.current = proposedRoom.roomId;
          setSelectedRoomId(proposedRoom.roomId);
        } else {
          // Reset if proposed room not found
          setSelectedRoomId('');
          selectedRoomIdRef.current = '';
        }
      } else {
        // Reset room selection - will be auto-selected when availability loads
        setSelectedRoomId('');
        selectedRoomIdRef.current = '';
      }
      
      toast.success(t('revertSuccess'));
    }
  }, [request, availableRooms, t]);

  const handleSubmit = async () => {
    if (!request) return;

    if (!makeupDate) {
      toast.error(t('errors.makeupDateRequired'));
      return;
    }

    if (startPeriod <= 0 || endPeriod <= 0) {
      toast.error(t('errors.periodRequired'));
      return;
    }

    if (startPeriod > endPeriod) {
      toast.error(t('errors.startPeriodGreater'));
      return;
    }

    // Validate period count matches cancelled periods
    const cancelledPeriodCount = request.endPeriod - request.startPeriod + 1;
    const makeupPeriodCount = endPeriod - startPeriod + 1;
    if (makeupPeriodCount !== cancelledPeriodCount) {
      toast.error(t('errors.periodCountMismatch', { makeup: makeupPeriodCount, cancelled: cancelledPeriodCount }));
      return;
    }

    if (!selectedRoomId) {
      toast.error(t('errors.roomRequired'));
      return;
    }

    if (reviewNote && reviewNote.length > 500) {
      toast.error(t('errors.noteMaxLength'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        makeupDate: format(makeupDate, 'yyyy-MM-dd'),
        startPeriod,
        endPeriod,
        roomId: selectedRoomId,
        reviewNote: reviewNote.trim() || undefined,
      };

      const response = await scheduleChangeApi.approve(request.requestId, payload);

      if (response.success) {
        toast.success(t('success'));
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || t('error'));
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || t('error');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Early return after all hooks
  if (!isOpen || !request) return null;

  const cancelledDate = calculateCancelledDate(request.cancelledWeek, request.dayOfWeek, request.createdAt);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const periodOptions = CLASS_PERIODS.map((p) => ({
    value: p.period.toString(),
    label: `${tSchedule('grid.period', { period: p.period })} (${p.startTime} - ${p.endTime})`,
  }));

  const makeUpDateFromRequest = request.makeUpDate ? new Date(request.makeUpDate) : null;
  const hasProposedSchedule = makeUpDateFromRequest && request.startPeriod > 0 && request.endPeriod > 0;

  // Check if current form matches proposed schedule (date and periods)
  const isUsingProposedDateAndPeriods = 
    makeUpDateFromRequest && 
    makeupDate && 
    format(makeupDate, 'yyyy-MM-dd') === format(makeUpDateFromRequest, 'yyyy-MM-dd') &&
    startPeriod === request.startPeriod &&
    endPeriod === request.endPeriod;

  // Check if current room matches proposed room
  const isUsingProposedRoom = request.makeUpRoomCode && selectedRoomId && availableRooms.length > 0
    ? (() => {
        const normalizedCode = request.makeUpRoomCode.toLowerCase();
        const selectedRoom = availableRooms.find(r => r.roomId === selectedRoomId);
        if (!selectedRoom) return false;
        const roomName = selectedRoom.roomName ? selectedRoom.roomName.toLowerCase() : '';
        const roomId = selectedRoom.roomId ? selectedRoom.roomId.toLowerCase() : '';
        return roomName.includes(normalizedCode) || roomId === normalizedCode;
      })()
    : !request.makeUpRoomCode && !selectedRoomId; // Both empty

  // Check if completely using proposed schedule
  const isUsingProposedSchedule = isUsingProposedDateAndPeriods && isUsingProposedRoom;

  // Check if admin has changed anything from proposed schedule
  const hasChangedFromProposed = hasProposedSchedule && !isUsingProposedSchedule;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('description', { code: request.requestCode })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Thông tin yêu cầu */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('requestInfo')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{t('instructor')}</span>
                <p className="text-gray-900 font-medium">{request.instructorName}</p>
              </div>
              <div>
                <span className="text-gray-600">{t('subject')}</span>
                <p className="text-gray-900 font-medium">{request.subjectName}</p>
              </div>
              <div>
                <span className="text-gray-600">{t('class')}</span>
                <p className="text-gray-900 font-medium">{request.courseClassCode}</p>
              </div>
            </div>
          </div>

          {/* Lịch hiện tại */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('currentSchedule')}</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
                <p className="text-gray-900 font-medium">
                  {cancelledDate 
                    ? format(cancelledDate, 'EEEE, dd/MM/yyyy', { locale: dateLocale })
                    : request.dayOfWeekText}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cancelledWeek')}</label>
                <p className="text-gray-900 font-medium">{request.cancelledWeek}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('period')}</label>
                <p className="text-gray-900 font-medium">
                  {getPeriodLabel(
                    request.startPeriod,
                    request.endPeriod,
                    (key: string, params?: Record<string, unknown>) =>
                      tSchedule(key, params as Parameters<typeof tSchedule>[1]),
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('room')}</label>
                <p className="text-gray-900 font-medium">{request.currentRoomCode || request.currentRoomName || '-'}</p>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('timeRange')}</label>
                <p className="text-gray-900 font-medium">{getPeriodTimeRange(request.startPeriod, request.endPeriod)}</p>
              </div>
            </div>
          </div>

          {/* Lịch đề xuất */}
          {hasProposedSchedule && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-900">{t('proposedSchedule')}</h3>
                {!isUsingProposedSchedule && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseProposedSchedule}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {t('revertToProposed')}
                  </Button>
                )}
                {isUsingProposedSchedule && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {t('usingProposed')}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('date')}</label>
                  <p className="text-blue-900 font-medium">
                    {format(makeUpDateFromRequest, 'EEEE, dd/MM/yyyy', { locale: dateLocale })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('makeupWeek')}</label>
                  <p className="text-blue-900 font-medium">{request.makeupWeek ? `${t('makeupWeek')} ${request.makeupWeek}` : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('period')}</label>
                  <p className="text-blue-900 font-medium">
                    {getPeriodLabel(request.startPeriod, request.endPeriod)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('room')}</label>
                  <p className="text-blue-900 font-medium">{request.makeUpRoomCode || request.makeUpRoomName || '-'}</p>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-blue-700 mb-1">{t('timeRange')}</label>
                  <p className="text-blue-900 font-medium">{getPeriodTimeRange(request.startPeriod, request.endPeriod)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Alert khi đã thay đổi */}
          {hasChangedFromProposed && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  {t('changedAlert')}
                </p>
                <p className="text-xs text-amber-700">
                  {t('changedAlertDesc')}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseProposedSchedule}
                className="border-amber-300 text-amber-700 hover:bg-amber-100 whitespace-nowrap"
              >
                {t('revertToProposed')}
              </Button>
            </div>
          )}

          {/* Chọn ngày dạy bù */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                {t('makeupDate')} <span className="text-red-500">*</span>
              </label>
              {hasProposedSchedule && !isUsingProposedDateAndPeriods && (
                <button
                  type="button"
                  onClick={handleUseProposedSchedule}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  {t('useProposedDate')}
                </button>
              )}
            </div>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="dd/MM/yyyy"
                    value={dateInputValue}
                    onChange={(e) => handleDateInputChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="border-gray-300"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
              {showCalendar && (
                <div ref={calendarRef} className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
                  <DayPicker
                    mode="single"
                    selected={makeupDate}
                    onSelect={handleCalendarSelect}
                    locale={dateLocale}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Chọn tiết học */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  {t('startPeriod')} <span className="text-red-500">*</span>
                </label>
                {hasProposedSchedule && startPeriod !== request.startPeriod && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartPeriod(request.startPeriod);
                      if (endPeriod < request.startPeriod) {
                        setEndPeriod(request.endPeriod);
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    {t('useProposedPeriod', { period: request.startPeriod })}
                  </button>
                )}
              </div>
              <Dropdown
                options={periodOptions}
                value={startPeriod.toString()}
                placeholder={t('startPeriod')}
                onChange={(value) => {
                  setStartPeriod(Number.parseInt(value));
                  if (endPeriod < Number.parseInt(value)) {
                    setEndPeriod(Number.parseInt(value));
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  {t('endPeriod')} <span className="text-red-500">*</span>
                </label>
                {hasProposedSchedule && endPeriod !== request.endPeriod && (
                  <button
                    type="button"
                    onClick={() => setEndPeriod(request.endPeriod)}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    {t('useProposedPeriod', { period: request.endPeriod })}
                  </button>
                )}
              </div>
              <Dropdown
                options={periodOptions.filter((p) => Number.parseInt(p.value) >= startPeriod)}
                value={endPeriod.toString()}
                placeholder={t('endPeriod')}
                onChange={(value) => setEndPeriod(Number.parseInt(value))}
              />
            </div>
          </div>

          {/* Chọn phòng học */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                {t('room')} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {request.makeUpRoomCode && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    isUsingProposedRoom 
                      ? 'text-blue-600 bg-blue-100' 
                      : 'text-amber-600 bg-amber-100'
                  }`}>
                    {isUsingProposedRoom ? `${t('usingProposedRoom')} ` : `${t('proposedRoom')} `}{request.makeUpRoomCode}
                  </span>
                )}
                {hasProposedSchedule && request.makeUpRoomCode && !isUsingProposedRoom && selectedRoomId && (
                  <button
                    type="button"
                    onClick={handleUseProposedSchedule}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    {t('useProposedRoom')}
                  </button>
                )}
              </div>
            </div>
            {loadingAvailability ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">{t('loadingRooms')}</p>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  {makeupDate && startPeriod > 0 && endPeriod > 0
                    ? t('noRooms')
                    : t('selectDatePeriod')}
                </p>
              </div>
            ) : (
              <Dropdown
                options={availableRooms.map((room) => {
                  const isProposedRoom = request.makeUpRoomCode && 
                    (room.roomName.toLowerCase().includes(request.makeUpRoomCode.toLowerCase()) ||
                     room.roomId.toLowerCase() === request.makeUpRoomCode.toLowerCase());
                  return {
                    value: room.roomId,
                    label: `${room.roomName} (${t('roomCapacity')} ${room.capacity})${isProposedRoom ? ' ⭐' : ''}`,
                  };
                })}
                value={selectedRoomId}
                placeholder={t('room')}
                onChange={(value) => {
                  selectedRoomIdRef.current = value;
                  setSelectedRoomId(value);
                }}
              />
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('note')}
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={t('notePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053AD] focus:border-[#0053AD] resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('characters', { count: reviewNote.length })}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10"
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !makeupDate || !selectedRoomId || startPeriod <= 0 || endPeriod <= 0}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('processing') : t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

