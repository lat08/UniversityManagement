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
import type {
  LeaveRequest,
  AvailableRoom,
  AvailabilityQuery,
  UpdateScheduleChangePayload,
} from '../lib/types/types';
import { CLASS_PERIODS, getPeriodLabel, getPeriodTimeRange } from '../lib/types/types';
import 'react-day-picker/dist/style.css';

interface EditScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  request: LeaveRequest | null;
}

export const EditScheduleChangeModal = ({
  isOpen,
  onClose,
  onSuccess,
  request,
}: EditScheduleChangeModalProps) => {
  const t = useTranslations('admin.scheduleChangeManagement.modals.edit');
  const tSchedule = useTranslations('common.schedule');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  
  const [makeupDate, setMakeupDate] = useState<Date | undefined>(undefined);
  const [dateInputValue, setDateInputValue] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [makeupWeek, setMakeupWeek] = useState<number | null>(null);
  const [startPeriod, setStartPeriod] = useState<number>(0);
  const [endPeriod, setEndPeriod] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
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

  // Initialize form with current request data
  useEffect(() => {
    if (!isOpen) {
      setMakeupDate(undefined);
      setDateInputValue('');
      setMakeupWeek(null);
      setStartPeriod(0);
      setEndPeriod(0);
      setSelectedRoomId('');
      selectedRoomIdRef.current = '';
      setReason('');
      setAvailableRooms([]);
      setLoadingAvailability(false);
    } else if (request) {
      // Pre-fill form with current request data
      if (request.makeUpDate) {
        const currentDate = new Date(request.makeUpDate);
        setMakeupDate(currentDate);
        setDateInputValue(format(currentDate, 'dd/MM/yyyy'));
      }
      setMakeupWeek(request.makeupWeek ?? null);
      setStartPeriod(request.startPeriod);
      setEndPeriod(request.endPeriod);
      setReason(request.reason || '');
    }
  }, [isOpen, request]);

  // Load availability when date and periods are selected
  useEffect(() => {
    if (!isOpen || !makeupDate || !request || !request.requestId || startPeriod <= 0 || endPeriod <= 0) {
      if (!isOpen || !makeupDate || startPeriod <= 0 || endPeriod <= 0) {
        setAvailableRooms([]);
        if (!isOpen || !makeupDate || startPeriod <= 0 || endPeriod <= 0) {
          setSelectedRoomId('');
        }
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

          // Try to find and select current room if available
          if (request.makeUpRoomCode && rooms.length > 0) {
            const normalizedCode = request.makeUpRoomCode.toLowerCase();
            const currentRoom = rooms.find((r) => {
              const roomName = r.roomName ? r.roomName.toLowerCase() : '';
              const roomId = r.roomId ? r.roomId.toLowerCase() : '';
              return roomName.includes(normalizedCode) || roomId === normalizedCode;
            });
            if (currentRoom && !selectedRoomIdRef.current) {
              selectedRoomIdRef.current = currentRoom.roomId;
              setSelectedRoomId(currentRoom.roomId);
            }
          }
        }
      } catch (error) {
        if (!isMounted) return;
        
        const apiError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
        const errorMessage = apiError?.response?.data?.message || apiError?.message || t('availabilityError');
        const status = apiError?.response?.status;
        
        if (status !== 401 && status !== 403) {
          console.error('Error loading availability:', error);
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

  const handleSubmit = async () => {
    if (!request) return;

    // Validate period count matches cancelled periods if periods are changed
    if (startPeriod > 0 && endPeriod > 0) {
      const cancelledPeriodCount = request.endPeriod - request.startPeriod + 1;
      const makeupPeriodCount = endPeriod - startPeriod + 1;
      if (makeupPeriodCount !== cancelledPeriodCount) {
        toast.error(t('errors.periodCountMismatch', { makeup: makeupPeriodCount, cancelled: cancelledPeriodCount }));
        return;
      }
    }

    if (startPeriod > 0 && endPeriod > 0 && startPeriod > endPeriod) {
      toast.error(t('errors.startPeriodGreater'));
      return;
    }

    if (reason && reason.length > 500) {
      toast.error(t('errors.reasonMaxLength'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<UpdateScheduleChangePayload> = {};
      
      if (makeupWeek !== null && makeupWeek !== undefined) {
        payload.makeupWeek = makeupWeek;
      }
      
      if (makeupDate) {
        payload.makeupDate = format(makeupDate, 'yyyy-MM-dd');
      }
      
      if (selectedRoomId) {
        payload.makeupRoomId = selectedRoomId;
      }
      
      if (startPeriod > 0) {
        payload.startPeriod = startPeriod;
      }
      
      if (endPeriod > 0) {
        payload.endPeriod = endPeriod;
      }
      
      if (reason !== undefined) {
        payload.reason = reason.trim() || null;
      }

      const response = await scheduleChangeApi.update(request.requestId, payload);

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
  const canEdit = request.status === 'pending' || request.status === 'approved';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const periodOptions = CLASS_PERIODS.map((p) => ({
    value: p.period.toString(),
    label: `${tSchedule('grid.period', { period: p.period })} (${p.startTime} - ${p.endTime})`,
  }));

  if (!canEdit) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('cannotEdit')}</h2>
            <p className="text-gray-600 mb-6">
              {t('cannotEditDesc')}
            </p>
            <Button
              type="button"
              onClick={onClose}
              className="w-full bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {t('close')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Chỉnh sửa thông tin dạy bù */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('makeupInfo')}</h3>

            {/* Tuần dạy bù */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('makeupWeek')}
              </label>
              <Input
                type="number"
                min="1"
                value={makeupWeek ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setMakeupWeek(value === '' ? null : parseInt(value, 10));
                }}
                placeholder={t('makeupWeekPlaceholder')}
              />
            </div>

            {/* Ngày dạy bù */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('makeupDate')}
              </label>
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
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('startPeriod')}
                </label>
                <Dropdown
                  options={periodOptions}
                  value={startPeriod > 0 ? startPeriod.toString() : ''}
                  placeholder={t('startPeriodPlaceholder')}
                  onChange={(value) => {
                    setStartPeriod(Number.parseInt(value));
                    if (endPeriod < Number.parseInt(value)) {
                      setEndPeriod(Number.parseInt(value));
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('endPeriod')}
                </label>
                <Dropdown
                  options={periodOptions.filter((p) => Number.parseInt(p.value) >= startPeriod)}
                  value={endPeriod > 0 ? endPeriod.toString() : ''}
                  placeholder={t('endPeriodPlaceholder')}
                  onChange={(value) => setEndPeriod(Number.parseInt(value))}
                />
              </div>
            </div>

            {/* Chọn phòng học */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('room')}
              </label>
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
                  options={availableRooms.map((room) => ({
                    value: room.roomId,
                    label: `${room.roomName} (${t('roomCapacity')} ${room.capacity})`,
                  }))}
                  value={selectedRoomId}
                  placeholder={t('roomPlaceholder')}
                  onChange={(value) => {
                    selectedRoomIdRef.current = value;
                    setSelectedRoomId(value);
                  }}
                />
              )}
            </div>

            {/* Lý do */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('reason')}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('reasonPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053AD] focus:border-[#0053AD] resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('characters', { count: reason.length })}
              </p>
            </div>
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
            disabled={isSubmitting}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};