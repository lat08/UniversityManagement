'use client';

import React from 'react';
import { Search } from 'lucide-react';

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
      {/* Course Select */}
      <div className="flex-1">
        <select
          value={selectedCourse}
          onChange={(e) => onCourseChange(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Chọn môn học</option>
          <option value="CNTT01">Lập trình Web - CNTT01</option>
          <option value="CNTT02">Cơ sở dữ liệu - CNTT02</option>
          <option value="CNTT03">Mạng máy tính - CNTT03</option>
        </select>
      </div>

      {/* Class Select */}
      <div className="flex-1">
        <select
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Chọn lớp</option>
          <option value="K16">K16</option>
          <option value="K17">K17</option>
          <option value="K18">K18</option>
        </select>
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

