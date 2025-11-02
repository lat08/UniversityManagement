'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCancelBooking } from '../lib/hooks/useRoomBooking';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, ChevronDown, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import type { BookingData, BookingStatus } from '../lib/types/room.types';
import { BOOKING_STATUS_LABELS, ROOM_TYPE_LABELS, ROOM_STATUS_LABELS } from '../lib/types/room.types';
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
  
  // Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  
  // Dropdown states
  const [isBuildingOpen, setIsBuildingOpen] = useState(false);
  const [isRoomTypeOpen, setIsRoomTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

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

  // Get unique buildings from bookings data
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
    // Apply filters immediately (real-time search)
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  // Filter bookings based on applied filters
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (filters.buildingId && booking.building.buildingId !== filters.buildingId) {
        return false;
      }
      // Room type filter would need room data joined to booking
      // For now, we skip it as bookings don't have roomType
      return true;
    });
  }, [bookings, filters]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      const buildingDropdown = target.closest('[data-dropdown="building"]');
      const roomTypeDropdown = target.closest('[data-dropdown="roomType"]');
      const statusDropdown = target.closest('[data-dropdown="status"]');
      
      if (!buildingDropdown && !roomTypeDropdown && !statusDropdown) {
        setIsBuildingOpen(false);
        setIsRoomTypeOpen(false);
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedBuildingName = () => {
    if (!tempFilters.buildingId) return "Tất cả";
    const building = uniqueBuildings.find(b => b.buildingId === tempFilters.buildingId);
    return building ? `${building.buildingName} (${building.buildingCode})` : "Tất cả";
  };

  const getSelectedRoomTypeName = () => {
    if (!tempFilters.roomType) return "Tất cả";
    return ROOM_TYPE_LABELS[tempFilters.roomType as keyof typeof ROOM_TYPE_LABELS] || "Tất cả";
  };

  const getSelectedStatusName = () => {
    if (!tempFilters.roomStatus) return "Tất cả";
    return ROOM_STATUS_LABELS[tempFilters.roomStatus as keyof typeof ROOM_STATUS_LABELS] || "Tất cả";
  };

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
        <div className="relative dropdown-container" data-dropdown="building">
          <label className="block text-sm font-medium text-[#0053AD] mb-2">Cơ sở</label>
          <button 
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
            onClick={() => {
              setIsBuildingOpen(!isBuildingOpen);
              setIsRoomTypeOpen(false);
              setIsStatusOpen(false);
            }}
          >
            <span className="text-sm text-gray-900">
              {getSelectedBuildingName()}
            </span>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
          </button>
          {isBuildingOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
                onClick={() => {
                  handleFilterChange('buildingId', '');
                  setIsBuildingOpen(false);
                }}
              >
                Tất cả
              </button>
              {uniqueBuildings.map((building) => (
                <button
                  key={building.buildingId}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                  onClick={() => {
                    handleFilterChange('buildingId', building.buildingId);
                    setIsBuildingOpen(false);
                  }}
                >
                  {building.buildingName} ({building.buildingCode})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loại phòng Dropdown */}
        <div className="relative dropdown-container" data-dropdown="roomType">
          <label className="block text-sm font-medium text-[#0053AD] mb-2">Khoa</label>
          <button 
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
            onClick={() => {
              setIsRoomTypeOpen(!isRoomTypeOpen);
              setIsBuildingOpen(false);
              setIsStatusOpen(false);
            }}
          >
            <span className="text-sm text-gray-900">
              {getSelectedRoomTypeName()}
            </span>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
          </button>
          {isRoomTypeOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
                onClick={() => {
                  handleFilterChange('roomType', '');
                  setIsRoomTypeOpen(false);
                }}
              >
                Tất cả
              </button>
              {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                  onClick={() => {
                    handleFilterChange('roomType', key);
                    setIsRoomTypeOpen(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Trạng thái Dropdown */}
        <div className="relative dropdown-container" data-dropdown="status">
          <label className="block text-sm font-medium text-[#0053AD] mb-2">Trạng thái</label>
          <button 
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
            onClick={() => {
              setIsStatusOpen(!isStatusOpen);
              setIsBuildingOpen(false);
              setIsRoomTypeOpen(false);
            }}
          >
            <span className="text-sm text-gray-900">
              {getSelectedStatusName()}
            </span>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
          </button>
          {isStatusOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
                onClick={() => {
                  handleFilterChange('roomStatus', '');
                  setIsStatusOpen(false);
                }}
              >
                Tất cả
              </button>
              {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                  onClick={() => {
                    handleFilterChange('roomStatus', key);
                    setIsStatusOpen(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
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
                  <Badge className={`${getStatusColor(booking.bookingStatus)} px-2.5 py-0.5 text-xs font-medium rounded`}>
                      {getStatusText(booking.bookingStatus)}
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
