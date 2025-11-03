'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Dropdown } from '@/app/components/ui';

interface GradeFiltersProps {
  selectedCourse: string;
  selectedClass: string;
  searchQuery: string;
  onCourseChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const GradeFilters: React.FC<GradeFiltersProps> = ({
  selectedCourse,
  selectedClass,
  searchQuery,
  onCourseChange,
  onClassChange,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Dropdown
          options={[
            { value: '', label: 'Chọn môn học' },
            { value: 'CNTT01', label: 'Lập trình Web - CNTT01' },
            { value: 'CNTT02', label: 'Cơ sở dữ liệu - CNTT02' },
            { value: 'CNTT03', label: 'Mạng máy tính - CNTT03' },
          ]}
          value={selectedCourse}
          placeholder="Chọn môn học"
          onChange={onCourseChange}
        />
      </div>

      <div className="flex-1">
        <Dropdown
          options={[
            { value: '', label: 'Chọn lớp' },
            { value: 'K16', label: 'K16' },
            { value: 'K17', label: 'K17' },
            { value: 'K18', label: 'K18' },
          ]}
          value={selectedClass}
          placeholder="Chọn lớp"
          onChange={onClassChange}
        />
      </div>

      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm sinh viên..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default GradeFilters;

