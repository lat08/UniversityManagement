'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Semester, CourseClass } from '../lib/types/types';

interface GradeFiltersProps {
  selectedCourse: string;
  selectedSemester: string;
  onCourseChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  semesters: Semester[];
  courseClasses: CourseClass[];
}

const GradeFilters: React.FC<GradeFiltersProps> = ({
  selectedCourse,
  selectedSemester,
  onCourseChange,
  onSemesterChange,
  semesters,
  courseClasses,
}) => {
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsSemesterOpen(false);
        setIsCourseOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSemesterName = semesters.find(s => s.semesterId === selectedSemester)?.semesterName || 'Chọn học kỳ';
  const selectedCourseName = courseClasses.find(c => c.courseClassId === selectedCourse)?.courseName || 'Chọn môn học';

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Semester Dropdown */}
      <div className="relative flex-1" data-dropdown="semester">
        <button
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
          onClick={() => {
            setIsSemesterOpen(!isSemesterOpen);
            setIsCourseOpen(false);
          }}
        >
          <span className="text-sm text-gray-900">
            {selectedSemesterName}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
        </button>
        {isSemesterOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {semesters.map((semester) => (
              <button
                key={semester.semesterId}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                onClick={() => {
                  onSemesterChange(semester.semesterId);
                  setIsSemesterOpen(false);
                }}
              >
                {semester.semesterName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Course Dropdown */}
      <div className="relative flex-1" data-dropdown="course">
        <button
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
          onClick={() => {
            setIsCourseOpen(!isCourseOpen);
            setIsSemesterOpen(false);
          }}
        >
          <span className="text-sm text-gray-900">
            {selectedCourseName}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
        </button>
        {isCourseOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {courseClasses.length === 0 ? (
              <div className="px-4 py-2.5 text-sm text-gray-500">
                Không có môn học
              </div>
            ) : (
              courseClasses.map((course) => (
                <button
                  key={course.courseClassId}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => {
                    onCourseChange(course.courseClassId);
                    setIsCourseOpen(false);
                  }}
                >
                  {course.courseName}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeFilters;

