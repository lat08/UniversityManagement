"use client"

import { useState, useEffect } from 'react';
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface ExamsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSemester: string;
  onSemesterChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  semesters: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
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
  semesters,
  subjects,
  statuses,
  semestersLoading = false,
  subjectsLoading = false,
}: ExamsFiltersProps) {
  const hasActiveFilters = searchQuery || selectedSemester !== "all" || selectedSubject !== "all" || selectedStatus !== "all";

  const handleClearFilters = () => {
    onSearchChange('');
    onSemesterChange('all');
    onSubjectChange('all');
    onStatusChange('all');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-4 items-stretch w-full">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            aria-label="Tìm kiếm theo tên môn học hoặc giảng viên"
            placeholder="Tìm kiếm theo tên môn học, giảng viên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none focus:border-gray-600 bg-white text-gray-900 text-sm transition-colors h-full"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Select 
          value={selectedSemester} 
          onValueChange={onSemesterChange}
          disabled={semestersLoading}
        >
          <SelectTrigger className={`flex-1 border-gray-300 rounded-lg ${
            selectedSemester !== "all" ? 'border-blue-500 ring-1 ring-blue-500' : ''
          }`}>
            <SelectValue placeholder="Tất cả học kỳ" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                {semester.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedSubject} 
          onValueChange={onSubjectChange}
          disabled={subjectsLoading}
        >
          <SelectTrigger className={`flex-1 border-gray-300 rounded-lg ${
            selectedSubject !== "all" ? 'border-blue-500 ring-1 ring-blue-500' : ''
          }`}>
            <SelectValue placeholder="Tất cả môn học" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className={`flex-1 border-gray-300 rounded-lg ${
            selectedStatus !== "all" ? 'border-blue-500 ring-1 ring-blue-500' : ''
          }`}>
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}

