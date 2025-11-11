import { useEffect, useState, useCallback } from "react";
import { dashboardApi } from "../api/dashboardApi";
import { gradesApi } from "@/app/(page)/student/grades/lib/api/gradesApi";
import { DashboardData, emptyDashboardData } from "../types/types";

export const useDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dashboard data và cumulative grades song song
      const [dashboardData, gradesData] = await Promise.all([
        dashboardApi.getDashBoard(),
        gradesApi.getCumulativeGrades(),
      ]);

      // Merge data: Lấy KPI từ cumulative grades, phần còn lại từ dashboard
      setDashboard({
        ...dashboardData,
        kpi: {
          gpa: gradesData.data.cumulativeGPA4,
          completedCredits: gradesData.data.totalCompletedCredits,
          totalCredits: 120, // Hard-coded tổng tín chỉ yêu cầu - có thể lấy từ curriculum
          ranking: getGpaRanking(gradesData.data.cumulativeGPA4),
        },
      });
    } catch (err: unknown) {
      console.error("Error fetching dashboard:", err);
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
};

// Helper function to get ranking from GPA
const getGpaRanking = (gpa: number): string => {
  if (gpa >= 3.6) return "Xuất sắc";
  if (gpa >= 3.2) return "Giỏi";
  if (gpa >= 2.5) return "Khá";
  if (gpa >= 2.0) return "Trung bình";
  return "Yếu";
};