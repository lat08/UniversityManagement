"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { useAuthStore } from "@/lib/store/authStore";
import DashboardStatCard from "./components/DashboardStatCard";
import WeeklyScheduleTimeline from "./components/WeeklyScheduleTimeline";
import RemindersSection from "./components/RemindersSection";
import { DashboardStatCard as DashboardStatCardType } from "./lib/types/types";
import { useDashboard } from "./lib/hooks/useDashboard";

export default function InstructorDashboardPage() {
  usePageTitle('Bảng điều khiển');

  const { user } = useAuthStore();
  const { dashboard: dashboardData, loading } = useDashboard();

  const stats = useMemo((): DashboardStatCardType[] => {
    if (!dashboardData) {
      return [
        {
          title: 'Lớp giảng dạy',
          value: 0,
          subtitle: '',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-600',
        },
        {
          title: 'Tài liệu tuần này',
          value: 0,
          subtitle: '0 tài liệu mới',
          bgColor: 'bg-pink-50',
          iconColor: 'text-pink-600',
          textColor: 'text-pink-600',
        },
        {
          title: 'Yêu cầu chờ duyệt',
          value: 0,
          subtitle: '0 yêu cầu mới',
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-600',
        },
      ];
    }

    const documentsSubtitle = dashboardData.documents.newDocumentsThisWeek > 0
      ? `${dashboardData.documents.newDocumentsThisWeek} tài liệu mới`
      : '0 tài liệu mới';

    const requestsSubtitle = dashboardData.requests.newRequestsToday > 0
      ? `${dashboardData.requests.newRequestsToday} yêu cầu mới`
      : '0 yêu cầu mới';

    return [
      {
        title: 'Lớp giảng dạy',
        value: dashboardData.totalClasses,
        subtitle: dashboardData.currentSemester,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-600',
      },
      {
        title: 'Tài liệu tuần này',
        value: dashboardData.documents.totalDocuments,
        subtitle: documentsSubtitle,
        bgColor: 'bg-pink-50',
        iconColor: 'text-pink-600',
        textColor: 'text-pink-600',
      },
      {
        title: 'Yêu cầu chờ duyệt',
        value: dashboardData.requests.totalRequests,
        subtitle: requestsSubtitle,
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-600',
      },
    ];
  }, [dashboardData]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          Chào mừng trở lại, {user?.name || 'Giảng viên'}!
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
                Lịch dạy trong tuần
              </h2>
              <Link 
                href="/instructor/schedule/weekly"
                className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Xem tuần
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 text-sm">Đang tải lịch dạy...</p>
              </div>
            ) : dashboardData && dashboardData.weeklySchedule.length > 0 ? (
              <WeeklyScheduleTimeline schedules={dashboardData.weeklySchedule} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm">Chưa có lịch dạy nào</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          {dashboardData ? (
            <RemindersSection reminders={dashboardData.reminders} />
          ) : (
            <RemindersSection reminders={[]} />
          )}
        </div>
      </div>
    </div>
  );
}
