"use client"

import { memo, useCallback } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations('instructor.exams.filters');
  const tSearch = useTranslations('instructor.exams.search');
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleSubjectChange = useCallback((value: string | undefined) => {
    onSubjectChange(value || "all");
  }, [onSubjectChange]);

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch w-full">
        <div className="w-full lg:flex-1">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={tSearch('placeholder')}
            aria-label={tSearch('ariaLabel')}
            className="h-full py-2.5 border-gray-300 rounded-lg hover:border-gray-600 focus-visible:border-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2 sm:gap-3 lg:gap-4 w-full lg:flex-[3]">
          <Dropdown
            options={semesters.map(s => ({ value: s.id, label: s.name }))}
            value={selectedSemester}
            placeholder={t('allSemesters')}
            onChange={onSemesterChange}
            disabled={semestersLoading}
            className="w-full"
            buttonClassName={`w-full text-xs sm:text-sm ${selectedSemester === "all" ? '' : 'border-blue-500 ring-1 ring-blue-500'}`}
          />

          <DropdownSearch
            options={subjects.map(s => ({ value: s.id, label: s.name }))}
            value={selectedSubject === "all" ? undefined : selectedSubject}
            placeholder={t('allSubjects')}
            onChange={handleSubjectChange}
            disabled={subjectsLoading}
            className="w-full"
            showEmptyOption
            emptyOptionLabel={t('allSubjects')}
            buttonClassName="w-full text-xs sm:text-sm"
          />

          <Dropdown
            options={statuses.map(s => ({ value: s.id, label: s.name }))}
            value={selectedStatus}
            placeholder={t('allStatuses')}
            onChange={onStatusChange}
            className="w-full"
            buttonClassName={`w-full text-xs sm:text-sm ${selectedStatus === "all" ? '' : 'border-blue-500 ring-1 ring-blue-500'}`}
          />

          <Dropdown
            options={examTypes.map(t => ({ value: t.id, label: t.name }))}
            value={selectedExamType}
            placeholder={t('allTypes')}
            onChange={onExamTypeChange}
            className="w-full"
            buttonClassName={`w-full text-xs sm:text-sm ${selectedExamType === "all" ? '' : 'border-blue-500 ring-1 ring-blue-500'}`}
          />
        </div>
    </div>
  );
};

export const ExamsFilters = memo(ExamsFiltersComponent);

