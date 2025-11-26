import { useState, useCallback } from 'react';
import { facultiesApi } from '../api/facultiesApi';
import type { Faculty, GetFacultiesParams } from '../types/types';

export const useFaculties = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    totalFaculties: 0,
    activeFaculties: 0,
    inactiveFaculties: 0,
  });

  const fetchFaculties = useCallback(async (params: GetFacultiesParams = {}) => {
    setLoading(true);
    try {
      const response = await facultiesApi.getAll(params);
      
      if (response.success && response.data) {
        const facultyData = response.data.data || [];
        
        setFaculties(facultyData);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.pageNumber);
        
        // Calculate stats
        const activeFaculties = facultyData.filter((f) => f.facultyStatus?.toLowerCase() === 'active').length;
        const inactiveFaculties = facultyData.filter((f) => f.facultyStatus?.toLowerCase() === 'inactive').length;
        setStats({
          totalFaculties: response.data.totalCount,
          activeFaculties,
          inactiveFaculties,
        });
      } else {
        setFaculties([]);
        setTotalCount(0);
        setTotalPages(0);
        setStats({
          totalFaculties: 0,
          activeFaculties: 0,
          inactiveFaculties: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setFaculties([]);
      setTotalCount(0);
      setTotalPages(0);
      setStats({
        totalFaculties: 0,
        activeFaculties: 0,
        inactiveFaculties: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    faculties,
    loading,
    currentPage,
    totalCount,
    totalPages,
    stats,
    fetchFaculties,
    setCurrentPage,
  };
};
