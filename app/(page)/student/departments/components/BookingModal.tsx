'use client';

import { useState, useRef, useEffect } from 'react';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { useCreateBooking } from '../lib/hooks/useRoomBooking';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { Users, MapPin, X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Dropdown } from '@/app/components/ui';
import { format, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import toast from 'react-hot-toast';
import { getRoomAvailability } from '../lib/api/rooms.api';
import { commonApi } from '@/lib/api/common';
import type { Semester } from '@/lib/types/common';
import { 
  ROOM_STATUS_LABELS, 
  ROOM_STATUS_COLORS,
  BUSY_SLOT_TYPE_LABELS,
  BUSY_SLOT_TYPE_COLORS,
  type RoomAvailability 
} from '../lib/types/room.types';
import 'react-day-picker/dist/style.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLASS_PERIODS = [
  { period: 1, startTime: '07:15', endTime: '08:05', label: 'Tiết 1' },
  { period: 2, startTime: '08:10', endTime: '09:00', label: 'Tiết 2' },
  { period: 3, startTime: '09:10', endTime: '10:00', label: 'Tiết 3' },
  { period: 4, startTime: '10:05', endTime: '10:55', label: 'Tiết 4' },
  { period: 5, startTime: '11:00', endTime: '11:50', label: 'Tiết 5' },
  { period: 6, startTime: '13:30', endTime: '14:20', label: 'Tiết 6' },
  { period: 7, startTime: '14:25', endTime: '15:15', label: 'Tiết 7' },
  { period: 8, startTime: '15:20', endTime: '16:10', label: 'Tiết 8' },
  { period: 9, startTime: '16:15', endTime: '17:05', label: 'Tiết 9' },
  { period: 10, startTime: '17:10', endTime: '18:00', label: 'Tiết 10' },
  { period: 11, startTime: '18:05', endTime: '18:55', label: 'Tiết 11' },
  { period: 12, startTime: '19:00', endTime: '19:50', label: 'Tiết 12' },
  { period: 13, startTime: '19:55', endTime: '20:45', label: 'Tiết 13' },
];

// Không còn dùng generateTimeOptions cũ nữa
// Sẽ generate từ availability data

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
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
            toast.error('Không tìm thấy học kỳ hiện tại. Vui lòng liên hệ quản trị viên.');
          }
        }
      } catch (error) {
        console.error('Error loading semester:', error);
        toast.error('Không thể tải thông tin học kỳ');
      } finally {
        setLoadingSemester(false);
      }
    };

    if (isOpen) {
      loadCurrentSemester();
    }
  }, [isOpen]);

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
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (purpose.length > 500) {
      toast.error('Mục đích sử dụng không được vượt quá 500 ký tự');
      return;
    }

    if (studentCount < 1) {
      toast.error('Số lượng người tham gia phải lớn hơn 0');
      return;
    }

    if (studentCount > selectedRoom.capacity) {
      toast.error(`Số lượng người tham gia không được vượt quá sức chứa của phòng (${selectedRoom.capacity} người)`);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Ngày đặt phòng không được trong quá khứ');
      return;
    }

    // Kiểm tra ngày đặt phòng phải trong khoảng thời gian học kỳ hiện tại
    if (currentSemester) {
      const semesterStartDate = new Date(currentSemester.startDate);
      const semesterEndDate = new Date(currentSemester.endDate);
      semesterStartDate.setHours(0, 0, 0, 0);
      semesterEndDate.setHours(23, 59, 59, 999);
      
      if (selectedDate < semesterStartDate || selectedDate > semesterEndDate) {
        toast.error(`Ngày đặt phòng phải trong khoảng thời gian học kỳ hiện tại (${format(semesterStartDate, 'dd/MM/yyyy')} - ${format(semesterEndDate, 'dd/MM/yyyy')})`);
        return;
      }
    } else if (!loadingSemester) {
      toast.error('Không thể xác định học kỳ hiện tại. Vui lòng thử lại sau.');
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
        toast.error('Không thể đặt phòng cho thời gian trong quá khứ');
        return;
      }
    }

    const startPeriod = CLASS_PERIODS.find(p => p.startTime === startTime);
    const endPeriod = CLASS_PERIODS.find(p => p.endTime === endTime);
    
    if (startPeriod && endPeriod) {
      const periodCount = endPeriod.period - startPeriod.period + 1;
      if (periodCount > 8) {
        toast.error('Không được đặt quá 8 tiết liên tiếp');
        return;
      }

      if (startPeriod.period <= 5 && endPeriod.period >= 6 && periodCount > 1) {
        toast.error('Không được đặt xuyên qua giờ nghỉ trưa (tiết 5 → tiết 6)');
        return;
      }
    }

    createBookingMutation.mutate({
      roomId: selectedRoom.roomId,
      bookingDate: format(bookingDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      startTime,
      endTime,
      purpose: purpose.trim(),
      studentCount,
    }, {
      onSuccess: () => {
        toast.success('Đăng ký phòng thành công! Trạng thái: Chờ xác nhận');
        onClose();
      },
      onError: (error: unknown) => {
        const apiError = error as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = apiError?.response?.data?.message || apiError?.message || 'Đăng ký phòng thất bại!';
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
            toast.error(response.message || 'Không thể tải thông tin phòng trống');
          }
        } catch (error) {
          setAvailability(null);
          const apiError = error as { response?: { data?: { message?: string } } };
          const errorMessage = apiError?.response?.data?.message || 'Không thể tải thông tin phòng trống';
          toast.error(errorMessage);
        } finally {
          setLoadingAvailability(false);
        }
      };
      loadAvailability();
    } else {
      setAvailability(null);
    }
  }, [bookingDate, selectedRoom]);

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
              label: `${classPeriod.label} (${classPeriod.startTime})`,
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
          label: `${classPeriod.label} (${classPeriod.endTime})`,
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
              <h2 className="text-2xl font-bold text-gray-900">Đăng ký phòng chức năng</h2>
              <p className="text-sm text-gray-600 mt-1">
                Điền thông tin để hoàn tất đăng ký phòng {selectedRoom.roomName}
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
                  {ROOM_STATUS_LABELS[selectedRoom.roomStatus] || 'Không xác định'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Booking Date */}
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ngày sử dụng
              </h3>
              {currentSemester && (
                <span className="text-xs text-gray-500">
                  Học kỳ: {currentSemester.semesterName}
                </span>
              )}
            </div>
            {loadingSemester && (
              <p className="text-sm text-amber-600 mb-2">
                Đang tải thông tin học kỳ...
              </p>
            )}
            {!loadingSemester && !currentSemester && (
              <p className="text-sm text-red-600 mb-2">
                ⚠️ Không tìm thấy học kỳ hiện tại. Vui lòng liên hệ quản trị viên.
              </p>
            )}
            {currentSemester && (
              <p className="text-sm text-gray-600 mb-2">
                Chỉ có thể đặt phòng trong khoảng: {format(new Date(currentSemester.startDate), 'dd/MM/yyyy')} - {format(new Date(currentSemester.endDate), 'dd/MM/yyyy')}
              </p>
            )}
            <div className="relative">
              <input
                type="text"
                value={dateInputValue}
                onChange={(e) => handleDateInputChange(e.target.value)}
                onFocus={() => setShowCalendar(true)}
                placeholder={loadingSemester ? "Đang tải..." : !currentSemester ? "Không có học kỳ" : "dd/mm/yyyy"}
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
            
            {bookingDate && (
              <p className="text-sm text-gray-600 mt-2">
                Ngày đã chọn: {format(bookingDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
              </p>
            )}
          </div>

          {/* Student Count */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Số lượng người tham gia
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
              placeholder="Nhập số lượng người tham gia"
            />
            <p className="text-sm text-gray-500 mt-2">
              Sức chứa tối đa: {selectedRoom?.capacity || 0} người
            </p>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời gian bắt đầu
              </h3>
              <Dropdown
                options={getStartTimeOptions()}
                value={startTime}
                placeholder={
                  !bookingDate
                    ? 'Vui lòng chọn ngày trước'
                    : loadingAvailability
                    ? 'Đang tải...'
                    : getStartTimeOptions().length === 0
                    ? 'Không có khung giờ trống'
                    : 'Chọn thời gian bắt đầu'
                }
                onChange={(value) => {
                  setStartTime(value);
                  setEndTime('');
                }}
                disabled={!bookingDate || loadingAvailability || getStartTimeOptions().length === 0}
              />
              {bookingDate && !loadingAvailability && getStartTimeOptions().length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ Không còn khung giờ trống. Vui lòng chọn ngày khác.
                </p>
              )}
            </div>

            {/* End Time */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời gian kết thúc
              </h3>
              <Dropdown
                options={getEndTimeOptions()}
                value={endTime}
                placeholder="Chọn thời gian kết thúc"
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
                  <h4 className="font-semibold text-amber-900 mb-2">Các khung giờ đã bận:</h4>
                  <div className="space-y-1.5">
                    {availability.busySlots.map((slot, index) => (
                      <div key={index} className="text-sm">
                        <Badge className={BUSY_SLOT_TYPE_COLORS[slot.type] || 'bg-gray-100 text-gray-800'}>
                          {BUSY_SLOT_TYPE_LABELS[slot.type] || slot.type}
                        </Badge>
                        <span className="text-amber-800 ml-2">
                          {slot.startTime} - {slot.endTime}
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
              <h3 className="font-semibold">Mục đích sử dụng</h3>
              <span className="text-sm text-gray-500">{purpose.length} / 500</span>
            </div>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              maxLength={500}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] min-h-[100px] resize-none"
              placeholder="Nhập mục đích sử dụng phòng (tối đa 500 ký tự)"
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
              Hủy
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={createBookingMutation.isPending}
              className="flex-1 bg-[#4E8EE1] hover:bg-[#4E8EE1]/80 text-white border-[#4E8EE1] hover:border-[#4E8EE1]/80 transition-colors cursor-pointer"
            >
              {createBookingMutation.isPending ? 'Đang đăng ký...' : 'Xác nhận đăng ký'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
