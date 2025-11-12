'use client';

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
  const courseClassOptions = [
    { value: '', label: isLoading ? 'Đang tải lớp học phần...' : 'Chọn lớp học phần' },
    ...courseClasses.map((cc) => ({
      value: cc.courseClassId,
      label: `${cc.courseCode} - ${cc.courseName}`,
    })),
  ];

  const semesterOptions = [
    { value: '', label: isSemestersLoading ? 'Đang tải học kỳ...' : 'Tất cả học kỳ' },
    ...semesters.map((s) => ({
      value: s.semesterId,
      label: s.semesterName,
    })),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {onSemesterChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Học kỳ</label>
          <Dropdown
            options={semesterOptions}
            value={selectedSemesterId}
            placeholder={isSemestersLoading ? 'Đang tải học kỳ...' : 'Chọn học kỳ'}
            onChange={onSemesterChange}
            disabled={isSemestersLoading}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Lớp học phần</label>
        <DropdownSearch
          options={courseClassOptions}
          value={selectedCourseClassId}
          placeholder={isLoading ? 'Đang tải danh sách lớp học phần...' : 'Chọn lớp học phần'}
          onChange={onSelect}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};