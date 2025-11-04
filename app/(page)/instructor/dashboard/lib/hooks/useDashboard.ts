import { useEffect, useState, useCallback } from "react";
import { getDashboardData } from "../api/dashboardApi";
import { DashboardResponse } from "../types/types";

export const useDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardData();
      setDashboard(data);
    } catch (err: unknown) {
      console.error("Error fetching dashboard:", err);
      setError("Không thể tải dữ liệu bảng điều khiển");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
};

