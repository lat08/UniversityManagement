'use client';

import { memo, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Dropdown } from '@/app/components/ui/dropdown';
import { DropdownSearch } from '@/app/components/ui/dropdown-search';
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

const DocumentsFiltersComponent = ({
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
  const semesterOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả học kỳ' },
      ...semesters.map((s) => ({ value: s.semesterId, label: s.semesterName })),
    ],
    [semesters]
  );

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ value: s.subjectId, label: s.subjectName })),
    [subjects]
  );

  const documentTypeOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả loại tài liệu' },
      ...documentTypes.map((dt) => ({ value: dt.documentType, label: dt.documentType })),
    ],
    [documentTypes]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch w-full">
      <div className="relative w-full lg:flex-1">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-2 sm:gap-3 lg:gap-4 w-full lg:flex-[2]">
        <div className="w-full">
          <Dropdown
            options={semesterOptions}
            value={selectedSemesterId || ''}
            placeholder="Tất cả học kỳ"
            onChange={(value) => onSemesterChange(value)}
            disabled={semestersLoading}
            buttonClassName="w-full text-xs sm:text-sm"
          />
        </div>

        <div className="w-full">
          <DropdownSearch
            options={subjectOptions}
            value={selectedSubjectId || undefined}
            placeholder="Tất cả môn học"
            onChange={(value) => onSubjectChange(value || '')}
            disabled={subjectsLoading}
            showEmptyOption
            emptyOptionLabel="Tất cả môn học"
            buttonClassName="w-full text-xs sm:text-sm"
          />
        </div>

        <div className="w-full col-span-2 sm:col-span-1">
          <Dropdown
            options={documentTypeOptions}
            value={selectedDocumentType || ''}
            placeholder="Tất cả loại tài liệu"
            onChange={(value) => onDocumentTypeChange(value)}
            disabled={typesLoading}
            buttonClassName="w-full text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export const DocumentsFilters = memo(DocumentsFiltersComponent);

