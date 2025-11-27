'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, Dropdown } from '@/app/components/ui';
import { buildApprovalStatusOptions } from '../lib/types/types';

export interface FilterOptions {
  status: string[];
  facultyId: string[];
  departmentId: string[];
  instructorId: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  faculties: Array<{ facultyId: string; facultyName: string }>;
  departments: Array<{ departmentId: string; departmentName: string }>;
  instructors: Array<{ instructorId: string; instructorName: string }>;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
  faculties,
  departments,
  instructors,
}: FilterModalProps) {
  const t = useTranslations('admin.gradeApproval');
  const statusOptions = useMemo(() => buildApprovalStatusOptions(t), [t]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['status']);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(currentFilters);

  useEffect(() => {
    if (isOpen) {
      setTempFilters(currentFilters);
      const activeFilters = ['status'];
      if (currentFilters.facultyId.length > 0) activeFilters.push('faculty');
      if (currentFilters.departmentId.length > 0) activeFilters.push('department');
      if (currentFilters.instructorId.length > 0) activeFilters.push('instructor');
      setSelectedFilters(activeFilters);
    }
  }, [isOpen, currentFilters]);

  const handleClose = useCallback(() => {
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

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prev) => {
      if (filter === 'status') return prev;

      if (prev.includes(filter)) {
        const newFilters = { ...tempFilters };
        if (filter === 'faculty') newFilters.facultyId = [];
        if (filter === 'department') newFilters.departmentId = [];
        if (filter === 'instructor') newFilters.instructorId = [];
        setTempFilters(newFilters);
        return prev.filter((f) => f !== filter);
      }
      return [...prev, filter];
    });
  };

  const handleApply = () => {
    onApply(tempFilters);
    handleClose();
  };

  const handleReset = () => {
    setTempFilters({
      status: [],
      facultyId: [],
      departmentId: [],
      instructorId: [],
    });
    setSelectedFilters(['status']);
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('filterModal.title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('filterModal.description')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('filterModal.typeHint')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFilterToggle('status')}
                disabled
                className="px-4 py-2 rounded-lg border-2 bg-blue-50 border-blue-500 text-blue-700 font-medium cursor-not-allowed"
              >
                <Filter className="w-4 h-4 inline mr-2" />
                {t('filterModal.types.status')}
              </button>
              {(['faculty', 'department', 'instructor'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleFilterToggle(type)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    selectedFilters.includes(type)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  } font-medium`}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  {t(`filterModal.types.${type}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t('filterModal.statusLabel')}
              </label>
              <Dropdown
                options={statusOptions}
                value={tempFilters.status[0] || ''}
                placeholder={t('filterModal.statusPlaceholder')}
                onChange={(value) => setTempFilters({ ...tempFilters, status: value ? [value] : [] })}
              />
            </div>

            {selectedFilters.includes('faculty') && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('filterModal.facultyLabel')}
                </label>
                <Dropdown
                  options={[
                    { value: '', label: t('allFaculties') },
                    ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
                  ]}
                  value={tempFilters.facultyId[0] || ''}
                  placeholder={t('filterModal.facultyPlaceholder')}
                  onChange={(value) => setTempFilters({ ...tempFilters, facultyId: value ? [value] : [] })}
                />
              </div>
            )}

            {selectedFilters.includes('department') && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('filterModal.departmentLabel')}
                </label>
                <Dropdown
                  options={[
                    { value: '', label: t('allDepartments') },
                    ...departments.map((d) => ({ value: d.departmentId, label: d.departmentName })),
                  ]}
                  value={tempFilters.departmentId[0] || ''}
                  placeholder={t('filterModal.departmentPlaceholder')}
                  onChange={(value) =>
                    setTempFilters({ ...tempFilters, departmentId: value ? [value] : [] })
                  }
                />
              </div>
            )}

            {selectedFilters.includes('instructor') && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('filterModal.instructorLabel')}
                </label>
                <Dropdown
                  options={[
                    { value: '', label: t('allInstructors') },
                    ...instructors.map((i) => ({ value: i.instructorId, label: i.instructorName })),
                  ]}
                  value={tempFilters.instructorId[0] || ''}
                  placeholder={t('filterModal.instructorPlaceholder')}
                  onChange={(value) =>
                    setTempFilters({ ...tempFilters, instructorId: value ? [value] : [] })
                  }
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t('filterModal.reset')}
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
          >
            {t('filterModal.apply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
