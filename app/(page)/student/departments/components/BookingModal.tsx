'use client';

import { useState } from 'react';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { useCreateBooking } from '../lib/hooks/useRoomBooking';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { DayPicker } from 'react-day-picker';
import { Users, MapPin, Monitor, X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import 'react-day-picker/dist/style.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Khung giờ tiết học chuẩn
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

// Tạo các options cho thời gian bắt đầu (lọc theo ngày được chọn)
const generateTimeOptions = (selectedDate?: Date) => {
  if (!selectedDate) return [];
  
  const now = new Date();
  const isToday = 
    selectedDate.getDate() === now.getDate() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getFullYear() === now.getFullYear();
  
  // Nếu là ngày hôm nay, chỉ hiển thị các tiết học sau thời điểm hiện tại
  if (isToday) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    return CLASS_PERIODS
      .filter(period => {
        // Parse thời gian bắt đầu của tiết học
        const [startHour, startMinute] = period.startTime.split(':').map(Number);
        const periodStartInMinutes = startHour * 60 + startMinute;
        
        // Chỉ hiển thị các tiết có thời gian bắt đầu sau thời điểm hiện tại
        return periodStartInMinutes > currentTimeInMinutes;
      })
      .map(period => ({
        value: period.startTime,
        label: `${period.label} (${period.startTime})`,
        period: period.period
      }));
  }
  
  // Nếu là ngày trong tương lai, hiển thị tất cả các tiết
  return CLASS_PERIODS.map(period => ({
    value: period.startTime,
    label: `${period.label} (${period.startTime})`,
    period: period.period
  }));
};

const generateEndTimeOptions = (startTime: string) => {
  const startPeriod = CLASS_PERIODS.find(p => p.startTime === startTime);
  if (!startPeriod) return [];
  
  return CLASS_PERIODS
    .filter(p => p.period >= startPeriod.period)
    .map(period => ({
      value: period.endTime,
      label: `${period.label} (${period.endTime})`,
      period: period.period
    }));
};

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const selectedRoom = useRoomBookingStore((state) => state.selectedRoom);
  const createBookingMutation = useCreateBooking();
  
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');

  const handleConfirmBooking = () => {
    if (!selectedRoom || !bookingDate || !startTime || !endTime || !purpose.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate purpose length
    if (purpose.length > 500) {
      toast.error('Mục đích sử dụng không được vượt quá 500 ký tự');
      return;
    }

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Ngày đặt phòng không được trong quá khứ');
      return;
    }

    // Validate time is not in the past if booking today
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

    // Validate max 8 consecutive periods
    const startPeriod = CLASS_PERIODS.find(p => p.startTime === startTime);
    const endPeriod = CLASS_PERIODS.find(p => p.endTime === endTime);
    
    if (startPeriod && endPeriod) {
      const periodCount = endPeriod.period - startPeriod.period + 1;
      if (periodCount > 8) {
        toast.error('Không được đặt quá 8 tiết liên tiếp');
        return;
      }

      // Check if booking spans across lunch break (period 5 to 6)
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
    }, {
      onSuccess: () => {
        toast.success('Đăng ký phòng thành công! Trạng thái: Chờ xác nhận');
        onClose();
        // Reset form
        setBookingDate(undefined);
        setStartTime('');
        setEndTime('');
        setPurpose('');
      },
      onError: (error: Error) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiError = error as any;
        const errorMessage = apiError?.response?.data?.message || error.message || 'Đăng ký phòng thất bại!';
        toast.error(errorMessage);
      }
    });
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    // Reset end time when start time changes
    setEndTime('');
  };

  const handleDateChange = (date: Date | undefined) => {
    setBookingDate(date);
    // Reset time selections when date changes
    setStartTime('');
    setEndTime('');
  };

  if (!isOpen || !selectedRoom) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white';
      case 'inactive':
        return 'bg-gray-500 text-white';
      case 'maintenance':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Ngừng hoạt động';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                      {selectedRoom.amenities.slice(0, 5).map((amenity) => (
                        <Badge key={amenity.amenityId} variant="outline" className="text-xs bg-white text-black border-gray-300">
                          <Monitor className="h-3 w-3 mr-1" />
                          {amenity.amenityName}
                        </Badge>
                      ))}
                      {selectedRoom.amenities.length > 5 && (
                        <Badge variant="outline" className="text-xs bg-white text-black border-gray-300">
                          +{selectedRoom.amenities.length - 5} tiện ích khác
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Badge className={getStatusColor(selectedRoom.roomStatus)}>
                  {getStatusText(selectedRoom.roomStatus)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Booking Date */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ngày sử dụng
            </h3>
            <div className="border rounded-lg p-3 max-w-fit mx-auto">
              <DayPicker
                mode="single"
                selected={bookingDate}
                onSelect={handleDateChange}
                disabled={{ before: new Date() }}
                locale={vi}
                className="mx-auto"
                classNames={{
                  day_selected: 'bg-[#4E8EE1] text-white',
                  day_today: 'bg-[#4E8EE1]/20 text-[#4E8EE1] font-semibold',
                  day_disabled: 'text-gray-300',
                  day: 'hover:bg-gray-100 rounded',
                }}
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời gian bắt đầu
              </h3>
              <select
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] bg-white"
                disabled={!bookingDate}
              >
                <option value="">
                  {!bookingDate 
                    ? 'Vui lòng chọn ngày trước' 
                    : generateTimeOptions(bookingDate).length === 0 
                    ? 'Không có thời gian khả dụng cho hôm nay'
                    : 'Chọn thời gian bắt đầu'}
                </option>
                {bookingDate && generateTimeOptions(bookingDate).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {bookingDate && generateTimeOptions(bookingDate).length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ Không còn khung giờ khả dụng cho hôm nay. Vui lòng chọn ngày khác.
                </p>
              )}
            </div>

            {/* End Time */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời gian kết thúc
              </h3>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] bg-white"
                disabled={!startTime}
              >
                <option value="">Chọn thời gian kết thúc</option>
                {startTime && generateEndTimeOptions(startTime).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
