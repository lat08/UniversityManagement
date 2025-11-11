import type { StatCardData } from "../types/types";
import { useDashboard } from "./useDashboard";
import { Calendar, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export const useDashboardStats = (): StatCardData[] => {
  const res = useDashboard();
  const router = useRouter();

  const cards: StatCardData[] = [
    {
      title: "Lịch học trong tuần",
      value: res?.dashboard?.totalPeriodsThisWeek ?? 0,
      unit: "Buổi",
      bgColor: "bg-[#CCE5FF]",
      iconColor: "text-[#0053AD]",
      textColor: "text-[#0053AD]",
      icon: Calendar,
      onClick: () => router.push('/student/schedule/weekly'),
    },
    {
      title: "Lịch thi trong tuần",
      value: res?.dashboard?.totalExamThisWeek ?? 0,
      unit: "Môn thi",
      bgColor: "bg-[#FFDDAA]",
      iconColor: "text-[#CC8800]",
      textColor: "text-[#CC8800]",
      icon: BookOpen,
      onClick: () => router.push('/student/exam-schedule'),
    },
  ];

  return cards;
};
