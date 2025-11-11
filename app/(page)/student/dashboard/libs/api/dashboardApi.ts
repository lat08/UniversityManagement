import { api } from "@/lib/api/client";
import { DashboardData, SemesterData, emptyDashboardData } from "../types/types";
import { AxiosError } from "axios";

const isValidGuid = (value: string): boolean => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(value);
};

export const dashboardApi = {
  getDashBoard: async (): Promise<DashboardData> => {
    try {
      const response = await api.get(`/v1/dashboard/me`);
      return response.data || emptyDashboardData;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;
      const message = axiosErr.response?.data?.message;

      if (status === 404 && message === "Không tìm thấy kết quả học tập cho học kỳ này.") {
        return emptyDashboardData;
      }

      throw err;
    }
  },

  getSemesterOverallById: async (semesterId: string): Promise<SemesterData | null> => {
    if (!semesterId || !isValidGuid(semesterId)) {
      return null;
    }

    try {
      const response = await api.get(`/v1/dashboard/semester/${semesterId}`);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;

      if (status === 404) {
        return null;
      }

      throw err;
    }
  },
};
