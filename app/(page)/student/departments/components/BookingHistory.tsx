'use client';

import { useState } from 'react';
import { useCancelBooking } from '../lib/hooks/useRoomBooking';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import type { BookingData, BookingStatus } from '../lib/types/room.types';
import { BOOKING_STATUS_LABELS, ROOM_TYPE_LABELS, ROOM_STATUS_LABELS } from '../lib/types/room.types';
import { Search } from 'lucide-react';
import CancelBookingModal from './CancelBookingModal';

interface BookingHistoryProps {
  bookings: BookingData[];
  isLoading: boolean;
}

export default function BookingHistory({ bookings, isLoading }: BookingHistoryProps) {
  const cancelBookingMutation = useCancelBooking();
  const rooms = useRoomBookingStore((state) => state.rooms) || [];
  
  // Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    capacity: '',
    buildingId: '',
    roomType: '',
    roomStatus: ''
  });

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

  const getStatusColor = (status: BookingStatus) => {
    const colors: Record<BookingStatus, string> = {
      pending: 'bg-yellow-500 text-white',
      confirmed: 'bg-blue-600 text-white',
      cancelled: 'bg-gray-500 text-white',
      completed: 'bg-green-600 text-white'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: BookingStatus) => {
    return BOOKING_STATUS_LABELS[status] || 'Không xác định';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const canCancelBooking = (booking: BookingData) => {
    // Chỉ cho phép hủy nếu status là pending hoặc confirmed
    if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'completed') {
      return false;
    }
    
    try {
      // Kiểm tra xem đã qua thời gian BẮT ĐẦU sử dụng chưa
      const now = new Date();
      
      // Parse booking date
      let bookingDateTime: Date;
      try {
        bookingDateTime = parseISO(booking.bookingDate);
      } catch {
        bookingDateTime = new Date(booking.bookingDate);
      }
      
      // Kiểm tra nếu parse date thất bại
      if (isNaN(bookingDateTime.getTime())) {
        return false;
      }
      
      // Parse startTime (thay vì endTime) và set vào booking date
      const [startHour, startMinute] = booking.startTime.split(':').map(Number);
      
      // Kiểm tra nếu parse time thất bại
      if (isNaN(startHour) || isNaN(startMinute)) {
        return false;
      }
      
      bookingDateTime.setHours(startHour, startMinute, 0, 0);
      
      // Nếu đã qua thời gian BẮT ĐẦU sử dụng thì không cho hủy
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
      
      // Parse booking date
      let bookingDateTime: Date;
      try {
        bookingDateTime = parseISO(booking.bookingDate);
      } catch {
        bookingDateTime = new Date(booking.bookingDate);
      }
      
      // Kiểm tra nếu parse date thất bại
      if (isNaN(bookingDateTime.getTime())) {
        return 'Lỗi định dạng ngày';
      }
      
      // Parse startTime và set vào booking date
      const [startHour, startMinute] = booking.startTime.split(':').map(Number);
      
      // Kiểm tra nếu parse time thất bại
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

  // Get unique buildings from rooms data
  const uniqueBuildings = rooms 
    ? Array.from(new Map(rooms.map(room => [room.building.buildingId, room.building])).values())
    : [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Logic tìm kiếm sẽ được implement sau
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-white">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Sức chứa tối thiểu */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Sức chứa tối thiểu
            </label>
            <input
              type="number"
              value={filters.capacity}
              onChange={(e) => handleFilterChange('capacity', e.target.value)}
              placeholder="Nhập số lượng người"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FCC] bg-white text-gray-900 text-sm"
              min="1"
            />
          </div>

          {/* Vị trí (Tòa nhà) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Vị trí
            </label>
            <select
              value={filters.buildingId}
              onChange={(e) => handleFilterChange('buildingId', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FCC] bg-white text-gray-900 text-sm"
            >
              <option value="">Tất cả</option>
              {uniqueBuildings.map((building) => (
                <option key={building.buildingId} value={building.buildingId}>
                  {building.buildingName}
                </option>
              ))}
            </select>
          </div>

          {/* Khoa (Room Type) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Khoa
            </label>
            <select
              value={filters.roomType}
              onChange={(e) => handleFilterChange('roomType', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FCC] bg-white text-gray-900 text-sm"
            >
              <option value="">Tất cả</option>
              {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filters.roomStatus}
              onChange={(e) => handleFilterChange('roomStatus', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FCC] bg-white text-gray-900 text-sm"
            >
              <option value="">Tất cả</option>
              {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              className="w-full bg-[#0B5FCC] hover:bg-[#0a4fab] text-white font-medium px-8 py-2.5 rounded-lg transition-colors"
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      {/* Booking List Section */}
      <div className="bg-[#E3F2FD] rounded-lg p-6">
        <div className="mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
          Lịch sử đăng ký phòng chức năng ({bookings.length > 0 ? `0${bookings.length}`.slice(-2) : '00'})
        </h2>
      </div>

        <div className="space-y-4">
        {bookings.map((booking) => {
          const canCancel = canCancelBooking(booking);
          
          return (
              <Card key={booking.bookingId} className="border-0 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  {/* Top section: Room name + Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {booking.roomName}
                      </h3>
                      <Badge className={`${getStatusColor(booking.bookingStatus)} px-3 py-1 text-xs font-medium rounded-md`}>
                      {getStatusText(booking.bookingStatus)}
                    </Badge>
                    </div>
                  </div>

                  {/* Location */}
                  <p className="text-sm text-gray-600 mb-4">
                          {booking.building.buildingName}
                        </p>

                  {/* All info in one line */}
                  <div className="flex items-center gap-8 text-sm mb-4 flex-wrap">
                      {/* Ngày đăng ký */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Ngày đăng ký</span>
                      <span className="font-semibold text-gray-900">{formatDate(booking.createdAt)}</span>
                      </div>

                      {/* Ngày sử dụng */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Ngày sử dụng</span>
                      <span className="font-semibold text-gray-900">{formatDate(booking.bookingDate)}</span>
                      </div>

                      {/* Thời gian sử dụng */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Thời gian sử dụng</span>
                      <span className="font-semibold text-gray-900">{booking.startTime} - {booking.endTime}</span>
                    </div>

                      {/* Mã đăng ký */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Mã đăng ký</span>
                      <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {booking.bookingCode || 'N/A'}
                      </span>
                        </div>

                    {/* Số người tham gia */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Số người tham gia</span>
                      <span className="font-semibold text-gray-900">10 người</span>
                      </div>

                      {/* Mục đích sử dụng */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Mục đích sử dụng</span>
                      <span className="font-semibold text-gray-900">{booking.purpose}</span>
                      </div>
                    </div>

                  {/* Cancel button - Bottom right */}
                  <div className="flex justify-end items-center gap-2">
                      <Button
                        onClick={() => handleCancelBooking(booking)}
                        disabled={!canCancel || cancelBookingMutation.isPending}
                      className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          canCancel 
                          ? 'bg-[#0B5FCC] hover:bg-[#0a4fab] text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      title={canCancel ? undefined : getCanCancelReason(booking) || ''}
                      >
                        {cancelBookingMutation.isPending ? 'Đang hủy...' : 'Hủy đăng ký'}
                      </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bookings.length === 0 && !isLoading && (
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
