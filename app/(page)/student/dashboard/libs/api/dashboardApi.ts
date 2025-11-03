import { api } from "@/lib/api/client";
import { DashboardData, SemesterData, emptyDashboardData } from "../types/types";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

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
        toast("Không có kết quả học tập cho học kỳ này.", { icon: "ℹ️" });
        return emptyDashboardData;
      }

      throw err;
    }
  },

  getSemesterOverallById: async (semesterId: string): Promise<SemesterData> => {
    try {
      const response = await api.get(`/v1/dashboard/semester/${semesterId}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  },
};
