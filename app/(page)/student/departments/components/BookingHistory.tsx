'use client';

import { useState } from 'react';
import { useCancelBooking } from '../lib/hooks/useRoomBooking';
import { Badge } from '@/app/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import type { BookingData } from '../lib/types/room.types';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../lib/types/room.types';
import CancelBookingModal from './CancelBookingModal';

interface BookingHistoryProps {
  bookings: BookingData[];
  isLoading: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function BookingHistory({ bookings, isLoading, pagination, currentPage, onPageChange }: BookingHistoryProps) {
  const cancelBookingMutation = useCancelBooking();
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
    <>
      {/* Booking List Section */}
      <div className="bg-[#E3F2FD] rounded-lg p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Lịch sử đăng ký phòng chức năng
            </h2>
          </div>
          {pagination && (
            <p className="text-sm text-gray-600">
              Tìm thấy <span className="font-semibold">{pagination.totalItems}</span> đăng ký
              {` (Trang ${pagination.currentPage}/${pagination.totalPages})`}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => {
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
                    <span className="font-semibold text-gray-900">{booking.studentCount ?? 0} người</span>
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

        {bookings.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Chưa có lịch đăng ký nào</p>
        </div>
      )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            }`}
          >
            Trang trước
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
              const showPage = 
                page === 1 ||
                page === pagination.totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              const showEllipsis = 
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < pagination.totalPages - 2);

              if (showEllipsis) {
                return <span key={page} className="px-2 text-gray-500">...</span>;
              }

              if (!showPage) return null;

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === page
                      ? 'bg-[#0B5FCC] text-white border-[#0B5FCC]'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentPage === pagination.totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            }`}
          >
            Trang sau
          </button>
        </div>
      )}

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCancel}
        booking={selectedBooking}
        isLoading={cancelBookingMutation.isPending}
      />
    </>
  );
}
