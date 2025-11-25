'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';
import { instructorsApi } from '../lib/api/instructorsApi';
import { InstructorDetail } from '../lib/types/types';
import { getEmploymentStatusDisplay } from '../lib/utils/display';

interface InstructorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructorId: string | null;
}

export default function InstructorDetailModal({
  isOpen,
  onClose,
  instructorId,
}: InstructorDetailModalProps) {
  const [data, setData] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('admin.instructorProfile.detailModal');
  const tFilters = useTranslations('admin.instructorProfile.filters');

  useEffect(() => {
    if (!isOpen || !instructorId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await instructorsApi.getInstructorById(instructorId);
        if (res.success) setData(res.data);
      } catch (error) {
        console.error('Error fetching instructor detail', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, instructorId]);

  if (!isOpen || !instructorId) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const statusDisplay = data ? getEmploymentStatusDisplay(data.employmentStatus, tFilters) : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading || !data ? (
            <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
              {t('loading')}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('personalInfo')}</h3>
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-20 h-20 border border-gray-200">
                    <AvatarImage src={data.profilePicture || ''} alt={data.fullName} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {data.fullName
                        .split(' ')
                        .map((x) => x[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-500">{t('instructorCode')}</p>
                    <p className="text-base font-semibold text-gray-900 mb-1">{data.instructorCode}</p>
                    <p className="text-sm text-gray-500">{t('fullName')}</p>
                    <p className="text-base font-semibold text-gray-900">{data.fullName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">{t('email')}: </span>
                    <span className="text-gray-900">{data.email}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">{t('phoneNumber')}: </span>
                    <span className="text-gray-900">{data.phoneNumber}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">{t('citizenId')}: </span>
                    <span className="text-gray-900">{data.citizenId}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">{t('address')}: </span>
                    <span className="text-gray-900">{data.address}</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('workInfo')}</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">{t('faculty')}: </span>
                    <span className="text-gray-900">{data.facultyName}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">{t('degree')}: </span>
                    <span className="text-gray-900">{data.degree || '-'}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">{t('specialization')}: </span>
                    <span className="text-gray-900">{data.specialization || '-'}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">{t('status')}: </span>
                    {statusDisplay && (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-1 ${statusDisplay.color}`}
                      >
                        {statusDisplay.label}
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="text-gray-500">{t('currentClassCount')}: </span>
                    <span className="text-gray-900">{data.currentClassCount ?? 0}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-w-[100px]"
          >
            {t('close')}
          </Button>
        </div>
      </div>
    </div>
  );
}

