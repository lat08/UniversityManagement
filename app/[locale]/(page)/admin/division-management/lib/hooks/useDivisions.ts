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
      // Fetch divisions with current filters
      const response = await divisionsApi.getAll(params);
      
      if (response.success && response.data) {
        const { data, pagination } = response.data;
        
        setDivisions(data || []);
        setTotalCount(pagination.totalCount || 0);
        setTotalPages(pagination.totalPages || 0);
        setCurrentPage(pagination.currentPage || 1);
      } else {
        // Reset data if request failed
        setDivisions([]);
        setTotalCount(0);
        setTotalPages(0);
      }

      // Fetch stats separately (without searchTerm filter) to get total counts
      // Stats should always show total counts regardless of current search/filter
      const [totalResponse, activeResponse, inactiveResponse] = await Promise.all([
        divisionsApi.getAll({ pageNumber: 1, pageSize: 1 }), // Just to get totalCount, no filters
        divisionsApi.getAll({ pageNumber: 1, pageSize: 1, status: 'active' }), // Only status filter
        divisionsApi.getAll({ pageNumber: 1, pageSize: 1, status: 'inactive' }), // Only status filter
      ]);

      const totalCount = totalResponse.success && totalResponse.data 
        ? totalResponse.data.pagination.totalCount 
        : 0;
      const activeCount = activeResponse.success && activeResponse.data 
        ? activeResponse.data.pagination.totalCount 
        : 0;
      const inactiveCount = inactiveResponse.success && inactiveResponse.data 
        ? inactiveResponse.data.pagination.totalCount 
        : 0;

      setStats({
        totalDivisions: totalCount,
        activeDivisions: activeCount,
        inactiveDivisions: inactiveCount,
      });
    } catch {
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

