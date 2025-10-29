import type { StatCardData } from "../types/types";
import { useDashboard } from "./useDashboard"; // hàm gọi API

export const useDashboardStats =  (): StatCardData[] => {
  const res = useDashboard();

  const cards: StatCardData[] = [
    {
      title: "Lịch học trong tuần",
      value: res?.dashboard?.totalPeriodsThisWeek ?? 0,
      unit: "Tiết",
      bgColor: "bg-[var(--info-light)]",
      iconColor: "text-[var(--info)]",
      textColor: "text-[var(--info)]",
    },
    {
      title: "Lịch thi trong tuần",
      value: res?.dashboard?.totalExamThisWeek ?? 0,
      unit: "Môn thi",
      bgColor: "bg-[var(--error-light)]",
      iconColor: "text-[var(--error)]",
      textColor: "text-[var(--error)]",
    },
  ];

  return cards;
};
