import { useEffect, useState, useCallback } from "react";
import { dashboardApi } from "../api/dashboardApi"
import { DashboardData, emptyDashboardData } from "../types/types"


export const useDashboard = () => {
    const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboardData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try{
            const data = await dashboardApi.getDashBoard();
            setDashboard(data);
        } catch (err : unknown) {
            console.error('Error fetching dashboard:', err);
            setError("Không thể tải danh sách khóa học có sẵn");
            // Giữ nguyên emptyDashboardData khi có lỗi để các component vẫn render với empty state
        } finally {
          setLoading(false); // ✅ luôn tắt loading dù có lỗi hay không
        }

      },[]);


      useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
};