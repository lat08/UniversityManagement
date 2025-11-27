'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { Dropdown } from '@/app/components/ui';
import { studentsApi } from '../lib/api/studentsApi';
import { ENROLLMENT_STATUS_OPTIONS, ClassItem } from '../lib/types/types';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface BulkEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudentIds: string[];
  onSuccess: () => void;
}

export default function BulkEditStudentModal({
  isOpen,
  onClose,
  selectedStudentIds,
  onSuccess,
}: BulkEditStudentModalProps) {
  const [enrollmentStatus, setEnrollmentStatus] = useState('');
  const [classId, setClassId] = useState('');
  
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('admin.studentProfile.modals.bulkEdit');
  const tCommon = useTranslations('common.actions');
  const tStatus = useTranslations('admin.studentProfile');

  const enrollmentStatusOptions = useMemo(
    () => [
      { value: '', label: t('noChange') },
      ...ENROLLMENT_STATUS_OPTIONS.map((option) => ({
        value: option.value,
        label: tStatus(option.labelKey),
      })),
    ],
    [t, tStatus],
  );

  const classOptions = useMemo(
    () => [
      { value: '', label: t('noChange') },
      ...classes.map((c) => ({
        value: c.classId,
        label: `${c.className} (${c.classCode})`,
      })),
    ],
    [classes, t],
  );

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  const fetchClasses = async () => {
    try {
      const response = await studentsApi.getClasses({});
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!enrollmentStatus && !classId) {
      toast.error(t('validation'));
      return;
    }

    try {
      setLoading(true);

      const payload: {
        studentIds: string[];
        enrollmentStatus?: string;
        classId?: string;
      } = {
        studentIds: selectedStudentIds,
      };

      if (enrollmentStatus) {
        payload.enrollmentStatus = enrollmentStatus;
      }
      if (classId) {
        payload.classId = classId;
      }

      const response = await studentsApi.bulkUpdateStudents(payload);

      if (response.success) {
        toast.success(
          t('toast.success', {
            success: response.data.updatedCount,
            total: response.data.totalRequested,
          }),
        );
        onSuccess();
        handleClose();
      } else {
        toast.error(response.message || t('toast.error'));
      }
    } catch (error) {
      console.error('Error bulk updating students:', error);
      toast.error(t('toast.genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setEnrollmentStatus('');
    setClassId('');
    setClasses([]);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('title')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('description', { count: selectedStudentIds.length })}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Enrollment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('statusLabel')}
              </label>
              <Dropdown
                options={enrollmentStatusOptions}
                value={enrollmentStatus}
                onChange={setEnrollmentStatus}
                placeholder={t('statusPlaceholder')}
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('classLabel')}
              </label>
              <Dropdown
                options={classOptions}
                value={classId}
                onChange={setClassId}
                placeholder={t('classPlaceholder')}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || (!enrollmentStatus && !classId)}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
