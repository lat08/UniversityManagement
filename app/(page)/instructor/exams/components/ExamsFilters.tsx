"use client"

import { memo, useCallback } from "react";
import { Dropdown, DropdownSearch, SearchInput } from "@/app/components/ui";

interface ExamsFiltersProps {
  readonly searchQuery: string;
  readonly onSearchChange: (value: string) => void;
  readonly selectedSemester: string;
  readonly onSemesterChange: (value: string) => void;
  readonly selectedSubject: string;
  readonly onSubjectChange: (value: string) => void;
  readonly selectedStatus: string;
  readonly onStatusChange: (value: string) => void;
  readonly selectedExamType: string;
  readonly onExamTypeChange: (value: string) => void;
  readonly semesters: { id: string; name: string }[];
  readonly subjects: { id: string; name: string }[];
  readonly statuses: { id: string; name: string }[];
  readonly examTypes: { id: string; name: string }[];
  readonly semestersLoading?: boolean;
  readonly subjectsLoading?: boolean;
}

const ExamsFiltersComponent = ({
  searchQuery,
  onSearchChange,
  selectedSemester,
  onSemesterChange,
  selectedSubject,
  onSubjectChange,
  selectedStatus,
  onStatusChange,
  selectedExamType,
  onExamTypeChange,
  semesters,
  subjects,
  statuses,
  examTypes,
  semestersLoading = false,
  subjectsLoading = false,
}: ExamsFiltersProps) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleSubjectChange = useCallback((value: string | undefined) => {
    onSubjectChange(value || "all");
  }, [onSubjectChange]);

  return (
    <div className="flex gap-4 items-stretch w-full">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm theo tên môn học, giảng viên..."
            aria-label="Tìm kiếm theo tên môn học hoặc giảng viên"
            className="h-full py-2.5 border-gray-300 rounded-lg hover:border-gray-600 focus-visible:border-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <Dropdown
          options={semesters.map(s => ({ value: s.id, label: s.name }))}
          value={selectedSemester}
          placeholder="Tất cả học kỳ"
          onChange={onSemesterChange}
          disabled={semestersLoading}
          className="flex-1"
          buttonClassName={selectedSemester === "all" ? '' : 'border-blue-500 ring-1 ring-blue-500'}
        />

        <DropdownSearch
          options={subjects.map(s => ({ value: s.id, label: s.name }))}
          value={selectedSubject === "all" ? undefined : selectedSubject}
          placeholder="Tất cả môn học"
          onChange={handleSubjectChange}
          disabled={subjectsLoading}
          className="flex-1"
          showEmptyOption
          emptyOptionLabel="Tất cả môn học"
        />

        <Dropdown
          options={statuses.map(s => ({ value: s.id, label: s.name }))}
          value={selectedStatus}
          placeholder="Tất cả trạng thái"
          onChange={onStatusChange}
          className="flex-1"
          buttonClassName={selectedStatus === "all" ? '' : 'border-blue-500 ring-1 ring-blue-500'}
        />

        <Dropdown
          options={examTypes.map(t => ({ value: t.id, label: t.name }))}
          value={selectedExamType}
          placeholder="Tất cả loại"
          onChange={onExamTypeChange}
          className="flex-1"
          buttonClassName={selectedExamType === "all" ? '' : 'border-blue-500 ring-1 ring-blue-500'}
        />
    </div>
  );
};

export const ExamsFilters = memo(ExamsFiltersComponent);

