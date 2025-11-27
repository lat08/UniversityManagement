'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { studentsApi } from '../lib/api/studentsApi';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface BulkDeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudentIds: string[];
  onSuccess: () => void;
}

export default function BulkDeleteStudentModal({
  isOpen,
  onClose,
  selectedStudentIds,
  onSuccess,
}: BulkDeleteStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations('admin.studentProfile.modals.bulkDelete');
  const tCommon = useTranslations('common.actions');

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await studentsApi.bulkDeleteStudents(selectedStudentIds);

      if (response.success) {
        toast.success(
          t('toast.success', { count: selectedStudentIds.length }),
        );
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || t('toast.error'));
      }
    } catch (error) {
      console.error('Error bulk deleting students:', error);
      toast.error(t('toast.genericError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700">
            {t('description', { count: selectedStudentIds.length })}
          </p>
          <p className="text-sm text-red-600 mt-2">
            {t('warning')}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? t('submitting') : tCommon('delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}
