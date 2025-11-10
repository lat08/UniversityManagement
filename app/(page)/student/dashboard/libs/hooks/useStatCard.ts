import type { StatCardData } from "../types/types";
import { useDashboard } from "./useDashboard"; // hàm gọi API
import { Calendar, BookOpen } from "lucide-react";

export const useDashboardStats =  (): StatCardData[] => {
  const res = useDashboard();

  const cards: StatCardData[] = [
    {
      title: "Lịch học trong tuần",
      value: res?.dashboard?.totalPeriodsThisWeek ?? 0,
      unit: "Tiết",
      bgColor: "bg-[#CCE5FF]",
      iconColor: "text-[#0053AD]",
      textColor: "text-[#0053AD]",
      icon: Calendar,
    },
    {
      title: "Lịch thi trong tuần",
      value: res?.dashboard?.totalExamThisWeek ?? 0,
      unit: "Môn thi",
      bgColor: "bg-[#FFDDAA]",
      iconColor: "text-[#CC8800]",
      textColor: "text-[#CC8800]",
      icon: BookOpen,
    },
  ];

  return cards;
};
