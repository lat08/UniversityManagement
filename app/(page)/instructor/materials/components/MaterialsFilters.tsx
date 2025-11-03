"use client"

import { Search } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Dropdown } from "@/app/components/ui";

interface MaterialsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSemester: string;
  onSemesterChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  semesters: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  types: { id: string; name: string }[];
}

export function MaterialsFilters({
  searchQuery,
  onSearchChange,
  selectedSemester,
  onSemesterChange,
  selectedSubject,
  onSubjectChange,
  selectedType,
  onTypeChange,
  semesters,
  subjects,
  types,
}: MaterialsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm theo tên,..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-gray-300 rounded-lg"
        />
      </div>
      
      <Dropdown
        options={semesters.map(s => ({ value: s.id, label: s.name }))}
        value={selectedSemester}
        placeholder="Chọn học kỳ"
        onChange={onSemesterChange}
        className="w-full sm:w-[280px]"
      />

      <Dropdown
        options={subjects.map(s => ({ value: s.id, label: s.name }))}
        value={selectedSubject}
        placeholder="Chọn môn học"
        onChange={onSubjectChange}
        className="w-full sm:w-[200px]"
      />

      <Dropdown
        options={types.map(t => ({ value: t.id, label: t.name }))}
        value={selectedType}
        placeholder="Chọn loại"
        onChange={onTypeChange}
        className="w-full sm:w-[160px]"
      />
    </div>
  );
}

