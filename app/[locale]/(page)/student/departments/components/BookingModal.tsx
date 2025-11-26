'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format, parse } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import toast from 'react-hot-toast';
import { Users, MapPin, X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { useCreateBooking } from '../lib/hooks/useRoomBooking';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dropdown } from '@/app/components/ui';
import { getRoomAvailability } from '../lib/api/rooms.api';
import { commonApi } from '@/lib/api/common';
import type { Semester } from '@/lib/types/common';
import {
  ROOM_STATUS_COLORS,
  BUSY_SLOT_TYPE_COLORS,
  type RoomAvailability,
} from '@/lib/types/room';
import 'react-day-picker/dist/style.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLASS_PERIODS = [
  { period: 1, startTime: '07:15', endTime: '08:05' },
  { period: 2, startTime: '08:10', endTime: '09:00' },
  { period: 3, startTime: '09:10', endTime: '10:00' },
  { period: 4, startTime: '10:05', endTime: '10:55' },
  { period: 5, startTime: '11:00', endTime: '11:50' },
  { period: 6, startTime: '13:30', endTime: '14:20' },
  { period: 7, startTime: '14:25', endTime: '15:15' },
  { period: 8, startTime: '15:20', endTime: '16:10' },
  { period: 9, startTime: '16:15', endTime: '17:05' },
  { period: 10, startTime: '17:10', endTime: '18:00' },
  { period: 11, startTime: '18:05', endTime: '18:55' },
  { period: 12, startTime: '19:00', endTime: '19:50' },
  { period: 13, startTime: '19:55', endTime: '20:45' },
] as const;

// Không còn dùng generateTimeOptions cũ nữa
// Sẽ generate từ availability data

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const t = useTranslations('student.departments');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  const selectedRoom = useRoomBookingStore((state) => state.selectedRoom);
  const createBookingMutation = useCreateBooking();
  
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [dateInputValue, setDateInputValue] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [studentCount, setStudentCount] = useState<number>(1);
  const [availability, setAvailability] = useState<RoomAvailability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [loadingSemester, setLoadingSemester] = useState<boolean>(true);
  
  const calendarRef = useRef<HTMLDivElement>(null);

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
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Load current semester on mount
  useEffect(() => {
    const loadCurrentSemester = async () => {
      setLoadingSemester(true);
      try {
        const response = await commonApi.getSemesters();
        if (response.success && response.data) {
          const now = new Date();
          // Tìm học kỳ hiện tại (ngày hiện tại nằm trong khoảng startDate và endDate)
          const activeSemester = response.data.find(semester => {
            if (!semester.startDate || !semester.endDate) return false;
            const startDate = new Date(semester.startDate);
            const endDate = new Date(semester.endDate);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            return now >= startDate && now <= endDate;
          });
          
          if (activeSemester) {
            setCurrentSemester(activeSemester);
          } else {
            toast.error(t('modal.semester.missing'));
          }
        }
      } catch (error) {
        console.error('Error loading semester:', error);
        toast.error(t('validation.semesterMissing'));
      } finally {
        setLoadingSemester(false);
      }
    };

    if (isOpen) {
      loadCurrentSemester();
    }
  }, [isOpen, t]);

  useEffect(() => {
    if (!isOpen) {
      setBookingDate(undefined);
      setDateInputValue('');
      setStartTime('');
      setEndTime('');
      setPurpose('');
      setStudentCount(1);
      setAvailability(null);
      setLoadingAvailability(false);
    }
  }, [isOpen]);

  const handleConfirmBooking = () => {
    if (!selectedRoom || !bookingDate || !startTime || !endTime || !purpose.trim() || !studentCount) {
      toast.error(t('validation.missingFields'));
      return;
    }

    if (purpose.length > 500) {
      toast.error(t('validation.purposeMax'));
      return;
    }

    if (studentCount < 1) {
      toast.error(t('validation.studentCountMin'));
      return;
    }

    if (studentCount > selectedRoom.capacity) {
      toast.error(t('validation.studentCountMax', { capacity: selectedRoom.capacity }));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error(t('validation.dateInPast'));
      return;
    }

    if (currentSemester) {
      const semesterStartDate = new Date(currentSemester.startDate);
      const semesterEndDate = new Date(currentSemester.endDate);
      semesterStartDate.setHours(0, 0, 0, 0);
      semesterEndDate.setHours(23, 59, 59, 999);
      
      if (selectedDate < semesterStartDate || selectedDate > semesterEndDate) {
        toast.error(
          t('validation.outsideSemester', {
            start: format(semesterStartDate, 'dd/MM/yyyy'),
            end: format(semesterEndDate, 'dd/MM/yyyy'),
          }),
        );
        return;
      }
    } else if (!loadingSemester) {
      toast.error(t('validation.semesterMissing'));
      return;
    }

    const now = new Date();
    const isToday = 
      bookingDate.getDate() === now.getDate() &&
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear();
    
    if (isToday) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const bookingStartTime = new Date(bookingDate);
      bookingStartTime.setHours(startHour, startMinute, 0, 0);
      
      if (bookingStartTime <= now) {
        toast.error(t('validation.startTimePast'));
        return;
      }
    }

    const startPeriod = CLASS_PERIODS.find(p => p.startTime === startTime);
    const endPeriod = CLASS_PERIODS.find(p => p.endTime === endTime);
    
    if (startPeriod && endPeriod) {
      const periodCount = endPeriod.period - startPeriod.period + 1;
      if (periodCount > 8) {
        toast.error(t('validation.tooManyPeriods'));
        return;
      }

      if (startPeriod.period <= 5 && endPeriod.period >= 6 && periodCount > 1) {
        toast.error(t('validation.crossLunch'));
        return;
      }
    }

    // Format date as ISO string for backend (backend only uses date part)
    const bookingDateStr = format(bookingDate, "yyyy-MM-dd") + "T00:00:00";
    
    createBookingMutation.mutate({
      roomId: selectedRoom.roomId,
      bookingDate: bookingDateStr,
      startTime,
      endTime,
      purpose: purpose.trim(),
      studentCount,
    }, {
      onSuccess: () => {
        toast.success(t('toast.bookingSuccess'));
        onClose();
      },
      onError: (error: unknown) => {
        const apiError = error as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = apiError?.response?.data?.message || apiError?.message || t('toast.bookingError');
        toast.error(errorMessage);
      }
    });
  };


  useEffect(() => {
    if (bookingDate && selectedRoom) {
      const loadAvailability = async () => {
        setLoadingAvailability(true);
        setStartTime('');
        setEndTime('');
        try {
          const dateStr = format(bookingDate, 'yyyy-MM-dd');
          const response = await getRoomAvailability(selectedRoom.roomId, dateStr);
          
          if (response.success && response.data) {
            setAvailability(response.data);
          } else {
            setAvailability(null);
            toast.error(response.message || t('toast.bookingError'));
          }
        } catch (error) {
          setAvailability(null);
          const apiError = error as { response?: { data?: { message?: string } } };
          const errorMessage = apiError?.response?.data?.message || t('toast.bookingError');
          toast.error(errorMessage);
        } finally {
          setLoadingAvailability(false);
        }
      };
      loadAvailability();
    } else {
      setAvailability(null);
    }
  }, [bookingDate, selectedRoom, t]);

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);
    
    if (value.length === 10) {
      try {
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        if (!isNaN(parsedDate.getTime())) {
          setBookingDate(parsedDate);
          setStartTime('');
          setEndTime('');
        }
      } catch {
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setBookingDate(date);
      setDateInputValue(format(date, 'dd/MM/yyyy'));
      setShowCalendar(false);
      setStartTime('');
      setEndTime('');
    }
  };

  // Generate start time options from available slots
  const getStartTimeOptions = () => {
    if (!availability || !availability.availableSlots || availability.availableSlots.length === 0) {
      return [];
    }

    const options: Array<{ value: string; label: string; period: number }> = [];
    
    for (const slot of availability.availableSlots) {
      // Tìm period tương ứng
      const startPeriod = CLASS_PERIODS.find(p => p.startTime === slot.startTime);
      const endPeriod = CLASS_PERIODS.find(p => p.endTime === slot.endTime);
      
      if (startPeriod && endPeriod) {
        // Thêm tất cả các tiết bắt đầu có thể trong slot này
        for (let period = startPeriod.period; period <= endPeriod.period; period++) {
          const classPeriod = CLASS_PERIODS.find(p => p.period === period);
          if (classPeriod) {
            options.push({
              value: classPeriod.startTime,
              label: `${t('modal.periodLabel', { period: classPeriod.period })} (${classPeriod.startTime})`,
              period: classPeriod.period
            });
          }
        }
      }
    }

    // Remove duplicates
    const uniqueOptions = Array.from(
      new Map(options.map(opt => [opt.value, opt])).values()
    );

    return uniqueOptions.sort((a, b) => a.period - b.period);
  };

  // Generate end time options based on selected start time and available slots
  const getEndTimeOptions = () => {
    if (!availability || !startTime) {
      return [];
    }

    const startPeriod = CLASS_PERIODS.find(p => p.startTime === startTime);
    if (!startPeriod) return [];

    const options: Array<{ value: string; label: string; period: number }> = [];

    // Tìm slot chứa start time
    const containingSlot = availability.availableSlots.find(slot => {
      const slotStartPeriod = CLASS_PERIODS.find(p => p.startTime === slot.startTime)?.period || 0;
      const slotEndPeriod = CLASS_PERIODS.find(p => p.endTime === slot.endTime)?.period || 0;
      return startPeriod.period >= slotStartPeriod && startPeriod.period <= slotEndPeriod;
    });

    if (!containingSlot) return [];

    const slotEndPeriod = CLASS_PERIODS.find(p => p.endTime === containingSlot.endTime);
    if (!slotEndPeriod) return [];

    // Thêm các tiết kết thúc có thể từ start period đến cuối slot
    for (let period = startPeriod.period; period <= slotEndPeriod.period; period++) {
      const classPeriod = CLASS_PERIODS.find(p => p.period === period);
      if (classPeriod) {
        options.push({
          value: classPeriod.endTime,
          label: `${t('modal.periodLabel', { period: classPeriod.period })} (${classPeriod.endTime})`,
          period: classPeriod.period
        });
      }
    }

    return options.sort((a, b) => a.period - b.period);
  };

  if (!isOpen || !selectedRoom) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('modal.title')}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('modal.subtitle', { room: selectedRoom.roomName })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Room Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedRoom.roomName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedRoom.capacity} người</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedRoom.building.buildingName}</span>
                    </div>
                  </div>
                  {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedRoom.amenities.map((amenity) => (
                        <Badge key={amenity.amenityId} variant="outline" className="text-xs bg-white text-black border-gray-300">
                          {amenity.amenityName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge className={ROOM_STATUS_COLORS[selectedRoom.roomStatus] || 'bg-gray-100 text-gray-800'}>
                  {ROOM_STATUS_COLORS[selectedRoom.roomStatus] ? t(`roomStatuses.${selectedRoom.roomStatus}`) : t('modal.statusBadgeFallback')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Booking Date */}
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('modal.date.label')}
              </h3>
              {currentSemester && (
                <span className="text-xs text-gray-500">
                  {t('modal.semester.label')}: {currentSemester.semesterName}
                </span>
              )}
            </div>
            {loadingSemester && (
              <p className="text-sm text-amber-600 mb-2">{t('modal.semester.loading')}</p>
            )}
            {!loadingSemester && !currentSemester && (
              <p className="text-sm text-red-600 mb-2">⚠️ {t('modal.semester.missing')}</p>
            )}
            {currentSemester && (
              <p className="text-sm text-gray-600 mb-2">
                {t('modal.semester.range', {
                  start: format(new Date(currentSemester.startDate), 'dd/MM/yyyy'),
                  end: format(new Date(currentSemester.endDate), 'dd/MM/yyyy'),
                })}
              </p>
            )}
            <div className="relative">
              <input
                type="text"
                value={dateInputValue}
                onChange={(e) => handleDateInputChange(e.target.value)}
                onFocus={() => setShowCalendar(true)}
                placeholder={
                  loadingSemester ? t('modal.semester.loading') : !currentSemester ? t('modal.semester.missing') : t('modal.date.placeholder')
                }
                maxLength={10}
                disabled={loadingSemester || !currentSemester}
                className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                onKeyDown={(e) => {
                  if (!/[0-9/]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                    e.preventDefault();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Calendar className="h-5 w-5" />
              </button>
            </div>
            
            {showCalendar && (
              <div 
                ref={calendarRef}
                className="absolute z-10 mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
              >
                <DayPicker
                  mode="single"
                  selected={bookingDate}
                  onSelect={handleCalendarSelect}
                  disabled={{
                    before: new Date(),
                    after: currentSemester ? new Date(currentSemester.endDate) : undefined,
                  }}
                  locale={dateLocale}
                  classNames={{
                    day_selected: 'bg-[#4E8EE1] text-white',
                    day_today: 'bg-[#4E8EE1]/20 text-[#4E8EE1] font-semibold',
                    day_disabled: 'text-gray-300',
                    day: 'hover:bg-gray-100 rounded',
                  }}
                />
              </div>
            )}
            
            {bookingDate && (
              <p className="text-sm text-gray-600 mt-2">
                {t('modal.date.selected', { date: format(bookingDate, 'EEEE, dd/MM/yyyy', { locale: dateLocale }) })}
              </p>
            )}
          </div>

          {/* Student Count */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('modal.studentCount.label')}
            </h3>
            <input
              type="number"
              value={studentCount}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value) || 1;
                setStudentCount(Math.max(1, Math.min(value, selectedRoom?.capacity || 1000)));
              }}
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              min={1}
              max={selectedRoom?.capacity || 1000}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1]"
              placeholder={t('modal.studentCount.placeholder')}
            />
            <p className="text-sm text-gray-500 mt-2">
              {t('modal.studentCount.helper', { capacity: selectedRoom?.capacity || 0 })}
            </p>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('modal.startTime.label')}
              </h3>
              <Dropdown
                options={getStartTimeOptions()}
                value={startTime}
                placeholder={
                  !bookingDate
                    ? t('modal.startTime.placeholderSelectDate')
                    : loadingAvailability
                    ? t('modal.startTime.loading')
                    : getStartTimeOptions().length === 0
                    ? t('modal.startTime.noSlots')
                    : t('modal.startTime.default')
                }
                onChange={(value) => {
                  setStartTime(value);
                  setEndTime('');
                }}
                disabled={!bookingDate || loadingAvailability || getStartTimeOptions().length === 0}
              />
              {bookingDate && !loadingAvailability && getStartTimeOptions().length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  {t('modal.startTime.noSlotsHint')}
                </p>
              )}
            </div>

            {/* End Time */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('modal.endTime.label')}
              </h3>
              <Dropdown
                options={getEndTimeOptions()}
                value={endTime}
                placeholder={t('modal.endTime.placeholder')}
                onChange={(value) => setEndTime(value)}
                disabled={!startTime}
              />
            </div>
          </div>

          {/* Busy Slots Info */}
          {availability && availability.busySlots && availability.busySlots.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-2">{t('modal.busySlots.title')}</h4>
                  <div className="space-y-1.5">
                    {availability.busySlots.map((slot, index) => (
                      <div key={index} className="text-sm">
                        <Badge className={BUSY_SLOT_TYPE_COLORS[slot.type] || 'bg-gray-100 text-gray-800'}>
                          {t(`busySlotTypes.${slot.type}`)}
                        </Badge>
                        <span className="text-amber-800 ml-2">
                          {t('modal.busySlots.range', { start: slot.startTime, end: slot.endTime })}
                        </span>
                        {slot.description && (
                          <span className="text-amber-700 ml-2">({slot.description})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Purpose */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{t('modal.purpose.label')}</h3>
              <span className="text-sm text-gray-500">{t('modal.purpose.counter', { length: purpose.length })}</span>
            </div>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              maxLength={500}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] min-h-[100px] resize-none"
              placeholder={t('modal.purpose.placeholder')}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#4E8EE1] bg-white text-[#4E8EE1] hover:bg-[#4E8EE1]/10 hover:border-[#4E8EE1]/80 transition-colors"
            >
              {t('modal.actions.cancel')}
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={createBookingMutation.isPending}
              className="flex-1 bg-[#4E8EE1] hover:bg-[#4E8EE1]/80 text-white border-[#4E8EE1] hover:border-[#4E8EE1]/80 transition-colors cursor-pointer"
            >
              {createBookingMutation.isPending ? t('modal.actions.confirming') : t('modal.actions.confirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
