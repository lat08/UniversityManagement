'use client';

import { ConfirmDialog } from '@/app/components/ui/confirm-dialog';
import type { BookingData } from '../lib/types/room.types';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: BookingData | null;
  isLoading?: boolean;
}

export default function CancelBookingModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  booking,
  isLoading = false 
}: CancelBookingModalProps) {
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  if (!booking) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Xác nhận hủy đăng ký"
      description={`Bạn có chắc chắn muốn hủy đăng ký phòng ${booking.roomName} vào ngày ${formatDate(booking.bookingDate)}, khung giờ ${booking.startTime} - ${booking.endTime}?`}
      confirmText="Xác nhận"
      cancelText="Hủy"
      variant="warning"
      isLoading={isLoading}
    />
  );
}

