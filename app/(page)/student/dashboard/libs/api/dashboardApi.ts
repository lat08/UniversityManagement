import type { AxiosError } from "axios";
import { api } from "@/lib/api/client";
import type { DashboardData, SemesterData } from "../types/types";

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidGuid = (value: string): boolean => GUID_REGEX.test(value);

export const dashboardApi = {
  getDashBoard: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/v1/dashboard/me");
    return response.data;
  },

  getSemesterOverallById: async (semesterId: string): Promise<SemesterData | null> => {
    if (!semesterId || !isValidGuid(semesterId)) {
      return null;
    }

    try {
      const response = await api.get<SemesterData>(`/v1/dashboard/semester/${semesterId}`);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },
};
