"use client";

import { useMemo } from "react";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { useAuthStore } from "@/lib/store/authStore";
import StatCard from "../StatCard";
import AcademicResultsChart from "../AcademicResultsChart";
import LearningStatsCard from "../LearningStatsCard";
import EventCard from "../EventCard";
import ClassListCard from "../ClassListCard";
import { useDashboard } from "../../libs/hooks/useDashboard";
import { useDashboardStats } from "../../libs/hooks/useStatCard"
import { Loader2 } from "lucide-react";
import { Semester } from "../../libs/types/types";

const getActiveSemesterId = (semesters: Semester[]): string => {
  if (!semesters || semesters.length === 0) return "";
  
  const now = new Date();
  
  const activeSemester = semesters.find(semester => {
    if (!semester.startDate || !semester.endDate) return false;
    const startDate = new Date(semester.startDate);
    const endDate = new Date(semester.endDate);
    return now >= startDate && now <= endDate;
  });
  
  if (activeSemester) return activeSemester.semesterId;
  
  const upcomingSemester = semesters
    .filter(semester => semester.startDate && new Date(semester.startDate) > now)
    .sort((a, b) => {
      const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
      return aStart - bStart;
    })[0];
  
  if (upcomingSemester) return upcomingSemester.semesterId;
  
  const pastSemester = semesters
    .filter(semester => semester.endDate && new Date(semester.endDate) < now)
    .sort((a, b) => {
      const aEnd = a.endDate ? new Date(a.endDate).getTime() : 0;
      const bEnd = b.endDate ? new Date(b.endDate).getTime() : 0;
      return bEnd - aEnd;
    })[0];
  
  return pastSemester?.semesterId || semesters[0]?.semesterId || "";
};

export default function DashboardContent() {
  const { user } = useAuthStore();
  const { dashboard, loading } = useDashboard();
  const card = useDashboardStats();

  const activeSemesterId = useMemo(() => {
    return getActiveSemesterId(dashboard.activeSemesters || []);
  }, [dashboard.activeSemesters]);

  usePageTitle('Bảng điều khiển');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    )
  }

  return (
    
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Bảng điều khiển</h1>
        <p className="text-xs lg:text-sm text-[var(--text-secondary)] mt-1">
          Chào mừng trở lại, {user?.name || 'Sinh viên'}!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {card.map((card, index) => (
          <StatCard key={index} data={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
        <div className="lg:col-span-8 h-full">
          <AcademicResultsChart semesters={dashboard.activeSemesters || []}
            semesterId={activeSemesterId} />
        </div>
        <div className="lg:col-span-4 h-full">
          <LearningStatsCard Kpi={dashboard.kpi}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
        <div className="lg:col-span-8 h-full">
          <EventCard events={dashboard.events || []} />
        </div>
        <div className="lg:col-span-4 h-full ">
          <ClassListCard currentSubjects={dashboard.currentSubjects || []} />
        </div>
      </div>
    </div>
  );
}
