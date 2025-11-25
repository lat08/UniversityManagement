'use client';

import { ConfirmDialog } from '@/app/components/ui/confirm-dialog';
import type { BookingData } from '../lib/types/room.types';
import { format, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';

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
  const t = useTranslations('student.departments.cancelModal');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: dateLocale });
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
      title={t('title')}
      description={t('description', {
        room: booking.roomName,
        date: formatDate(booking.bookingDate),
        timeStart: booking.startTime,
        timeEnd: booking.endTime,
      })}
      confirmText={t('confirm')}
      cancelText={t('cancel')}
      variant="warning"
      isLoading={isLoading}
    />
  );
}

