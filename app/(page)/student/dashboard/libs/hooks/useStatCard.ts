import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, BookOpen } from "lucide-react";
import type { DashboardData, StatCardData } from "../types/types";

export const useDashboardStats = (dashboard?: DashboardData | null): StatCardData[] => {
  const router = useRouter();

  return useMemo(
    () => [
      {
        title: "Lịch học trong tuần",
        value: dashboard?.totalPeriodsThisWeek ?? 0,
        unit: "Buổi",
        bgColor: "bg-[#CCE5FF]",
        iconColor: "text-[#0053AD]",
        textColor: "text-[#0053AD]",
        icon: Calendar,
        onClick: () => router.push("/student/schedule/weekly"),
      },
      {
        title: "Lịch thi trong tuần",
        value: dashboard?.totalExamThisWeek ?? 0,
        unit: "Môn thi",
        bgColor: "bg-[#FFDDAA]",
        iconColor: "text-[#CC8800]",
        textColor: "text-[#CC8800]",
        icon: BookOpen,
        onClick: () => router.push("/student/exam-schedule"),
      },
    ],
    [dashboard?.totalPeriodsThisWeek, dashboard?.totalExamThisWeek, router],
  );
};
