import { useState, useCallback } from 'react';
import { buildingsApi } from '../api/buildingsApi';
import type { Building, GetBuildingsParams } from '../types/types';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    totalBuildings: 0,
    activeBuildings: 0,
    inactiveBuildings: 0,
  });

  const fetchBuildings = useCallback(async (params: GetBuildingsParams = {}) => {
    setLoading(true);
    try {
      const response = await buildingsApi.getFull(params);
      
      if (response.success && response.data) {
        // PagedResult<Building[]> có Items là Building[]
        // ASP.NET Core có thể serialize PascalCase thành camelCase
        const pagedData = response.data;
        const camelCaseData = pagedData as {
          items?: Building[];
          totalCount?: number;
          totalPages?: number;
          pageNumber?: number;
        };

        const items = Array.isArray(pagedData.Items)
          ? pagedData.Items
          : Array.isArray(camelCaseData.items)
            ? camelCaseData.items ?? []
            : [];
        
        setBuildings(items);
        setTotalCount(pagedData.TotalCount ?? camelCaseData.totalCount ?? 0);
        setTotalPages(pagedData.TotalPages ?? camelCaseData.totalPages ?? 0);
        setCurrentPage(pagedData.PageNumber ?? camelCaseData.pageNumber ?? 1);
        
        // Calculate stats from current page data
        // Note: Stats chỉ tính từ trang hiện tại, không phải toàn bộ dữ liệu
        const activeBuildings = items.filter((b) => b.buildingStatus?.toLowerCase() === 'active').length;
        const inactiveBuildings = items.filter((b) => b.buildingStatus?.toLowerCase() === 'inactive').length;
        setStats({
          totalBuildings: response.data.TotalCount || 0,
          activeBuildings,
          inactiveBuildings,
        });
      } else {
        // Reset data if request failed
        setBuildings([]);
        setTotalCount(0);
        setTotalPages(0);
        setStats({
          totalBuildings: 0,
          activeBuildings: 0,
          inactiveBuildings: 0,
        });
      }
    } catch {
      setBuildings([]);
      setTotalCount(0);
      setTotalPages(0);
      setStats({
        totalBuildings: 0,
        activeBuildings: 0,
        inactiveBuildings: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    buildings,
    loading,
    currentPage,
    totalCount,
    totalPages,
    stats,
    fetchBuildings,
    setCurrentPage,
  };
};

