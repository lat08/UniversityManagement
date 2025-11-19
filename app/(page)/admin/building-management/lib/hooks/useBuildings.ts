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
        let items: Building[] = [];
        
        // Thử cả Items (PascalCase) và items (camelCase)
        if (Array.isArray(pagedData.Items)) {
          items = pagedData.Items;
        } else if (Array.isArray((pagedData as any).items)) {
          items = (pagedData as any).items;
        }
        
        setBuildings(items);
        setTotalCount(pagedData.TotalCount || (pagedData as any).totalCount || 0);
        setTotalPages(pagedData.TotalPages || (pagedData as any).totalPages || 0);
        setCurrentPage(pagedData.PageNumber || (pagedData as any).pageNumber || 1);
        
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
    } catch (error) {
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

