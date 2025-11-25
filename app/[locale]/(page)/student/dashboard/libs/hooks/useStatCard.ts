import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar, BookOpen } from "lucide-react";
import type { DashboardData, StatCardData } from "../types/types";

export const useDashboardStats = (dashboard?: DashboardData | null): StatCardData[] => {
  const router = useRouter();
  const t = useTranslations('student.dashboard.stats');

  return useMemo(
    () => [
      {
        title: t('weeklySchedule'),
        value: dashboard?.totalPeriodsThisWeek ?? 0,
        unit: t('sessions'),
        bgColor: "bg-[#CCE5FF]",
        iconColor: "text-[#0053AD]",
        textColor: "text-[#0053AD]",
        icon: Calendar,
        onClick: () => router.push("/student/schedule/weekly"),
      },
      {
        title: t('weeklyExamSchedule'),
        value: dashboard?.totalExamThisWeek ?? 0,
        unit: t('exams'),
        bgColor: "bg-[#FFDDAA]",
        iconColor: "text-[#CC8800]",
        textColor: "text-[#CC8800]",
        icon: BookOpen,
        onClick: () => router.push("/student/exam-schedule"),
      },
    ],
    [dashboard?.totalPeriodsThisWeek, dashboard?.totalExamThisWeek, router, t],
  );
};
