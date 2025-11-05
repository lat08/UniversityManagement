'use client';

import { Dropdown } from '@/app/components/ui';
import type { InstructorCourseClassDto } from '../lib/types';

interface CourseClassSelectorProps {
  courseClasses: InstructorCourseClassDto[];
  selectedCourseClassId: string;
  onSelect: (courseClassId: string) => void;
  isLoading?: boolean;
}

export const CourseClassSelector = ({
  courseClasses,
  selectedCourseClassId,
  onSelect,
  isLoading,
}: CourseClassSelectorProps) => {
  const options = [
    { value: '', label: 'Chọn lớp học phần' },
    ...courseClasses.map((cc) => ({
      value: cc.courseClassId,
      label: `${cc.courseCode} - ${cc.courseName} - ${cc.className}`,
    })),
  ];

  return (
    <div className="w-full">
      <Dropdown
        options={options}
        value={selectedCourseClassId}
        placeholder="Chọn lớp học phần"
        onChange={onSelect}
        disabled={isLoading}
      />
    </div>
  );
};



