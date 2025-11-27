"use client";

import { useMemo, memo, lazy, Suspense } from "react";
import { useTranslations } from "next-intl";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { useAuthStore } from "@/lib/store/authStore";
import StatCard from "../StatCard";
import { DashboardSkeleton } from "../dashboard-skeleton";
import { useDashboard } from "../../libs/hooks/useDashboard";
import { useDashboardStats } from "../../libs/hooks/useStatCard";
import type { Semester } from "../../libs/types/types";

const AcademicResultsChart = lazy(() => import("../AcademicResultsChart"));
const LearningStatsCard = lazy(() => import("../LearningStatsCard"));
const EventCard = lazy(() => import("../EventCard"));
const ClassListCard = lazy(() => import("../ClassListCard"));

const getActiveSemesterId = (semesters: Semester[]): string => {
  if (!semesters || semesters.length === 0) return "";

  const now = new Date();

  const activeSemester = semesters.find((semester) => {
    const startDate = new Date(semester.semesterName);
    const endDate = new Date(semester.semesterName);
    return now >= startDate && now <= endDate;
  });

  if (activeSemester) return activeSemester.semesterId;

  const upcomingSemester = semesters
    .filter((semester) => new Date(semester.semesterName) > now)
    .sort((a, b) => new Date(a.semesterName).getTime() - new Date(b.semesterName).getTime())[0];

  if (upcomingSemester) return upcomingSemester.semesterId;

  const pastSemester = semesters
    .filter((semester) => new Date(semester.semesterName) < now)
    .sort((a, b) => new Date(b.semesterName).getTime() - new Date(a.semesterName).getTime())[0];

  return pastSemester?.semesterId || semesters[0]?.semesterId || "";
};

const WelcomeSection = memo(({ userName }: { userName: string }) => {
  const t = useTranslations('common.dashboard');
  return (
  <div>
      <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
      <p className="text-xs lg:text-sm text-[var(--text-secondary)] mt-1">{t('welcome', { name: userName })}</p>
  </div>
  );
});
WelcomeSection.displayName = "WelcomeSection";

const ChartSkeleton = memo(() => {
  const t = useTranslations('common');
  return (
  <div className="h-[300px] lg:h-[350px] flex items-center justify-center bg-white rounded-lg shadow-sm">
      <span className="text-[var(--text-secondary)] text-sm">{t('loading')}</span>
  </div>
);
});
ChartSkeleton.displayName = "ChartSkeleton";

const DashboardContent = memo(() => {
  const t = useTranslations('common.dashboard');
  const tCommon = useTranslations('common');
  const { user } = useAuthStore();
  const { data: dashboard, isPending } = useDashboard();
  const cards = useDashboardStats(dashboard);
  const isInitialLoading = !dashboard && isPending;

  const activeSemesterId = useMemo(() => {
    return getActiveSemesterId(dashboard?.activeSemesters || []);
  }, [dashboard?.activeSemesters]);

  usePageTitle(t('title'));

  if (isInitialLoading) {
    return (
      <div key="dashboard-loading-skeleton" className="animate-in fade-in duration-100">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div key="dashboard-content" className="animate-in fade-in duration-200 space-y-4 lg:space-y-6">
      <WelcomeSection userName={user?.name || tCommon('roles.student')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {cards.map((cardItem, index) => (
          <StatCard key={`stat-${index}`} data={cardItem} loading={isInitialLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
        <div className="lg:col-span-8 h-full">
          <Suspense fallback={<ChartSkeleton />}>
            <AcademicResultsChart semesters={dashboard?.activeSemesters || []} semesterId={activeSemesterId} />
          </Suspense>
        </div>
        <div className="lg:col-span-4 h-full">
          <Suspense fallback={<ChartSkeleton />}>
            <LearningStatsCard Kpi={isInitialLoading ? undefined : dashboard?.kpi} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
        <div className="lg:col-span-8 h-full">
          <Suspense fallback={<ChartSkeleton />}>
            <EventCard events={isInitialLoading ? undefined : dashboard?.events} />
          </Suspense>
        </div>
        <div className="lg:col-span-4 h-full">
          <Suspense fallback={<ChartSkeleton />}>
            <ClassListCard currentSubjects={isInitialLoading ? undefined : dashboard?.currentSubjects} />
          </Suspense>
        </div>
      </div>
    </div>
  );
});
DashboardContent.displayName = "DashboardContent";

export default DashboardContent;
