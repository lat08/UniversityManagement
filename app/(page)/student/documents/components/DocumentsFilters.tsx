'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Dropdown } from '@/app/components/ui/dropdown';
import type { DocumentTypeItem } from '../lib/types/types';
import type { Semester, Subject } from '@/lib/types';

interface DocumentsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDocumentType: string;
  onDocumentTypeChange: (type: string) => void;
  selectedSemesterId: string;
  onSemesterChange: (semesterId: string) => void;
  selectedSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
  documentTypes: DocumentTypeItem[];
  semesters: Semester[];
  subjects: Subject[];
  typesLoading: boolean;
  semestersLoading: boolean;
  subjectsLoading: boolean;
}

export const DocumentsFilters = ({
  searchQuery,
  onSearchChange,
  selectedDocumentType,
  onDocumentTypeChange,
  selectedSemesterId,
  onSemesterChange,
  selectedSubjectId,
  onSubjectChange,
  documentTypes,
  semesters,
  subjects,
  typesLoading,
  semestersLoading,
  subjectsLoading,
}: DocumentsFiltersProps) => {
  const semesterOptions = [
    { value: '', label: 'Tất cả học kỳ' },
    ...semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))
  ];

  const subjectOptions = [
    { value: '', label: 'Tất cả môn học' },
    ...subjects.map(s => ({ value: s.subjectId, label: s.subjectName }))
  ];

  const documentTypeOptions = [
    { value: '', label: 'Tất cả loại tài liệu' },
    ...documentTypes.map(dt => ({ value: dt.documentType, label: dt.documentType }))
  ];

  const hasActiveFilters = searchQuery || selectedDocumentType || selectedSemesterId || selectedSubjectId;

  const handleClearFilters = () => {
    onSearchChange('');
    onDocumentTypeChange('');
    onSemesterChange('');
    onSubjectChange('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-4 items-stretch w-full">
      {/* Search input */}
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          aria-label="Tìm kiếm theo tên môn học hoặc giảng viên"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo tên môn học, giảng viên..."
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none focus:border-gray-600 bg-white text-gray-900 text-sm transition-colors h-full"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Semester Dropdown */}
      <div className="flex-1">
        <Dropdown
          options={semesterOptions}
          value={selectedSemesterId || ''}
          placeholder="Tất cả học kỳ"
          onChange={(value) => onSemesterChange(value)}
          disabled={semestersLoading}
        />
      </div>

      {/* Subject Dropdown */}
      <div className="flex-1">
        <Dropdown
          options={subjectOptions}
          value={selectedSubjectId || ''}
          placeholder="Tất cả môn học"
          onChange={(value) => onSubjectChange(value)}
          disabled={subjectsLoading}
        />
      </div>

      {/* Document Type Dropdown */}
      <div className="flex-1">
        <Dropdown
          options={documentTypeOptions}
          value={selectedDocumentType || ''}
          placeholder="Tất cả loại tài liệu"
          onChange={(value) => onDocumentTypeChange(value)}
          disabled={typesLoading}
        />
      </div>
    </div>

    {/* Clear filters button */}
    {hasActiveFilters && (
      <div className="flex justify-end">
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Xóa tất cả bộ lọc
        </button>
      </div>
    )}
    </div>
  );
};

