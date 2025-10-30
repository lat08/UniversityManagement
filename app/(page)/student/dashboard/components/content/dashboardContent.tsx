"use client";

import { usePageTitle } from "@/lib/hooks/usePageTitle";
import StatCard from "../StatCard";
import AcademicResultsChart from "../AcademicResultsChart";
import LearningStatsCard from "../LearningStatsCard";
import EventCard from "../EventCard";
import ClassListCard from "../ClassListCard";
import { useDashboard } from "../../libs/hooks/useDashboard";
import { useDashboardStats } from "../../libs/hooks/useStatCard"
import { Loader2 } from "lucide-react";




export default function DashboardContent() {

  
  const { dashboard, loading, error, refetch } = useDashboard();
  const card = useDashboardStats();

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

  if (error) return <p className="text-[var(--error)]">Lỗi: {error}</p>;
  return (
    
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Bảng điều khiển</h1>
        <p className="text-xs lg:text-sm text-[var(--text-secondary)] mt-1">Chào mừng trở lại, Name!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {card.map((card, index) => (
          <StatCard key={index} data={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
        <div className="lg:col-span-8 h-full">
          <AcademicResultsChart semesters={dashboard?.activeSemesters || []}
            semesterId={dashboard?.activeSemesters?.[0]?.semesterId ?? ""} />
        </div>
        <div className="lg:col-span-4 h-full">
          <LearningStatsCard Kpi={dashboard?.kpi}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
        <div className="lg:col-span-8 h-full">
          <EventCard events={dashboard?.events || []} />
        </div>
        <div className="lg:col-span-4 h-full ">
          <ClassListCard currentSubjects={dashboard?.currentSubjects || []} />
        </div>
      </div>
    </div>
  );
}
