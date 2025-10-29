import { useEffect, useState, useCallback } from "react";
import { dashboardApi } from "../api/dashboardApi"
import { DashboardData } from "../types/types"


export const useDashboard = () => {
    const [dashboard, setDashboard] = useState<DashboardData >();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try{
            const data = await dashboardApi.getDashBoard();
            setDashboard(data);
        } catch (err : unknown) {
            console.error("Lỗi khi lấy danh sách khóa học có sẵn:", err);
            setError("Không thể tải danh sách khóa học có sẵn");
        } finally {
          setLoading(false); // ✅ luôn tắt loading dù có lỗi hay không
        }

      },[]);


      useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
};