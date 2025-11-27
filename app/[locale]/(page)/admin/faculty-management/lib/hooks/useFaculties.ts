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

  // Fetch stats separately to get accurate counts (always total, not filtered)
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await facultiesApi.getStats();
      setStats({
        totalFaculties: statsData.total,
        activeFaculties: statsData.active,
        inactiveFaculties: statsData.inactive,
      });
    } catch {
      // Keep existing stats on error
    }
  }, []);

  const fetchFaculties = useCallback(async (params: GetFacultiesParams = {}, shouldUpdateStats = false) => {
    setLoading(true);
    try {
      const response = await facultiesApi.getAll({
        ...params,
        pageNumber: params.pageNumber || currentPage,
        pageSize: params.pageSize || 20,
      });
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Handle both PascalCase and camelCase
        interface ResponseData {
          faculties?: Faculty[];
          Faculties?: Faculty[];
          items?: Faculty[];
          Items?: Faculty[];
          totalCount?: number;
          TotalCount?: number;
          totalPages?: number;
          TotalPages?: number;
          pageNumber?: number;
          PageNumber?: number;
        }
        
        const responseData = data as unknown as ResponseData;
        const items = Array.isArray(data.faculties) 
          ? data.faculties 
          : Array.isArray(responseData.Faculties)
            ? responseData.Faculties
            : Array.isArray(responseData.items)
              ? responseData.items
              : Array.isArray(responseData.Items)
                ? responseData.Items
                : [];
        
        setFaculties(items);
        setTotalCount(data.totalCount ?? responseData.TotalCount ?? 0);
        setTotalPages(data.totalPages ?? responseData.TotalPages ?? 0);
        setCurrentPage(data.pageNumber ?? responseData.PageNumber ?? 1);
        
        // Only fetch stats if explicitly requested (after CRUD operations)
        // Stats should always show total counts, not filtered counts
        if (shouldUpdateStats) {
          await fetchStats();
        }
      } else {
        // Reset data if request failed
        setFaculties([]);
        setTotalCount(0);
        setTotalPages(0);
        if (shouldUpdateStats) {
          setStats({
            totalFaculties: 0,
            activeFaculties: 0,
            inactiveFaculties: 0,
          });
        }
      }
    } catch {
      setFaculties([]);
      setTotalCount(0);
      setTotalPages(0);
      if (shouldUpdateStats) {
        setStats({
          totalFaculties: 0,
          activeFaculties: 0,
          inactiveFaculties: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, fetchStats]);

  return {
    faculties,
    loading,
    currentPage,
    totalCount,
    totalPages,
    stats,
    fetchFaculties,
    fetchStats,
    setCurrentPage,
  };
};

