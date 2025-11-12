import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";
import { gradesApi } from "@/app/(page)/student/grades/lib/api/gradesApi";
import type { DashboardData } from "../types/types";

const DASHBOARD_QUERY_KEY = ["student-dashboard"] as const;
const DASHBOARD_STALE_TIME = 5 * 60 * 1000;
const DASHBOARD_GC_TIME = 15 * 60 * 1000;

const getGpaRanking = (gpa: number): string => {
  if (gpa >= 3.6) return "Xuất sắc";
  if (gpa >= 3.2) return "Giỏi";
  if (gpa >= 2.5) return "Khá";
  if (gpa >= 2.0) return "Trung bình";
  return "Yếu";
};

const fetchDashboard = async (): Promise<DashboardData> => {
  const [dashboardData, gradesData] = await Promise.all([
    dashboardApi.getDashBoard(),
    gradesApi.getCumulativeGrades(),
  ]);

  return {
    ...dashboardData,
    kpi: {
      gpa: gradesData.data.cumulativeGPA4,
      completedCredits: gradesData.data.totalCompletedCredits,
      totalCredits: gradesData.data.totalRequiredCredits,
      ranking: getGpaRanking(gradesData.data.cumulativeGPA4),
    },
  };
};

export const useDashboard = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboard,
    staleTime: DASHBOARD_STALE_TIME,
    gcTime: DASHBOARD_GC_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};