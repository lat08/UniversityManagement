'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/app/components/ui/button';
import { Dropdown } from '@/app/components/ui';
import { X, Calendar } from 'lucide-react';
import { format, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import toast from 'react-hot-toast';
import { useCreateScheduleChange, useMakeupSlotSuggestions } from '../lib/hooks/useScheduleChange';
import { useBuildings } from '@/lib/hooks/useCommonData';
import { ROOM_TYPE_LABELS } from '@/app/(page)/student/departments/lib/types/room.types';
import 'react-day-picker/dist/style.css';

interface Week {
  weekNumber: number;
  startDate: string;
  endDate: string;
}

interface ScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseClassId: string;
  currentWeek: number;
  subjectName: string;
  subjectCode: string;
  weeks: Week[];
}

const createRoomTypeOptions = (labels: Record<string, string>) => [
  { value: '', label: 'Tất cả' },
  ...Object.entries(labels).map(([key, label]) => ({ value: key, label }))
];

export const ScheduleChangeModal = ({
  isOpen,
  onClose,
  courseClassId,
  currentWeek,
  subjectName,
  subjectCode,
  weeks,
}: ScheduleChangeModalProps) => {
  const createMutation = useCreateScheduleChange();
  const { data: buildings } = useBuildings();
  
  const [makeupDate, setMakeupDate] = useState<Date | undefined>(undefined);
  const [dateInputValue, setDateInputValue] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  
  const calendarRef = useRef<HTMLDivElement>(null);

  const makeupWeek = useMemo(() => {
    if (!makeupDate || weeks.length === 0) return undefined;
    
    const selectedDateStr = format(makeupDate, 'yyyy-MM-dd');
    const selectedDateTime = new Date(selectedDateStr).getTime();
    
    const matchingWeek = weeks.find(week => {
      const weekStart = new Date(week.startDate).getTime();
      const weekEnd = new Date(week.endDate).getTime();
      return selectedDateTime >= weekStart && selectedDateTime <= weekEnd;
    });
    
    return matchingWeek?.weekNumber;
  }, [makeupDate, weeks]);

  const suggestionsEnabled = Boolean(
    makeupDate && 
    makeupWeek && 
    makeupWeek !== currentWeek
  );

  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useMakeupSlotSuggestions(
    suggestionsEnabled
      ? {
          courseClassId,
          cancelledWeek: currentWeek,
          makeupWeek: makeupWeek!,
          preferredBuildingId: selectedBuilding || undefined,
          preferredRoomType: selectedRoomType || undefined,
        }
      : null,
    suggestionsEnabled
  );

  const suggestions = useMemo(() => suggestionsData?.data?.suggestions || [], [suggestionsData?.data?.suggestions]);

  const buildingOptions = useMemo(() => [
    { value: '', label: 'Tất cả' },
    ...(buildings?.map(b => ({ 
      value: b.buildingId, 
      label: `${b.buildingName} (${b.buildingCode})` 
    })) || [])
  ], [buildings]);

  const roomTypeOptions = useMemo(() => createRoomTypeOptions(ROOM_TYPE_LABELS), []);

  const slotOptions = useMemo(() => {
    return suggestions.map((slot) => ({
      value: slot.roomId,
      label: `${slot.dayOfWeekText}, tiết ${slot.startPeriod} - ${slot.endPeriod}, phòng ${slot.roomCode} (${slot.buildingName})`,
      data: slot,
    }));
  }, [suggestions]);

  const selectedSlotData = useMemo(() => {
    const option = slotOptions.find((opt) => opt.value === selectedSlot);
    return option?.data;
  }, [selectedSlot, slotOptions]);

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

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);
    
    if (value.length === 10) {
      try {
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        if (!isNaN(parsedDate.getTime())) {
          setMakeupDate(parsedDate);
          setSelectedSlot('');
        }
      } catch {
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setMakeupDate(date);
      setDateInputValue(format(date, 'dd/MM/yyyy'));
      setShowCalendar(false);
      setSelectedSlot('');
    }
  };

  const handleSubmit = () => {
    if (!makeupDate) {
      toast.error('Vui lòng chọn ngày mới');
      return;
    }

    if (!makeupWeek) {
      toast.error('Không thể xác định tuần học bù');
      return;
    }

    if (!selectedSlot || !selectedSlotData) {
      toast.error('Vui lòng chọn giờ trống');
      return;
    }

    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do đổi lịch');
      return;
    }

    if (reason.length > 500) {
      toast.error('Lý do không được vượt quá 500 ký tự');
      return;
    }

    const payload = {
      courseClassId,
      cancelledWeek: currentWeek,
      makeupWeek,
      makeupDate: selectedSlotData.date,
      makeupRoomId: selectedSlotData.roomId,
      dayOfWeek: selectedSlotData.dayOfWeek,
      startPeriod: selectedSlotData.startPeriod,
      endPeriod: selectedSlotData.endPeriod,
      reason: reason.trim(),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Yêu cầu thay đổi lịch đã được tạo thành công');
        onClose();
        setMakeupDate(undefined);
        setDateInputValue('');
        setSelectedBuilding('');
        setSelectedRoomType('');
        setSelectedSlot('');
        setReason('');
      },
      onError: (error: Error) => {
        const apiError = error as { response?: { data?: { message?: string } } };
        const errorMessage = apiError?.response?.data?.message || error.message || 'Tạo yêu cầu thất bại';
        toast.error(errorMessage);
      },
    });
  };

  if (!isOpen) return null;

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
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Đề xuất đổi lịch dạy</h2>
              <p className="text-sm text-gray-600 mt-1">
                Môn: {subjectName} ({subjectCode})
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
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-red-500">*</span>
              Chọn ngày mới
            </h3>
            <div className="relative">
              <input
                type="text"
                value={dateInputValue}
                onChange={(e) => handleDateInputChange(e.target.value)}
                onFocus={() => setShowCalendar(true)}
                placeholder="dd/mm/yyyy"
                maxLength={10}
                className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] bg-white"
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
                  selected={makeupDate}
                  onSelect={handleCalendarSelect}
                  disabled={{ before: new Date() }}
                  locale={vi}
                  classNames={{
                    day_selected: 'bg-[#4E8EE1] text-white',
                    day_today: 'bg-[#4E8EE1]/20 text-[#4E8EE1] font-semibold',
                    day_disabled: 'text-gray-300',
                    day: 'hover:bg-gray-100 rounded',
                  }}
                />
              </div>
            )}
            
            {makeupDate && makeupWeek && (
              <p className="text-sm text-gray-600 mt-2">
                Ngày đã chọn: {format(makeupDate, 'EEEE, dd/MM/yyyy', { locale: vi })} (Tuần {makeupWeek})
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Cơ sở (tùy chọn)</h3>
              <Dropdown
                options={buildingOptions}
                value={selectedBuilding}
                placeholder="Tất cả"
                onChange={(value) => {
                  setSelectedBuilding(value);
                  setSelectedSlot('');
                }}
                disabled={!makeupDate}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Loại phòng (tùy chọn)</h3>
              <Dropdown
                options={roomTypeOptions}
                value={selectedRoomType}
                placeholder="Tất cả"
                onChange={(value) => {
                  setSelectedRoomType(value);
                  setSelectedSlot('');
                }}
                disabled={!makeupDate}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-red-500">*</span>
              Chọn giờ trống
            </h3>
             <Dropdown
               options={slotOptions}
               value={selectedSlot}
               placeholder={
                 !makeupDate
                   ? 'Chọn ngày trước'
                   : isLoadingSuggestions
                   ? 'Đang tải gợi ý...'
                   : slotOptions.length === 0
                   ? 'Không có giờ trống khả dụng'
                   : 'Chọn giờ trống'
               }
               onChange={setSelectedSlot}
               disabled={!makeupDate || isLoadingSuggestions}
             />
           </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-red-500">*</span>
                Lý do đổi lịch
              </h3>
              <span className="text-sm text-gray-500">{reason.length} / 500</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] min-h-[100px] resize-none"
              placeholder="Lý do đề xuất thay đổi..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#4E8EE1] bg-white text-[#4E8EE1] hover:bg-[#4E8EE1]/10 hover:border-[#4E8EE1]/80 transition-colors"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="flex-1 bg-[#4E8EE1] hover:bg-[#4E8EE1]/80 text-white border-[#4E8EE1] hover:border-[#4E8EE1]/80 transition-colors cursor-pointer"
            >
              {createMutation.isPending ? 'Đang gửi...' : 'Gửi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

