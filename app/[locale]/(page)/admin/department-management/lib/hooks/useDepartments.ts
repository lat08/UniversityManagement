import { useState, useCallback } from 'react';
import { departmentsApi } from '../api/departmentsApi';
import type { Department, GetDepartmentsParams } from '../types/types';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    totalDepartments: 0,
    activeDepartments: 0,
    inactiveDepartments: 0,
  });

  // Fetch stats separately to get accurate counts
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await departmentsApi.getStats();
      setStats({
        totalDepartments: statsData.total,
        activeDepartments: statsData.active,
        inactiveDepartments: statsData.inactive,
      });
    } catch {
      // Keep existing stats on error
    }
  }, []);

  const fetchDepartments = useCallback(async (params: GetDepartmentsParams = {}, shouldUpdateStats = false) => {
    setLoading(true);
    try {
      const response = await departmentsApi.getAll({
        ...params,
        pageNumber: params.pageNumber || currentPage,
        pageSize: params.pageSize || 20,
      });
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Handle both PascalCase and camelCase
        interface ResponseData {
          items?: Department[];
          Items?: Department[];
          totalCount?: number;
          TotalCount?: number;
          totalPages?: number;
          TotalPages?: number;
          pageNumber?: number;
          PageNumber?: number;
        }
        
        const responseData = data as unknown as ResponseData;
        const items = Array.isArray(data.items) 
          ? data.items 
          : Array.isArray(responseData.Items)
            ? responseData.Items
            : [];
        
        setDepartments(items);
        setTotalCount(data.totalCount ?? responseData.TotalCount ?? 0);
        setTotalPages(data.totalPages ?? responseData.TotalPages ?? 0);
        setCurrentPage(data.pageNumber ?? responseData.PageNumber ?? 1);
        
        // Only fetch stats if explicitly requested (after CRUD operations)
        if (shouldUpdateStats) {
          await fetchStats();
        }
      } else {
        // Reset data if request failed
        setDepartments([]);
        setTotalCount(0);
        setTotalPages(0);
        if (shouldUpdateStats) {
          setStats({
            totalDepartments: 0,
            activeDepartments: 0,
            inactiveDepartments: 0,
          });
        }
      }
    } catch {
      setDepartments([]);
      setTotalCount(0);
      setTotalPages(0);
      if (shouldUpdateStats) {
        setStats({
          totalDepartments: 0,
          activeDepartments: 0,
          inactiveDepartments: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, fetchStats]);

  return {
    departments,
    loading,
    currentPage,
    totalCount,
    totalPages,
    stats,
    fetchDepartments,
    fetchStats,
    setCurrentPage,
  };
};

