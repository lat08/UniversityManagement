'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import type { DocumentTypeItem, Semester, Subject } from '../lib/types/types';

interface DocumentsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDocumentType: string;
  onDocumentTypeChange: (type: string) => void;
  selectedSemesterId: string;
  onSemesterChange: (semesterId: string) => void;
  selectedSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
  documentTypes: DocumentTypeItem[];
  semesters: Semester[];
  subjects: Subject[];
  typesLoading: boolean;
  semestersLoading: boolean;
  subjectsLoading: boolean;
}

export const DocumentsFilters = ({
  searchQuery,
  onSearchChange,
  selectedDocumentType,
  onDocumentTypeChange,
  selectedSemesterId,
  onSemesterChange,
  selectedSubjectId,
  onSubjectChange,
  documentTypes,
  semesters,
  subjects,
  typesLoading,
  semestersLoading,
  subjectsLoading,
}: DocumentsFiltersProps) => {
  const [isDocumentTypeOpen, setIsDocumentTypeOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      const documentTypeDropdown = target.closest('[data-dropdown="documentType"]');
      const semesterDropdown = target.closest('[data-dropdown="semester"]');
      const subjectDropdown = target.closest('[data-dropdown="subject"]');
      
      if (!documentTypeDropdown && !semesterDropdown && !subjectDropdown) {
        setIsDocumentTypeOpen(false);
        setIsSemesterOpen(false);
        setIsSubjectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedDocumentTypeName = () => {
    if (!selectedDocumentType) return "Tất cả loại tài liệu";
    return selectedDocumentType;
  };

  const getSelectedSemesterName = () => {
    if (!selectedSemesterId) return "Tất cả học kỳ";
    const semester = semesters.find(s => s.semesterId === selectedSemesterId);
    return semester ? semester.semesterName : "Tất cả học kỳ";
  };

  const getSelectedSubjectName = () => {
    if (!selectedSubjectId) return "Tất cả môn học";
    const subject = subjects.find(s => s.subjectId === selectedSubjectId);
    return subject ? subject.subjectName : "Tất cả môn học";
  };

  const hasActiveFilters = searchQuery || selectedDocumentType || selectedSemesterId || selectedSubjectId;

  const handleClearFilters = () => {
    onSearchChange('');
    onDocumentTypeChange('');
    onSemesterChange('');
    onSubjectChange('');
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
          aria-label="Tìm kiếm theo tên môn học hoặc giảng viên"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo tên môn học, giảng viên..."
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

      {/* Semester Dropdown */}
      <div className="relative flex-1 dropdown-container" data-dropdown="semester">
        <button 
          className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full ${
            selectedSemesterId ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
          }`}
          onClick={() => {
            setIsSemesterOpen(!isSemesterOpen);
            setIsDocumentTypeOpen(false);
            setIsSubjectOpen(false);
          }}
          disabled={semestersLoading}
        >
          <span className={`text-sm truncate ${selectedSemesterId ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>
            {getSelectedSemesterName()}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-700 flex-shrink-0" />
        </button>
        {isSemesterOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
              onClick={() => {
                onSemesterChange('');
                setIsSemesterOpen(false);
              }}
            >
              Tất cả học kỳ
            </button>
            {semesters.map((semester) => (
              <button
                key={semester.semesterId}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
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

      {/* Subject Dropdown */}
      <div className="relative flex-1 dropdown-container" data-dropdown="subject">
        <button 
          className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full ${
            selectedSubjectId ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
          }`}
          onClick={() => {
            setIsSubjectOpen(!isSubjectOpen);
            setIsDocumentTypeOpen(false);
            setIsSemesterOpen(false);
          }}
          disabled={subjectsLoading}
        >
          <span className={`text-sm truncate ${selectedSubjectId ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>
            {getSelectedSubjectName()}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-700 flex-shrink-0" />
        </button>
        {isSubjectOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
              onClick={() => {
                onSubjectChange('');
                setIsSubjectOpen(false);
              }}
            >
              Tất cả môn học
            </button>
            {subjects.map((subject) => (
              <button
                key={subject.subjectId}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                onClick={() => {
                  onSubjectChange(subject.subjectId);
                  setIsSubjectOpen(false);
                }}
              >
                {subject.subjectName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Document Type Dropdown */}
      <div className="relative flex-1 dropdown-container" data-dropdown="documentType">
        <button 
          className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full ${
            selectedDocumentType ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
          }`}
          onClick={() => {
            setIsDocumentTypeOpen(!isDocumentTypeOpen);
            setIsSemesterOpen(false);
            setIsSubjectOpen(false);
          }}
          disabled={typesLoading}
        >
          <span className={`text-sm truncate ${selectedDocumentType ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>
            {getSelectedDocumentTypeName()}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-700 flex-shrink-0" />
        </button>
        {isDocumentTypeOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
              onClick={() => {
                onDocumentTypeChange('');
                setIsDocumentTypeOpen(false);
              }}
            >
              Tất cả loại tài liệu
            </button>
            {documentTypes.map((type) => (
              <button
                key={type.documentType}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                onClick={() => {
                  onDocumentTypeChange(type.documentType);
                  setIsDocumentTypeOpen(false);
                }}
              >
                {type.documentType}
              </button>
            ))}
          </div>
        )}
      </div>
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
};

