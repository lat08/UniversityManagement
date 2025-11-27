import { useState, useMemo, useEffect } from 'react';
import { useSemesters, useSubjects } from '@/lib/hooks';
import { useProfile } from '../../../profile/lib/hooks/useProfile';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../constants';
import type { GetExamEntriesParams } from '../types';

interface UseExamFiltersReturn {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedSemester: string;
  setSelectedSemester: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedExamType: string;
  setSelectedExamType: (value: string) => void;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  filterParams: GetExamEntriesParams;
  semesterOptions: { id: string; name: string }[];
  subjectOptions: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  examTypes: { id: string; name: string }[];
  semestersLoading: boolean;
  subjectsLoading: boolean;
}

export const useExamFilters = (): UseExamFiltersReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);

  const { data: semesters, loading: semestersLoading } = useSemesters();
  const { profile } = useProfile();
  const { data: subjects, loading: subjectsLoading } = useSubjects({ 
    instructorId: profile?.instructorId,
    semesterId: selectedSemester === 'all' ? undefined : selectedSemester
  });

  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  const filterParams = useMemo<GetExamEntriesParams>(() => ({
    searchKeyword: debouncedSearchQuery || undefined,
    semesterId: selectedSemester === 'all' ? undefined : selectedSemester,
    subjectId: selectedSubject === 'all' ? undefined : selectedSubject,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    examType: selectedExamType === 'all' ? undefined : selectedExamType,
    pageNumber: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
  }), [debouncedSearchQuery, selectedSemester, selectedSubject, selectedStatus, selectedExamType, currentPage]);

  useEffect(() => {
    setCurrentPage(DEFAULT_PAGE_NUMBER);
  }, [debouncedSearchQuery, selectedSemester, selectedSubject, selectedStatus, selectedExamType]);

  const semesterOptions = useMemo(() => [
    { id: 'all', name: 'Tất cả học kỳ' },
    ...semesters.map(s => ({ id: s.semesterId, name: s.semesterName }))
  ], [semesters]);

  const subjectOptions = useMemo(() => 
    subjects.map(s => ({ id: s.subjectId, name: `${s.subjectCode} - ${s.subjectName}` }))
  , [subjects]);

  const statuses = useMemo(() => [
    { id: 'all', name: 'Tất cả trạng thái' },
    { id: 'approved', name: 'Đã duyệt' },
    { id: 'pending', name: 'Chờ duyệt' },
    { id: 'rejected', name: 'Từ chối' },
  ], []);

  const examTypes = useMemo(() => [
    { id: 'all', name: 'Tất cả loại' },
    { id: 'midterm', name: 'Giữa kỳ' },
    { id: 'final', name: 'Cuối kỳ' },
    { id: 'quiz', name: '15 phút' },
  ], []);

  return {
    searchQuery,
    setSearchQuery,
    selectedSemester,
    setSelectedSemester,
    selectedSubject,
    setSelectedSubject,
    selectedStatus,
    setSelectedStatus,
    selectedExamType,
    setSelectedExamType,
    currentPage,
    setCurrentPage,
    filterParams,
    semesterOptions,
    subjectOptions,
    statuses,
    examTypes,
    semestersLoading,
    subjectsLoading,
  };
};
