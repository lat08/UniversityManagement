"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { getDashboardData } from "../api/dashboardApi";

export const useDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.instructor(),
    queryFn: getDashboardData,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
};

