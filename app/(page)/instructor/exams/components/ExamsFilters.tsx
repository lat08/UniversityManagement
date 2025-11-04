"use client"

import { Dropdown, DropdownSearch, SearchInput } from "@/app/components/ui";

interface ExamsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSemester: string;
  onSemesterChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedExamType: string;
  onExamTypeChange: (value: string) => void;
  semesters: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  examTypes: { id: string; name: string }[];
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
  selectedExamType,
  onExamTypeChange,
  semesters,
  subjects,
  statuses,
  examTypes,
  semestersLoading = false,
  subjectsLoading = false,
}: ExamsFiltersProps) {
  return (
    <div className="flex gap-4 items-stretch w-full">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
          onChange={(value) => onSubjectChange(value || "all")}
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
}

