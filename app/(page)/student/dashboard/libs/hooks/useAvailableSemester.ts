import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";

const SEMESTER_QUERY_KEY = ["student-dashboard-semester"] as const;

export const useAvailableSemester = (semesterId: string) => {
  return useQuery({
    queryKey: [...SEMESTER_QUERY_KEY, semesterId],
    queryFn: () => dashboardApi.getSemesterOverallById(semesterId),
    enabled: Boolean(semesterId && semesterId.trim() !== ""),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};