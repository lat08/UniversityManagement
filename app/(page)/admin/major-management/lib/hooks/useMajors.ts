import { useState, useCallback } from 'react';
import { majorsApi } from '../api/majorsApi';
import type { Major, GetMajorsParams } from '../types/types';

export const useMajors = () => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    totalMajors: 0,
    activeMajors: 0,
    inactiveMajors: 0,
  });

  const fetchMajors = useCallback(async (params: GetMajorsParams = {}) => {
    setLoading(true);
    try {
      const response = await majorsApi.getMajors(params);
      if (response.success) {
        setMajors(response.data.majors);
        setTotalCount(response.data.pagination.totalCount);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
        if (response.data.statistics) {
          setStats(response.data.statistics);
        }
      }
    } catch (error) {
      console.error('Error fetching majors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    majors,
    loading,
    currentPage,
    totalCount,
    totalPages,
    stats,
    fetchMajors,
    setCurrentPage,
  };
};
