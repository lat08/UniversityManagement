"use client"

import { Search, X } from "lucide-react";
import { Dropdown } from "@/app/components/ui";

interface ExamsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSemester: string;
  onSemesterChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  semesters: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  semestersLoading?: boolean;
  subjectsLoading?: boolean;
}

export function ExamsFilters({
  searchQuery,
  onSearchChange,
  selectedSemester,
  onSemesterChange,
  selectedSubject,
  onSubjectChange,
  selectedStatus,
  onStatusChange,
  semesters,
  subjects,
  statuses,
  semestersLoading = false,
  subjectsLoading = false,
}: ExamsFiltersProps) {
  const hasActiveFilters = searchQuery || selectedSemester !== "all" || selectedSubject !== "all" || selectedStatus !== "all";

  const handleClearFilters = () => {
    onSearchChange('');
    onSemesterChange('all');
    onSubjectChange('all');
    onStatusChange('all');
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
            type="text"
            aria-label="Tìm kiếm theo tên môn học hoặc giảng viên"
            placeholder="Tìm kiếm theo tên môn học, giảng viên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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

        <Dropdown
          options={semesters.map(s => ({ value: s.id, label: s.name }))}
          value={selectedSemester}
          placeholder="Tất cả học kỳ"
          onChange={onSemesterChange}
          disabled={semestersLoading}
          className="flex-1"
          buttonClassName={selectedSemester !== "all" ? 'border-blue-500 ring-1 ring-blue-500' : ''}
        />

        <Dropdown
          options={subjects.map(s => ({ value: s.id, label: s.name }))}
          value={selectedSubject}
          placeholder="Tất cả môn học"
          onChange={onSubjectChange}
          disabled={subjectsLoading}
          className="flex-1"
          buttonClassName={selectedSubject !== "all" ? 'border-blue-500 ring-1 ring-blue-500' : ''}
        />

        <Dropdown
          options={statuses.map(s => ({ value: s.id, label: s.name }))}
          value={selectedStatus}
          placeholder="Tất cả trạng thái"
          onChange={onStatusChange}
          className="flex-1"
          buttonClassName={selectedStatus !== "all" ? 'border-blue-500 ring-1 ring-blue-500' : ''}
        />
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
}

