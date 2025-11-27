'use client';

import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react';
import { Download, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { toast } from 'react-hot-toast';
import { studentsApi } from '../lib/api/studentsApi';
import { useTranslations } from 'next-intl';
import { ExportStudentsParams } from '../lib/types/types';

interface ExportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters?: ExportStudentsParams;
}

export default function ExportStudentModal({ isOpen, onClose, filters }: ExportStudentModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const t = useTranslations('admin.studentProfile.modals.export');
  const tCommon = useTranslations('common.actions');
  const detailItems = useMemo(
    () => [
      {
        title: t('details.items.filtered.title'),
        description: t('details.items.filtered.description'),
      },
      {
        title: t('details.items.fullInfo.title'),
        description: t('details.items.fullInfo.description'),
      },
      {
        title: t('details.items.format.title'),
        description: t('details.items.format.description'),
      },
    ],
    [t],
  );
  const noteItems = useMemo(
    () => [
      t('notes.autoDownload'),
      t('notes.duration'),
      t('notes.filterReminder'),
    ],
    [t],
  );

  const handleClose = useCallback(() => {
    if (!isExporting) {
      onClose();
    }
  }, [isExporting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isExporting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isExporting, handleClose]);

  const handleExport = async (e: FormEvent) => {
    e.preventDefault();
    
    setIsExporting(true);
    try {
      const blob = await studentsApi.exportStudents(filters || {});

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('toast.success'));
      handleClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('toast.error'));
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isExporting) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('description')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isExporting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleExport} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Export Info Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{t('info.title')}</h3>
                  <p className="text-xs text-gray-600 mb-3">{t('info.description')}</p>
                </div>
              </div>
            </div>

            {/* Export Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('details.title')}</h3>
                <div className="space-y-3">
                  {detailItems.map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Format */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {t('format.title')}
                </label>
                <div className="relative">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{t('format.label')}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{t('format.description')}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">{t('notes.title')}</p>
                  <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                    {noteItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isExporting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {t('submitting')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {t('submit')}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
