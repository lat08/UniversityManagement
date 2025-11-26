"use client";

import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/queryKeys";

const DASHBOARD_STALE_TIME = 5 * 60 * 1000;
const DASHBOARD_GC_TIME = 15 * 60 * 1000;

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.admin(),
    queryFn: adminDashboardApi.getDashboard,
    staleTime: DASHBOARD_STALE_TIME,
    gcTime: DASHBOARD_GC_TIME,
    refetchOnWindowFocus: true,
  });
};






