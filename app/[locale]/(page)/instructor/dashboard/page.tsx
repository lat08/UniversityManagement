"use client";

import { Suspense, lazy, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { useAuthStore } from "@/lib/store/authStore";
import DashboardStatCard from "./components/DashboardStatCard";
import { DashboardSkeleton } from "./components/dashboard-skeleton";
import { DashboardStatCard as DashboardStatCardType } from "./lib/types/types";
import { useDashboard } from "./lib/hooks/useDashboard";
import { useDashboardRealtime } from "./lib/hooks/useDashboardRealtime";

const WeeklyScheduleTimeline = lazy(() => import("./components/WeeklyScheduleTimeline"));
const RemindersSection = lazy(() => import("./components/RemindersSection"));

export default function InstructorDashboardPage() {
  const t = useTranslations('instructor.dashboard');
  const tCommon = useTranslations('common');
  usePageTitle(t('title'));
  useDashboardRealtime({ enabled: true });

  const router = useRouter();
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading } = useDashboard();

  const stats = useMemo((): DashboardStatCardType[] => {
    if (!dashboardData) {
      return [
        {
          title: t('teachingClasses'),
          value: 0,
          subtitle: '',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-600',
          iconType: 'class' as const,
          onClick: () => router.push('/instructor/schedule/semester'),
        },
        {
          title: t('documentsThisWeek'),
          value: 0,
          subtitle: t('totalDocuments', { count: 0 }),
          bgColor: 'bg-pink-50',
          iconColor: 'text-pink-600',
          textColor: 'text-pink-600',
          iconType: 'document' as const,
          onClick: () => router.push('/instructor/materials'),
        },
        {
          title: t('pendingRequests'),
          value: 0,
          subtitle: t('noNewRequests'),
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-600',
          iconType: 'request' as const,
          onClick: () => router.push('/instructor/grades'),
        },
      ];
    }

    const documentsSubtitle = t('totalDocuments', { count: dashboardData.documents.totalDocuments });

    const requestsSubtitle = dashboardData.requests.newRequestsToday > 0
      ? t('newRequests', { count: dashboardData.requests.newRequestsToday })
      : t('noNewRequests');

    return [
      {
        title: t('teachingClasses'),
        value: dashboardData.totalClasses,
        subtitle: dashboardData.currentSemester,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-600',
        iconType: 'class' as const,
        onClick: () => router.push('/instructor/schedule/semester'),
      },
      {
        title: t('documentsThisWeek'),
        value: dashboardData.documents.newDocumentsThisWeek,
        subtitle: documentsSubtitle,
        bgColor: 'bg-pink-50',
        iconColor: 'text-pink-600',
        textColor: 'text-pink-600',
        iconType: 'document' as const,
        onClick: () => router.push('/instructor/materials'),
      },
      {
        title: t('pendingRequests'),
        value: dashboardData.requests.totalRequests,
        subtitle: requestsSubtitle,
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-600',
        iconType: 'request' as const,
        onClick: () => router.push('/instructor/grades'),
      },
    ];
  }, [dashboardData, router, t]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          {t('welcome', { name: user?.name || tCommon('roles.instructor') })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {stats.map((stat, index) => (
          <DashboardStatCard key={index} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm min-h-[400px]">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('weeklySchedule')}
              </h2>
              <Link 
                href="/instructor/schedule/semester"
                className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
              >
                {t('semesterSchedule')}
              </Link>
            </div>
            {dashboardData && dashboardData.weeklySchedule.length > 0 ? (
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500 text-sm">{t('loadingSchedule')}</p>
                </div>
              }>
                <WeeklyScheduleTimeline schedules={dashboardData.weeklySchedule} />
              </Suspense>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm">{t('noSchedule')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <Suspense fallback={
            <div className="bg-[#DBEDFF] rounded-lg p-4 lg:p-6 min-h-[400px] border-2 border-[#4196F0]">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/50">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          }>
            {dashboardData ? (
              <RemindersSection reminders={dashboardData.reminders} />
            ) : (
              <RemindersSection reminders={[]} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
