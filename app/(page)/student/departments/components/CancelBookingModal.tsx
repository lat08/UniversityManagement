'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Xác nhận hủy đăng ký</DialogTitle>
          <DialogDescription className="text-base">
            Bạn có chắc chắn muốn hủy đăng ký phòng <span className="font-semibold text-gray-900">{booking.roomName}</span> vào ngày <span className="font-semibold text-gray-900">{formatDate(booking.bookingDate)}</span>, khung giờ <span className="font-semibold text-gray-900">{booking.startTime} - {booking.endTime}</span>?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-3 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="sm:flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="sm:flex-1 bg-[#0B5FCC] hover:bg-[#0a4fab] text-white"
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

