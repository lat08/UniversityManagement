'use client';

import { useTranslations } from 'next-intl';
import { SearchInput, Dropdown } from '@/app/components/ui';
import { useSemesters } from '@/lib/hooks/useCommonData';
import { EXAM_TYPE_OPTIONS, EXAM_STATUS_OPTIONS } from '@/lib/constants/adminExam';
import { ExamType, ExamStatus } from '@/lib/types/adminExam';

interface ExamFiltersProps {
  readonly searchQuery: string;
  readonly onSearchChange: (value: string) => void;
  readonly semesterFilter: string;
  readonly onSemesterChange: (value: string) => void;
  readonly examTypeFilter: ExamType | 'all';
  readonly onExamTypeChange: (value: ExamType | 'all') => void;
  readonly statusFilter: ExamStatus | 'all';
  readonly onStatusChange: (value: ExamStatus | 'all') => void;
}

export const ExamFilters = ({
  searchQuery,
  onSearchChange,
  semesterFilter,
  onSemesterChange,
  examTypeFilter,
  onExamTypeChange,
  statusFilter,
  onStatusChange,
}: ExamFiltersProps) => {
  const t = useTranslations('admin.examApproval.filters');
  const { data: semesters } = useSemesters();

  const semesterOptions = [
    { value: 'all', label: t('semester.all') },
    ...(semesters?.map((s) => ({ value: s.semesterId, label: s.semesterName })) || []),
  ];

  const examTypeOptions = [
    { value: 'all', label: t('examType.all') },
    ...EXAM_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: t(`examType.${opt.value}`) })),
  ];

  const statusOptions = [
    { value: 'all', label: t('status.all') },
    ...EXAM_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: t(`status.${opt.value}`) })),
  ];

  return (
    <div className="flex flex-nowrap items-center gap-3 overflow-x-auto">
      <div className="relative min-w-0 flex-1">
        <SearchInput
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex-shrink-0 w-48">
        <Dropdown
          options={semesterOptions}
          value={semesterFilter}
          onChange={(value) => onSemesterChange(value ?? 'all')}
          placeholder={t('semester.placeholder')}
        />
      </div>
      <div className="flex-shrink-0 w-48">
        <Dropdown
          options={examTypeOptions}
          value={examTypeFilter}
          onChange={(value) => onExamTypeChange((value ?? 'all') as ExamType | 'all')}
          placeholder={t('examType.placeholder')}
        />
      </div>
      <div className="flex-shrink-0 w-48">
        <Dropdown
          options={statusOptions}
          value={statusFilter}
          onChange={(value) => onStatusChange((value ?? 'all') as ExamStatus | 'all')}
          placeholder={t('status.placeholder')}
        />
      </div>
    </div>
  );
};






