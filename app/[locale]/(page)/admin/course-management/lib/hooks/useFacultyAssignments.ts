import { useState, useCallback } from 'react';
import { coursesApi } from '../api/coursesApi';
import type { FacultyAssignment, GetAssignmentsParams } from '../types/types';

export const useFacultyAssignments = () => {
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAssignments = useCallback(async (params: GetAssignmentsParams = {}) => {
    setLoading(true);
    try {
      const response = await coursesApi.getAssignments(params);
      if (response.success) {
        setAssignments(response.data.assignments);
        setTotalCount(response.data.pagination.totalCount);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assignments,
    loading,
    currentPage,
    totalCount,
    totalPages,
    fetchAssignments,
    setCurrentPage,
  };
};


