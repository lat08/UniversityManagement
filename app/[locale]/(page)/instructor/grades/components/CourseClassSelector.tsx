'use client';

import { useTranslations } from 'next-intl';
import { Dropdown, DropdownSearch } from '@/app/components/ui';
import type { InstructorCourseClassDto } from '../lib/types';
import type { Semester } from '@/lib/types/common';

interface CourseClassSelectorProps {
  courseClasses: InstructorCourseClassDto[];
  selectedCourseClassId: string;
  onSelect: (courseClassId: string) => void;
  isLoading?: boolean;
  semesters?: Semester[];
  selectedSemesterId?: string;
  onSemesterChange?: (semesterId: string) => void;
  isSemestersLoading?: boolean;
}

export const CourseClassSelector = ({
  courseClasses,
  selectedCourseClassId,
  onSelect,
  isLoading,
  semesters = [],
  selectedSemesterId = '',
  onSemesterChange,
  isSemestersLoading,
}: CourseClassSelectorProps) => {
  const t = useTranslations('instructor.grades.selector');
  
  const courseClassOptions = [
    { value: '', label: isLoading ? t('loadingCourseClassesList') : t('selectCourseClass') },
    ...courseClasses.map((cc) => ({
      value: cc.courseClassId,
      label: `${cc.courseCode} - ${cc.courseName}`,
    })),
  ];

  const semesterOptions = [
    { value: '', label: isSemestersLoading ? t('loadingSemesters') : t('allSemesters') },
    ...semesters.map((s) => ({
      value: s.semesterId,
      label: s.semesterName,
    })),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {onSemesterChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('semester')}</label>
          <Dropdown
            options={semesterOptions}
            value={selectedSemesterId}
            placeholder={isSemestersLoading ? t('loadingSemesters') : t('selectSemester')}
            onChange={onSemesterChange}
            disabled={isSemestersLoading}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('courseClass')}</label>
        <DropdownSearch
          options={courseClassOptions}
          value={selectedCourseClassId}
          placeholder={isLoading ? t('loadingCourseClassesList') : t('selectCourseClass')}
          onChange={onSelect}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};