import { useState, useEffect, useCallback } from 'react';
import { subjectsApi } from '../api/subjectsApi';
import { commonApi } from '@/lib/api/common';
import type { Subject, Faculty, Department } from '../types/types';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIsGeneral, setSelectedIsGeneral] = useState<string>('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [facultiesRes, departmentsRes] = await Promise.all([
          commonApi.getFaculties(),
          commonApi.getDepartments({}),
        ]);
        if (facultiesRes.success) setFaculties(facultiesRes.data);
        if (departmentsRes.success) setDepartments(departmentsRes.data);
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subjectsApi.getSubjects({
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchTerm || undefined,
        facultyId: selectedFacultyId || undefined,
        departmentId: selectedDepartmentId || undefined,
        status: selectedStatus || undefined,
        isGeneral: selectedIsGeneral ? selectedIsGeneral === 'true' : undefined,
      });

      console.log('Subjects API Response:', response);

      if (response && response.success && response.data) {
        const subjects = response.data.subjects || [];
        const pagination = response.data.pagination || { totalCount: 0, totalPages: 0 };
        
        setSubjects(subjects);
        setTotalCount(pagination.totalCount);
        setTotalPages(pagination.totalPages);
      } else {
        setSubjects([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedFacultyId, selectedDepartmentId, selectedStatus, selectedIsGeneral]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    faculties,
    departments,
    loading,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    pageSize,
    searchQuery,
    setSearchQuery,
    selectedFacultyId,
    setSelectedFacultyId,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedStatus,
    setSelectedStatus,
    selectedIsGeneral,
    setSelectedIsGeneral,
    refetch: fetchSubjects,
  };
};
