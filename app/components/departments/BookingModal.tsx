'use client';

import { useState } from 'react';
import { useRoomBookingStore } from '@/lib/store/roomBookingStore';
import { useCreateBooking } from '@/lib/hooks/useRoomBooking';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
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

const timeSlots = [
  { id: 'morning', label: 'Buổi sáng', time: '08:00 - 12:00' },
  { id: 'afternoon', label: 'Buổi chiều', time: '13:00 - 17:00' },
  { id: 'evening', label: 'Buổi tối', time: '18:00 - 21:00' },
];

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const selectedRoom = useRoomBookingStore((state) => state.selectedRoom);
  const selectedDate = useRoomBookingStore((state) => state.selectedDate);
  const selectedTimeSlot = useRoomBookingStore((state) => state.selectedTimeSlot);
  const createBookingMutation = useCreateBooking();
  
  const [studentCount, setStudentCount] = useState<number>(30);
  const [purpose, setPurpose] = useState<string>('Học nhóm môn Lập trình Hướng đối tượng');

  const handleConfirmBooking = () => {
    if (!selectedRoom || !selectedDate || !selectedTimeSlot) {
      toast.error('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
    if (!selectedSlot) return;

    const [startTime, endTime] = selectedSlot.time.split(' - ');

    createBookingMutation.mutate({
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      date: format(new Date(selectedDate), 'yyyy-MM-dd'),
      startTime,
      endTime,
      studentCount,
    }, {
      onSuccess: () => {
        toast.success('Đăng ký phòng thành công!');
        onClose();
      },
      onError: () => {
        toast.error('Đăng ký phòng thất bại!');
      }
    });
  };

  if (!isOpen || !selectedRoom) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-[#4E8EE1] text-white';
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800';
      case 'full':
        return 'bg-[#DEE9FF] text-[#4E8EE1]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'occupied':
        return 'Có sẵn';
      case 'full':
        return 'Đã đặt';
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
                Điền thông tin để hoàn tất đăng ký phòng {selectedRoom.name}
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
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedRoom.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedRoom.capacity} người</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedRoom.location}</span>
                    </div>
                  </div>
                  {selectedRoom.equipment && selectedRoom.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedRoom.equipment.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-white text-black border-gray-300">
                          <Monitor className="h-3 w-3 mr-1" />
                          {item}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge className={getStatusColor(selectedRoom.status)}>
                  {getStatusText(selectedRoom.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Registration Date */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ngày đăng ký
            </h3>
            <div className="border rounded-lg p-3 max-w-fit mx-auto">
              <DayPicker
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
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

          {/* Time Slot and Student Count - Same Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time Slot */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Khung giờ
              </h3>
              <select
                value={selectedTimeSlot || ''}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] bg-white"
                disabled
              >
                <option value="">Chọn khung giờ</option>
                {timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label} - {slot.time}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Count */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Số lượng sinh viên sử dụng
              </h3>
              <input
                type="number"
                min="1"
                max="100"
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1]"
                placeholder="Nhập số lượng sinh viên sử dụng"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <h3 className="font-semibold mb-3">Mục đích sử dụng</h3>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] min-h-[100px] resize-none"
              placeholder="Nhập mục đích sử dụng phòng"
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
