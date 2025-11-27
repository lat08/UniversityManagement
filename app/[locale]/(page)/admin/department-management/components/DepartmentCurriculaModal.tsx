'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import { X, BookOpen, Calendar, Hash, CheckCircle2, XCircle } from 'lucide-react';
import type { Department } from '../lib/types/types';

interface DepartmentCurriculaModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

export const DepartmentCurriculaModal = ({
  isOpen,
  onClose,
  department,
}: DepartmentCurriculaModalProps) => {
  const t = useTranslations('admin.departmentManagement');

  if (!isOpen || !department) return null;

  const curricula = department.curricula || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-[#0053AD] to-[#003d82]">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold">{t('modals.curricula.title')}</h2>
              <p className="text-sm mt-1 opacity-90">
                {department.departmentName} ({department.departmentCode})
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {curricula.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('modals.curricula.empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {curricula.map((curriculum, index) => (
                <div
                  key={curriculum.curriculumId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0053AD]/10 text-[#0053AD] font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {curriculum.curriculumCode}
                          </h3>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {curriculum.curriculumName}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            <span className="font-medium">{t('modals.curricula.appliedYear')}:</span>{' '}
                            {curriculum.appliedYear}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            <span className="font-medium">{t('modals.curricula.version')}:</span>{' '}
                            v{curriculum.versionNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {curriculum.isActive ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-green-700 font-medium">
                                {t('status.active')}
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-700 font-medium">
                                {t('status.inactive')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{t('modals.curricula.total')}:</span>{' '}
              <span className="text-[#0053AD] font-bold">{curricula.length}</span>
              {curricula.length > 0 && (
                <>
                  {' '}
                  ({curricula.filter(c => c.isActive).length}{' '}
                  {t('status.active').toLowerCase()}, {curricula.filter(c => !c.isActive).length}{' '}
                  {t('status.inactive').toLowerCase()})
                </>
              )}
            </div>
            <Button
              onClick={onClose}
              className="bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {t('modals.curricula.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

