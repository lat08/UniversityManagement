'use client';

import { useState, useMemo } from 'react';
import { useCancelBooking } from '../lib/hooks/useRoomBooking';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Badge } from '@/app/components/ui/badge';
import { Dropdown } from '@/app/components/ui/dropdown';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import type { BookingData } from '../lib/types/room.types';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, ROOM_TYPE_LABELS, ROOM_STATUS_LABELS } from '../lib/types/room.types';
import CancelBookingModal from './CancelBookingModal';

interface BookingHistoryProps {
  bookings: BookingData[];
  isLoading: boolean;
}

export default function BookingHistory({ bookings, isLoading }: BookingHistoryProps) {
  const cancelBookingMutation = useCancelBooking();
  const filters = useRoomBookingStore((state) => state.filters);
  const tempFilters = useRoomBookingStore((state) => state.tempFilters);
  const setTempFilters = useRoomBookingStore((state) => state.setTempFilters);
  const applyFilters = useRoomBookingStore((state) => state.applyFilters);
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  const handleCancelBooking = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedBooking) return;

    cancelBookingMutation.mutate(selectedBooking.bookingId, {
        onSuccess: () => {
          toast.success('Hủy đăng ký thành công!');
        setIsCancelModalOpen(false);
        setSelectedBooking(null);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Hủy đăng ký thất bại!');
        }
      });
  };

  const handleCloseModal = () => {
    if (!cancelBookingMutation.isPending) {
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
    }
  };


  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const canCancelBooking = (booking: BookingData) => {
    if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'completed') {
      return false;
    }
    
    try {
      const now = new Date();
      let bookingDateTime: Date;
      try {
        bookingDateTime = parseISO(booking.bookingDate);
      } catch {
        bookingDateTime = new Date(booking.bookingDate);
      }
      
      if (isNaN(bookingDateTime.getTime())) {
        return false;
      }
      
      const [startHour, startMinute] = booking.startTime.split(':').map(Number);
      
      if (isNaN(startHour) || isNaN(startMinute)) {
        return false;
      }
      
      bookingDateTime.setHours(startHour, startMinute, 0, 0);
      
      if (now > bookingDateTime) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  const getCanCancelReason = (booking: BookingData) => {
    if (booking.bookingStatus === 'cancelled') {
      return 'Đăng ký đã bị hủy';
    }
    if (booking.bookingStatus === 'completed') {
      return 'Đăng ký đã hoàn thành';
    }
    
    try {
      const now = new Date();
      let bookingDateTime: Date;
      try {
        bookingDateTime = parseISO(booking.bookingDate);
      } catch {
        bookingDateTime = new Date(booking.bookingDate);
      }
      
      if (isNaN(bookingDateTime.getTime())) {
        return 'Lỗi định dạng ngày';
      }
      
      const [startHour, startMinute] = booking.startTime.split(':').map(Number);
      
      if (isNaN(startHour) || isNaN(startMinute)) {
        return 'Lỗi định dạng giờ';
      }
      
      bookingDateTime.setHours(startHour, startMinute, 0, 0);
      
      if (now > bookingDateTime) {
        return 'Đã qua thời gian sử dụng';
      }
      
      return null;
    } catch {
      return 'Lỗi không xác định';
    }
  };

  const uniqueBuildings = useMemo(() => {
    const buildingMap = new Map();
    bookings.forEach(booking => {
      if (!buildingMap.has(booking.building.buildingId)) {
        buildingMap.set(booking.building.buildingId, booking.building);
      }
    });
    return Array.from(buildingMap.values());
  }, [bookings]);

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters({ [key]: value });
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (filters.buildingId && booking.building.buildingId !== filters.buildingId) {
        return false;
      }
      return true;
    });
  }, [bookings, filters]);

  const buildingOptions = [
    { value: '', label: 'Tất cả' },
    ...uniqueBuildings.map(b => ({ 
      value: b.buildingId, 
      label: `${b.buildingName} (${b.buildingCode})` 
    }))
  ];

  const roomTypeOptions = [
    { value: '', label: 'Tất cả' },
    ...Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => ({ value: key, label }))
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    ...Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => ({ value: key, label }))
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white p-6 rounded-md shadow-sm">
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        {/* Sức chứa tối thiểu */}
        <div className="relative">
          <label className="block text-sm font-medium text-[#0053AD] mb-2">Sức chứa tối thiểu</label>
          <input
            type="number"
            value={tempFilters.capacity || ''}
            onChange={(e) => handleFilterChange('capacity', e.target.value)}
            placeholder="Nhập số lượng người"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none focus:border-gray-600 bg-white text-gray-900 text-sm transition-colors"
            min="1"
          />
        </div>

        {/* Vị trí (Tòa nhà) Dropdown */}
        <div>
          <label className="block text-sm font-medium text-[#0053AD] mb-2">Cơ sở</label>
          <Dropdown
            options={buildingOptions}
            value={tempFilters.buildingId || ''}
            placeholder="Tất cả"
            onChange={(value) => handleFilterChange('buildingId', value)}
          />
        </div>

        {/* Loại phòng Dropdown */}
        <div>
          <label className="block text-sm font-medium text-[#0053AD] mb-2">Khoa</label>
          <Dropdown
            options={roomTypeOptions}
            value={tempFilters.roomType || ''}
            placeholder="Tất cả"
            onChange={(value) => handleFilterChange('roomType', value)}
          />
        </div>

        {/* Trạng thái Dropdown */}
        <div>
          <label className="block text-sm font-medium text-[#0053AD] mb-2">Trạng thái</label>
          <Dropdown
            options={statusOptions}
            value={tempFilters.roomStatus || ''}
            placeholder="Tất cả"
            onChange={(value) => handleFilterChange('roomStatus', value)}
          />
        </div>

      </div>

      {/* Booking List Section */}
      <div className="bg-[#E3F2FD] rounded-lg p-6">
        <div className="mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch sử đăng ký phòng chức năng ({filteredBookings.length > 0 ? String(filteredBookings.length).padStart(2, '0') : '00'})
        </h2>
      </div>

        <div className="space-y-4">
          {filteredBookings.map((booking) => {
          const canCancel = canCancelBooking(booking);
          
          return (
              <div key={booking.bookingId} className="bg-white shadow-sm overflow-hidden p-5 rounded-md">
                {/* Header: Room name + Badge */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900">
                        {booking.roomName}
                      </h3>
                  <Badge className={`${BOOKING_STATUS_COLORS[booking.bookingStatus] || 'bg-gray-100 text-gray-800'} px-2.5 py-0.5 text-xs font-medium rounded`}>
                      {BOOKING_STATUS_LABELS[booking.bookingStatus] || 'Không xác định'}
                    </Badge>
                  </div>

                  {/* Location */}
                <p className="text-sm text-gray-600 mb-3">
                  Tầng 1, {booking.building.buildingName}
                        </p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm mb-4">
                      {/* Ngày đăng ký */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600">Ngày đăng ký</span>
                      <span className="font-semibold text-gray-900">{formatDate(booking.createdAt)}</span>
                      </div>

                  {/* Mã đăng ký */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600">Mã đăng ký</span>
                    <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {booking.bookingCode || 'reg-004'}
                    </span>
                      </div>

                      {/* Ngày sử dụng */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600">Ngày sử dụng</span>
                      <span className="font-semibold text-gray-900">{formatDate(booking.bookingDate)}</span>
                      </div>

                  {/* Số người tham gia */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600">Số người tham gia</span>
                    <span className="font-semibold text-gray-900">10 người</span>
                      </div>

                      {/* Thời gian sử dụng */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600">Thời gian sử dụng</span>
                      <span className="font-semibold text-gray-900">{booking.startTime} - {booking.endTime}</span>
                      </div>

                      {/* Mục đích sử dụng */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600">Mục đích sử dụng</span>
                      <span className="font-semibold text-gray-900">{booking.purpose}</span>
                      </div>
                    </div>

                  {/* Cancel button - Bottom right */}
                <div className="flex justify-end items-center gap-2 mt-3">
                  <button
                        onClick={() => handleCancelBooking(booking)}
                        disabled={!canCancel || cancelBookingMutation.isPending}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                          canCancel 
                        ? 'bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--primary-foreground)]' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      title={canCancel ? undefined : getCanCancelReason(booking) || ''}
                      >
                        {cancelBookingMutation.isPending ? 'Đang hủy...' : 'Hủy đăng ký'}
                  </button>
                </div>
              </div>
          );
        })}
      </div>

        {filteredBookings.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Chưa có lịch đăng ký nào</p>
        </div>
      )}
      </div>

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCancel}
        booking={selectedBooking}
        isLoading={cancelBookingMutation.isPending}
      />
    </div>
  );
}
