"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { Button } from "@/app/components/ui/button"
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCard } from '../statsCard';
import { PendingTaskCard } from '../pendingTaskCard';
import { RecentUpdateCard } from '../recentUpdateCard';
import { QuickActionButton } from '../quickActionButton';
import type { DashboardStats, PendingTask, RecentUpdate, QuickAction } from '../../lib/types/types';
import { useAdminDashboard } from '../../lib/hooks/useAdminDashboard';
import type { AdminDashboardRecentUpdate } from '@/lib/types/admin-dashboard';
import { format } from "date-fns";

export default function AdminDashboardContent() {
  const t = useTranslations('admin.dashboard')
  const locale = useLocale();
  usePageTitle(t('title'))

  const router = useRouter();

  const { data } = useAdminDashboard();

  const stats: DashboardStats[] = useMemo(() => {
    if (!data) {
      return [];
    }

    // Tính số giảng viên mới trong năm (current - last year)
    const newInstructorsCount = Math.max(
      0,
      (data.instructorStatistic.currentYearInstructors ?? 0) -
        (data.instructorStatistic.lastYearInstructors ?? 0)
    );

    // Format growth rate với dấu + nếu dương
    const formatGrowthRate = (rate: number): string => {
      const rounded = Math.round(rate * 100) / 100;
      return rounded > 0 ? `+${rounded}` : `${rounded}`;
    };

    const studentGrowthRate = data.studentStatistic.growthRate ?? 0;

    return [
      {
        id: '1',
        title: t('stats.totalStudents'),
        value: data.summary.totalStudents ?? 0,
        description: t('stats.totalStudentsDesc', {
          value: formatGrowthRate(studentGrowthRate),
        }),
        color: 'green',
      },
      {
        id: '2',
        title: t('stats.totalInstructors'),
        value: data.summary.totalInstructors ?? 0,
        description: t('stats.totalInstructorsDesc', {
          newCount: newInstructorsCount,
        }),
        color: 'blue',
      },
      {
        id: '3',
        title: t('stats.totalClasses'),
        value: data.summary.totalCourseClassesThisSemester ?? data.summary.totalClasses ?? 0,
        description: t('stats.totalClassesDesc'),
        color: 'red',
      },
      {
        id: '4',
        title: t('stats.totalSubjects'),
        value: data.summary.totalSubjects ?? 0,
        description: t('stats.totalSubjectsDesc'),
        color: 'orange',
      },
    ];
  }, [data, t]);

  const pendingTasks: PendingTask[] = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        id: 'roomRequests',
        title: t('tasks.roomRequest'),
        description: t('tasks.roomRequestDesc', {
          count: data.roomRequestPendingCount,
        }),
        link: '/admin/room-requests',
      },
      {
        id: 'gradeApprovals',
        title: t('tasks.gradeApproval'),
        description: t('tasks.gradeApprovalDesc', {
          count: data.gradeApprovalPendingCount,
        }),
        link: '/admin/exam-approval',
      },
      {
        id: 'scheduleChanges',
        title: t('tasks.scheduleChange'),
        description: t('tasks.scheduleChangeDesc', {
          count: data.scheduleChangePendingCount,
        }),
        link: '/admin/instructor-schedule-change',
      },
    ];
  }, [data, t]);

  const recentUpdates: RecentUpdate[] = useMemo(() => {
    if (!data) {
      return [];
    }

    const mapUpdate = (update: AdminDashboardRecentUpdate): RecentUpdate => ({
      id: update.id,
      title: update.title,
      description: update.description,
      timestamp: format(new Date(update.createdAt), 'dd/MM/yyyy'),
      link: update.link ?? undefined,
    });

    return data.recentUpdates.map(mapUpdate);
  }, [data]);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'add-student',
      title: t('quickAddStudent'),
      icon: 'user-plus',
      action: () => router.push(`/${locale}/admin/student-profile?action=addStudent`),
      color: 'primary',
    },
    {
      id: 'add-instructor',
      title: t('quickAddInstructor'),
      icon: 'user-plus',
      action: () => router.push(`/${locale}/admin/instructor-profile?action=addInstructor`),
      color: 'secondary',
    },
    {
      id: 'open-class',
      title: t('openClass'),
      icon: 'book-open',
      action: () => router.push(`/${locale}/admin/course-management?action=openClass`),
      color: 'success',
    },
    {
      id: 'publish-exam-schedule',
      title: t('publishExamSchedule'),
      icon: 'calendar',
      action: () => router.push(`/${locale}/admin/exam-schedule-management?action=add`),
      color: 'warning',
    },
    {
      id: 'send-notification',
      title: t('sendNotification'),
      icon: 'bell',
      action: () => router.push(`/${locale}/admin/notification-management?action=create`),
      color: 'primary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Pending Tasks - 2 columns */}
        <div className="lg:col-span-2 h-full">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('pendingTasks')}
            </h2>
            <div className="space-y-3 flex-1">
              {pendingTasks.map((task) => (
                <PendingTaskCard
                  key={task.id}
                  task={task}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Updates - 1 column */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('recentUpdates')}
            </h2>
            <div className="space-y-3 flex-1">
              {recentUpdates.map((update) => (
                <RecentUpdateCard key={update.id} update={update} />
              ))}
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => router.push('/admin/regulations')}
            >
              {t('viewAll')}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <QuickActionButton key={action.id} action={action} />
          ))}
        </div>
      </div>
    </div>
  )
}

