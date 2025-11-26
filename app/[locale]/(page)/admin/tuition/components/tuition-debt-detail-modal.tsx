'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import { Table, type TableColumn } from '@/app/components/ui';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils/format';
import { useStudentDebtDetail } from '@/lib/hooks/useTuitionDebt';
import type { StudentDebtBySemester } from '@/lib/types';
import { toast } from 'react-hot-toast';

interface TuitionDebtDetailModalProps {
  readonly open: boolean;
  readonly studentCode: string | null;
  readonly onClose: () => void;
}

export const TuitionDebtDetailModal = ({
  open,
  studentCode,
  onClose,
}: TuitionDebtDetailModalProps) => {
  const t = useTranslations('admin.tuition');
  const locale = useLocale();
  const localeConfig = locale === 'vi' ? vi : enUS;
  const dateFormat = locale === 'vi' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';

  const { data: debtData, isLoading, error } = useStudentDebtDetail(studentCode);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (error) {
      const message =
        (error as { message?: string })?.message ||
        t('detail.loading');
      toast.error(message);
    }
  }, [error, t]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!open || !studentCode) {
    return null;
  }

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return '-';
    try {
      const parsed = new Date(date);
      if (Number.isNaN(parsed.getTime())) return date;
      return format(parsed, dateFormat, { locale: localeConfig });
    } catch {
      return date;
    }
  };

  const getStatusTranslation = (status: string): string => {
    if (status.includes('Đã thanh toán') || status.toLowerCase().includes('paid')) {
      return t('status.paid');
    }
    if (status.includes('Chưa thanh toán') || status.toLowerCase().includes('unpaid')) {
      return t('status.unpaid');
    }
    if (status.includes('Quá hạn') || status.toLowerCase().includes('overdue')) {
      return t('status.overdue');
    }
    return status;
  };

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (status.includes('Đã thanh toán') || statusLower.includes('paid')) {
      return 'bg-green-100 text-green-800';
    }
    if (status.includes('Chưa thanh toán') || statusLower.includes('unpaid')) {
      return 'bg-red-100 text-red-800';
    }
    if (status.includes('Quá hạn') || statusLower.includes('overdue')) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const registeredSubjectsColumns: TableColumn[] = [
    { key: 'subjectCode', label: t('detail.registeredSubjects.code') },
    { key: 'subjectName', label: t('detail.registeredSubjects.name') },
    {
      key: 'credits',
      label: t('detail.registeredSubjects.credits'),
      align: 'right',
    },
    { key: 'fee', label: t('detail.registeredSubjects.fee'), align: 'right' },
  ];

  const paymentHistoryColumns: TableColumn[] = [
    { key: 'date', label: t('detail.paymentHistory.date') },
    { key: 'amount', label: t('detail.paymentHistory.amount'), align: 'right' },
    { key: 'method', label: t('detail.paymentHistory.method') },
    { key: 'transactionCode', label: t('detail.paymentHistory.transactionCode') },
    { key: 'confirmedBy', label: t('detail.paymentHistory.confirmedBy') },
  ];

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
          <div className="text-center text-gray-500">{t('detail.loading')}</div>
        </div>
      </div>
    );
  }

  if (!debtData) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
          <div className="text-center text-red-600">{t('detail.notFound')}</div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onClose} type="button">
              {t('detail.close')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={handleBackdropClick}
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex-1">
            <p className="text-xs uppercase text-gray-400">{t('detail.subtitle')}</p>
            <h2 className="text-xl font-semibold text-gray-900">{t('detail.title')}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            type="button"
            aria-label={t('detail.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-6">
          {/* Student Information */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              {t('detail.studentInfo.title')}
            </h3>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">{t('detail.studentInfo.studentCode')}</p>
                <p className="font-semibold text-gray-900">{debtData.studentCode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('detail.studentInfo.fullName')}</p>
                <p className="font-semibold text-gray-900">{debtData.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('detail.studentInfo.className')}</p>
                <p className="font-semibold text-gray-900">{debtData.className}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('detail.studentInfo.major')}</p>
                <p className="font-semibold text-gray-900">{debtData.major}</p>
              </div>
            </div>
          </div>

          {/* Semester Details */}
          {debtData.semesters.map((semester: StudentDebtBySemester) => (
            <div key={semester.semesterId} className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  {t('detail.tuitionInfo.title')} - {semester.semesterName} ({semester.academicYear})
                </h3>
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">{t('detail.tuitionInfo.totalFee')}</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(semester.totalFee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('detail.tuitionInfo.debt')}</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(semester.debt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('detail.tuitionInfo.totalCredits')}</p>
                    <p className="font-semibold text-gray-900">{semester.totalCredits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('detail.tuitionInfo.paid')}</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(semester.paid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('detail.tuitionInfo.status')}</p>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(semester.status)}`}
                    >
                      {getStatusTranslation(semester.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Registered Subjects */}
              {semester.registeredSubjects.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">
                    {t('detail.registeredSubjects.title')}
                  </h4>
                  <Table
                    columns={registeredSubjectsColumns}
                    data={semester.registeredSubjects}
                    renderRow={(subject) => (
                      <>
                        <td className="px-6 py-4">{subject.subjectCode}</td>
                        <td className="px-6 py-4">{subject.subjectName}</td>
                        <td className="px-6 py-4 text-right">{subject.credits}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(subject.fee)}</td>
                      </>
                    )}
                  />
                </div>
              )}

              {/* Payment History */}
              {semester.paymentHistory.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">
                    {t('detail.paymentHistory.title')}
                  </h4>
                  <Table
                    columns={paymentHistoryColumns}
                    data={semester.paymentHistory}
                    renderRow={(payment) => (
                      <>
                        <td className="px-6 py-4">{formatDate(payment.paidAt)}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(payment.amount)}</td>
                        <td className="px-6 py-4">{payment.method}</td>
                        <td className="px-6 py-4">{payment.transactionCode}</td>
                        <td className="px-6 py-4">{payment.confirmedBy}</td>
                      </>
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} type="button">
            {t('detail.close')}
          </Button>
        </div>
      </div>
    </div>
  );
};



