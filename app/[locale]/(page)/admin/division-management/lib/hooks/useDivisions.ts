import { useState, useCallback } from 'react';
import { divisionsApi } from '../api/divisionsApi';
import type { Division, GetDivisionsParams } from '../types/types';

export const useDivisions = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    totalDivisions: 0,
    activeDivisions: 0,
    inactiveDivisions: 0,
  });

  const fetchDivisions = useCallback(async (params: GetDivisionsParams = {}) => {
    setLoading(true);
    try {
      const response = await divisionsApi.getAll(params);
      
      if (response.isSuccess && response.data) {
        // Response structure: { data: { data: Division[], pagination: {...} } }
        const divisionData = response.data.data || [];
        const paginationData = response.data.pagination;
        
        setDivisions(divisionData);
        setTotalCount(paginationData.totalCount);
        setTotalPages(paginationData.totalPages);
        setCurrentPage(paginationData.currentPage);
        
        // Calculate stats from current page data
        const activeDivisions = divisionData.filter((d) => d.divisionStatus?.toLowerCase() === 'active').length;
        const inactiveDivisions = divisionData.filter((d) => d.divisionStatus?.toLowerCase() === 'inactive').length;
        setStats({
          totalDivisions: paginationData.totalCount,
          activeDivisions,
          inactiveDivisions,
        });
      } else {
        setDivisions([]);
        setTotalCount(0);
        setTotalPages(0);
        setStats({
          totalDivisions: 0,
          activeDivisions: 0,
          inactiveDivisions: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching divisions:', error);
      setDivisions([]);
      setTotalCount(0);
      setTotalPages(0);
      setStats({
        totalDivisions: 0,
        activeDivisions: 0,
        inactiveDivisions: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    divisions,
    loading,
    currentPage,
    totalCount,
    totalPages,
    stats,
    fetchDivisions,
    setCurrentPage,
  };
};
