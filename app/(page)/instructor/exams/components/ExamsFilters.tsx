"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface ExamsFiltersProps {
  selectedSemester: string;
  onSemesterChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  semesters: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
}

export function ExamsFilters({
  selectedSemester,
  onSemesterChange,
  selectedSubject,
  onSubjectChange,
  selectedStatus,
  onStatusChange,
  semesters,
  subjects,
  statuses,
}: ExamsFiltersProps) {
  return (
    <div className="flex flex-row gap-4 mb-6">
      <Select value={selectedSemester} onValueChange={onSemesterChange}>
        <SelectTrigger className="flex-1 border-gray-300 rounded-lg">
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
        <SelectTrigger className="flex-1 border-gray-300 rounded-lg">
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

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="flex-1 border-gray-300 rounded-lg">
          <SelectValue placeholder="Chọn trạng thái" />
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
  );
}

