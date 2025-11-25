'use client';

import { useTranslations } from 'next-intl';
import { X, Calendar, FileText, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import type { AdminScheduleChangeRequestDto } from '../lib/types/scheduleChange.types';

interface ScheduleChangeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AdminScheduleChangeRequestDto | null;
}

const getStatusConfig = (t: (key: string) => string) => ({
  pending: {
    label: t('history.pending'),
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: AlertCircle,
  },
  approved: {
    label: t('history.approved'),
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: CheckCircle,
  },
  rejected: {
    label: t('history.rejected'),
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
});

export const ScheduleChangeDetailModal = ({ isOpen, onClose, data }: ScheduleChangeDetailModalProps) => {
  const t = useTranslations('instructor.schedule.weekly');
  if (!isOpen || !data) return null;

  const STATUS_CONFIG = getStatusConfig(t);
  const statusConfig = STATUS_CONFIG[data.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatDayOfWeek = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'EEEE', { locale: vi });
    } catch {
      return '-';
    }
  };

  const makeupDayLabel = data.makeupDate ? formatDayOfWeek(data.makeupDate) : '-';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('detail.title')}</h2>
              <p className="mt-1 text-sm text-gray-600">{t('detail.createdAt')}: {formatDateTime(data.createdAt)}</p>
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
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#4E8EE1]" />
                    {t('detail.generalInfo')}
                  </h3>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{t('detail.subjectName')}:</span>
                        <span className="text-base font-semibold text-gray-900">{data.subjectName}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {t('detail.subjectCode')}: <span className="font-medium text-gray-900">{data.subjectCode}</span>
                      </p>
                    </div>
                    {data.reviewedAt && (
                      <div className="space-y-2 text-sm text-gray-600 min-w-[200px]">
                        <div className="flex items-center justify-between gap-4">
                          <span>{t('detail.reviewedAt')}</span>
                          <span className="font-medium text-gray-900 text-right">{formatDateTime(data.reviewedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center md:justify-end md:items-center md:w-40">
                  <Badge
                    className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border px-3 py-1.5`}
                  >
                    <StatusIcon className="w-4 h-4 mr-1.5" />
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                {t('detail.cancelledSchedule')}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">{t('detail.cancelledWeek')}</span>
                  <span className="font-medium text-gray-900">{t('changeRequest.week')} {data.cancelledWeek}</span>
                </div>
                {data.cancelledDate && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">{t('detail.cancelledDate')}</span>
                    <span className="font-medium text-gray-900">
                      {data.cancelledDateText || formatDate(data.cancelledDate)}
                    </span>
                  </div>
                )}
                {data.cancelledDayOfWeekText && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">{t('detail.dayOfWeek')}</span>
                    <span className="font-medium text-gray-900">{data.cancelledDayOfWeekText}</span>
                  </div>
                )}
                {data.cancelledStartPeriod && data.cancelledEndPeriod && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">{t('detail.time')}</span>
                    <span className="font-medium text-gray-900">
                      {t('changeRequest.period')} {data.cancelledStartPeriod} - {data.cancelledEndPeriod}
                    </span>
                  </div>
                )}
                {data.cancelledRoomCode && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">{t('detail.room')}</span>
                    <span className="font-medium text-gray-900 text-right">
                      {data.cancelledRoomCode}
                      {data.cancelledRoomName ? ` - ${data.cancelledRoomName}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                {t('detail.makeupSchedule')}
              </h4>
              <div className="space-y-2 text-sm">
                {data.makeupWeek && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">{t('detail.makeupWeek')}</span>
                    <span className="font-medium text-gray-900">{t('changeRequest.week')} {data.makeupWeek}</span>
                  </div>
                )}
                {data.makeupDate && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">{t('detail.makeupDate')}</span>
                    <span className="font-medium text-gray-900 text-right">
                      {`${formatDate(data.makeupDate)}${makeupDayLabel !== '-' ? ` (${makeupDayLabel})` : ''}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">{t('detail.time')}</span>
                  <span className="font-medium text-gray-900">
                    {t('changeRequest.period')} {data.startPeriod} - {data.endPeriod}
                  </span>
                </div>
                {data.makeupRoomCode && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">{t('detail.room')}</span>
                    <span className="font-medium text-gray-900 text-right">
                      {data.makeupRoomCode}
                      {data.makeupRoomName ? ` - ${data.makeupRoomName}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4E8EE1]" />
                {t('detail.reason')}
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">{data.reason}</p>
            </CardContent>
          </Card>

          {data.reviewNote && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4E8EE1]" />
                  {t('detail.reviewNote')}
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{data.reviewNote}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              className="bg-[#4E8EE1] hover:bg-[#4E8EE1]/80 text-white"
            >
              {t('detail.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

