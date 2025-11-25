'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Filter } from 'lucide-react';
import { Button, Dropdown } from '@/app/components/ui';
import { APPROVAL_STATUS_OPTIONS } from '../lib/types/types';

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
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['status']);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(currentFilters);

  useEffect(() => {
    if (isOpen) {
      setTempFilters(currentFilters);
      
      // Auto-select filter types based on current values
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
    setSelectedFilters(prev => {
      if (filter === 'status') return prev; // Status is always selected
      
      if (prev.includes(filter)) {
        // Remove filter and clear its values
        const newFilters = { ...tempFilters };
        if (filter === 'faculty') newFilters.facultyId = [];
        if (filter === 'department') newFilters.departmentId = [];
        if (filter === 'instructor') newFilters.instructorId = [];
        setTempFilters(newFilters);
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
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
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bộ lọc nâng cao</h2>
              <p className="text-sm text-gray-600 mt-1">Chọn các tiêu chí để lọc dữ liệu</p>
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
          {/* Filter Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Chọn loại lọc (chọn ít nhất 1)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFilterToggle('status')}
                disabled
                className="px-4 py-2 rounded-lg border-2 bg-blue-50 border-blue-500 text-blue-700 font-medium cursor-not-allowed"
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Trạng thái
              </button>
              <button
                type="button"
                onClick={() => handleFilterToggle('faculty')}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedFilters.includes('faculty')
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                } font-medium`}
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Khoa
              </button>
              <button
                type="button"
                onClick={() => handleFilterToggle('department')}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedFilters.includes('department')
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                } font-medium`}
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Bộ môn
              </button>
              <button
                type="button"
                onClick={() => handleFilterToggle('instructor')}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedFilters.includes('instructor')
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                } font-medium`}
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Giảng viên
              </button>
            </div>
          </div>

          {/* Filter Options */}
          <div className="space-y-4">
            {/* Status Filter (Always visible) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Trạng thái
              </label>
              <Dropdown
                options={APPROVAL_STATUS_OPTIONS}
                value={tempFilters.status[0] || ''}
                placeholder="Chọn trạng thái"
                onChange={(value) => setTempFilters({ ...tempFilters, status: value ? [value] : [] })}
              />
            </div>

            {/* Faculty Filter */}
            {selectedFilters.includes('faculty') && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Khoa
                </label>
                <Dropdown
                  options={[
                    { value: '', label: 'Tất cả khoa' },
                    ...faculties.map(f => ({ value: f.facultyId, label: f.facultyName }))
                  ]}
                  value={tempFilters.facultyId[0] || ''}
                  placeholder="Chọn khoa"
                  onChange={(value) => setTempFilters({ ...tempFilters, facultyId: value ? [value] : [] })}
                />
              </div>
            )}

            {/* Department Filter */}
            {selectedFilters.includes('department') && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Bộ môn
                </label>
                <Dropdown
                  options={[
                    { value: '', label: 'Tất cả bộ môn' },
                    ...departments.map(d => ({ value: d.departmentId, label: d.departmentName }))
                  ]}
                  value={tempFilters.departmentId[0] || ''}
                  placeholder="Chọn bộ môn"
                  onChange={(value) => setTempFilters({ ...tempFilters, departmentId: value ? [value] : [] })}
                />
              </div>
            )}

            {/* Instructor Filter */}
            {selectedFilters.includes('instructor') && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giảng viên
                </label>
                <Dropdown
                  options={[
                    { value: '', label: 'Tất cả giảng viên' },
                    ...instructors.map(i => ({ value: i.instructorId, label: i.instructorName }))
                  ]}
                  value={tempFilters.instructorId[0] || ''}
                  placeholder="Chọn giảng viên"
                  onChange={(value) => setTempFilters({ ...tempFilters, instructorId: value ? [value] : [] })}
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
            Đặt lại
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  );
}
