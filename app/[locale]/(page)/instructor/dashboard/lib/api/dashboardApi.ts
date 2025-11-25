import { api } from "@/lib/api/client";
import { DashboardResponse } from "../types/types";

export async function getDashboardData(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>('/v1/dashboard/me');
  return response.data;
}

