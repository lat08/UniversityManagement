"use client"

import { Search } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

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
      
      <Select value={selectedSemester} onValueChange={onSemesterChange}>
        <SelectTrigger className="w-full sm:w-[280px] border-gray-300 rounded-lg">
          <SelectValue placeholder="Chọn học kỳ" />
        </SelectTrigger>
        <SelectContent>
          {semesters.map((semester) => (
            <SelectItem key={semester.id} value={semester.id}>
              {semester.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedSubject} onValueChange={onSubjectChange}>
        <SelectTrigger className="w-full sm:w-[200px] border-gray-300 rounded-lg">
          <SelectValue placeholder="Chọn môn học" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-[160px] border-gray-300 rounded-lg">
          <SelectValue placeholder="Chọn loại" />
        </SelectTrigger>
        <SelectContent>
          {types.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

