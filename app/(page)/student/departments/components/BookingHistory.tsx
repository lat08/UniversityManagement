'use client';

import { useCancelBooking } from '../lib/hooks/useRoomBooking';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { Calendar, Clock, Users, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import type { UserBooking } from '../lib/stores/roomBookingStore';

interface BookingHistoryProps {
  bookings: UserBooking[];
  isLoading: boolean;
}

export default function BookingHistory({ bookings, isLoading }: BookingHistoryProps) {
  const cancelBookingMutation = useCancelBooking();

  const handleCancelBooking = (bookingId: string, roomName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đăng ký phòng "${roomName}"?`)) {
      cancelBookingMutation.mutate(bookingId, {
        onSuccess: () => {
          toast.success('Hủy đăng ký thành công!');
        },
        onError: () => {
          toast.error('Hủy đăng ký thất bại!');
        }
      });
    }
  };

  const getStatusColor = (status: UserBooking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#4E8EE1] text-white';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-[#DEE9FF] text-[#4E8EE1]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: UserBooking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const canCancelBooking = (booking: UserBooking) => {
    const bookingDate = parseISO(booking.date);
    const now = new Date();
    const timeDiff = bookingDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return booking.status === 'confirmed' && hoursDiff > 24; // Có thể hủy nếu còn hơn 24h
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{booking.roomName}</h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusText(booking.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{booking.studentCount} sinh viên</span>
                    </div>
                  </div>
                  
                  {canCancelBooking(booking) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id, booking.roomName)}
                      disabled={cancelBookingMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {cancelBookingMutation.isPending ? 'Đang hủy...' : 'Hủy đăng ký'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {bookings.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Chưa có lịch đăng ký nào</p>
        </div>
      )}
    </div>
  );
}
