'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setSelectedDate, setSelectedTimeSlot, clearSelection } from '@/lib/store/features/roomBookingSlice';
import { Button } from '../ui/button';
import { Calendar, Clock, Users, Search } from 'lucide-react';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import BookingModal from './BookingModal';
import 'react-day-picker/dist/style.css';

const timeSlots = [
  { id: 'morning', label: 'Buổi sáng', time: '08:00 - 12:00' },
  { id: 'afternoon', label: 'Buổi chiều', time: '13:00 - 17:00' },
  { id: 'evening', label: 'Buổi tối', time: '18:00 - 21:00' },
];

export default function BookingForm() {
  const dispatch = useAppDispatch();
  const { selectedDate, selectedTimeSlot, selectedRoom, isLoading } = useAppSelector(
    (state) => state.roomBooking
  );
  const [studentCount, setStudentCount] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    dispatch(setSelectedDate(date ? date.toISOString() : null));
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    dispatch(setSelectedTimeSlot(timeSlotId));
  };

  const handleFindRoom = () => {
    if (!selectedDate || !selectedTimeSlot || selectedTimeSlot === '') {
      toast.error('Vui lòng chọn ngày và khung giờ');
      return;
    }
    
    // Logic tìm phòng phù hợp sẽ được implement sau
    toast.success('Đang tìm phòng phù hợp...');
  };

  const handleBookRoom = () => {
    if (!selectedRoom || !selectedDate || !selectedTimeSlot) {
      toast.error('Vui lòng chọn đầy đủ thông tin');
      return;
    }
    setIsModalOpen(true);
  };

  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Chọn ngày
        </h3>
        <div className="border rounded-lg p-3">
            <DayPicker
              mode="single"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={handleDateSelect}
              disabled={{ before: today, after: nextMonth }}
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

      {/* Time Slot Selection */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Khung giờ
        </h3>
        <select
          value={selectedTimeSlot || ''}
          onChange={(e) => handleTimeSlotSelect(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8EE1] bg-white"
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

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleFindRoom}
          disabled={!selectedDate || !selectedTimeSlot || selectedTimeSlot === '' || isLoading}
          className="w-full bg-[#4E8EE1] hover:bg-[#4E8EE1]/80 text-white border-[#4E8EE1] hover:border-[#4E8EE1]/80 transition-colors cursor-pointer"
          variant="default"
        >
          <Search className="h-4 w-4 mr-2" />
          Tìm phòng phù hợp
        </Button>

        {selectedRoom && (
          <div className="p-3 border border-[#4E8EE1]/30 bg-[#4E8EE1]/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[#4E8EE1]">{selectedRoom.name}</div>
                <div className="text-sm text-[#4E8EE1]/70">{selectedRoom.location}</div>
              </div>
              <Button
                onClick={handleBookRoom}
                className="bg-[#4E8EE1] hover:bg-[#4E8EE1]/80 text-white border-[#4E8EE1] hover:border-[#4E8EE1]/80 transition-colors cursor-pointer"
              >
                Đăng ký
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
