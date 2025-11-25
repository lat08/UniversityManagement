"use client"

import { useTranslations } from "next-intl"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { 
  Settings, 
  Users, 
  Database, 
  Shield, 
  Bell, 
  BarChart3,
  BookOpen,
  Building2,
} from "lucide-react"
import Link from "next/link"
import React from 'react';
import { StatsCard } from '../statsCard';
import { PendingTaskCard } from '../pendingTaskCard';
import { RecentUpdateCard } from '../recentUpdateCard';
import { QuickActionButton } from '../quickActionButton';
import { DashboardStats, PendingTask, RecentUpdate, QuickAction } from '../../lib/types/types';

export default function AdminDashboardContent() {
  const t = useTranslations('admin.dashboard')
  usePageTitle(t('title'))

  // Generate mock data with translations
  const mockDashboardStats: DashboardStats[] = [
    {
      id: '1',
      title: t('stats.totalStudents'),
      value: 2847,
      description: t('stats.totalStudentsDesc'),
      color: 'green' as const,
    },
    {
      id: '2',
      title: t('stats.totalInstructors'),
      value: 156,
      description: t('stats.totalInstructorsDesc'),
      color: 'blue' as const,
    },
    {
      id: '3',
      title: t('stats.totalClasses'),
      value: 89,
      description: t('stats.totalClassesDesc'),
      color: 'red' as const,
    },
    {
      id: '4',
      title: t('stats.totalSubjects'),
      value: 234,
      description: t('stats.totalSubjectsDesc'),
      color: 'orange' as const,
    },
  ];

  const mockPendingTasks: PendingTask[] = [
    {
      id: '1',
      title: t('tasks.roomRequest'),
      description: t('tasks.roomRequestDesc'),
      link: '/admin/room-requests',
    },
    {
      id: '2',
      title: t('tasks.courseRegistration'),
      description: t('tasks.courseRegistrationDesc'),
      link: '/admin/course-registration',
    },
    {
      id: '3',
      title: t('tasks.examSchedule'),
      description: t('tasks.examScheduleDesc'),
      link: '/admin/exam-schedule',
    },
  ];

  const mockRecentUpdates: RecentUpdate[] = [
    {
      id: '1',
      title: t('updates.tuitionDeadline'),
      description: t('updates.tuitionDeadlineDesc'),
      timestamp: t('updates.timestamp1'),
      link: '/admin/tuition',
    },
    {
      id: '2',
      title: t('updates.examSchedule'),
      description: t('updates.examScheduleDesc'),
      timestamp: t('updates.timestamp2'),
      link: '/admin/exam-schedule',
    },
    {
      id: '3',
      title: t('updates.courseRegistration'),
      description: t('updates.courseRegistrationDesc'),
      timestamp: t('updates.timestamp3'),
      link: '/admin/course-registration',
    },
  ];

  const systemSettings: Array<{
    id: string
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    link?: string
  }> = [
    {
      id: 'theme',
      title: t('themeConfig'),
      description: t('themeConfigDesc'),
      icon: Settings,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      link: '/admin/theme-configuration'
    },
    {
      id: 'users',
      title: t('userManagement'),
      description: t('userManagementDesc'),
      icon: Users,
      color: 'bg-green-500',
      link: '/admin/users'
    },
    {
      id: 'departments',
      title: t('departmentManagement'),
      description: t('departmentManagementDesc'),
      icon: Building2,
      color: 'bg-blue-500',
      link: '/admin/departments'
    },
    {
      id: 'courses',
      title: t('courseManagement'),
      description: t('courseManagementDesc'),
      icon: BookOpen,
      color: 'bg-indigo-500',
      link: '/admin/courses'
    },
    {
      id: 'database',
      title: t('database'),
      description: t('databaseDesc'),
      icon: Database,
      color: 'bg-purple-500'
    },
    {
      id: 'security',
      title: t('security'),
      description: t('securityDesc'),
      icon: Shield,
      color: 'bg-red-500'
    },
    {
      id: 'notifications',
      title: t('notifications'),
      description: t('notificationsDesc'),
      icon: Bell,
      color: 'bg-yellow-500',
      link: '/admin/notifications'
    },
    {
      id: 'analytics',
      title: t('analytics'),
      description: t('analyticsDesc'),
      icon: BarChart3,
      color: 'bg-teal-500',
      link: '/admin/reports'
    }
  ]

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: t('addUser'),
      icon: 'user-plus',
      action: () => console.log(t('addUser')),
      color: 'primary',
    },
    {
      id: '2',
      title: t('openClass'),
      icon: 'book-open',
      action: () => console.log(t('openClass')),
      color: 'secondary',
    },
    {
      id: '3',
      title: t('publishSchedule'),
      icon: 'calendar',
      action: () => console.log(t('publishSchedule')),
      color: 'success',
    },
    {
      id: '4',
      title: t('sendNotification'),
      icon: 'bell',
      action: () => console.log(t('sendNotification')),
      color: 'warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('title')}
        </h1>
        <p className="text-gray-600 mt-1">{t('welcome')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockDashboardStats.map((stat) => (
          <StatsCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks - 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('pendingTasks')}
            </h2>
            <div className="space-y-3">
              {mockPendingTasks.map((task) => (
                <PendingTaskCard
                  key={task.id}
                  task={task}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Updates - 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('recentUpdates')}
            </h2>
            <div className="space-y-3">
              {mockRecentUpdates.map((update) => (
                <RecentUpdateCard key={update.id} update={update} />
              ))}
            </div>
            <button className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {t('viewAll')}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <QuickActionButton key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* System Settings Grid */}
      <div>
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
          {t('systemSettings')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {systemSettings.map((setting) => {
            const IconComponent = setting.icon
            const CardContent = (
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${setting.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1">
                    {setting.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 mb-3 line-clamp-2">
                    {setting.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-xs lg:text-sm group-hover:bg-gray-50"
                  >
                    {t('configure')}
                  </Button>
                </div>
              </div>
            )

            if (setting.link) {
              return (
                <Link key={setting.id} href={setting.link}>
                  <Card className="p-4 lg:p-6 hover:shadow-lg transition-shadow cursor-pointer group h-full">
                    {CardContent}
                  </Card>
                </Link>
              )
            }

            return (
              <Card key={setting.id} className="p-4 lg:p-6 hover:shadow-lg transition-shadow cursor-pointer group h-full">
                {CardContent}
              </Card>
            )
          })}
        </div>
      </div>

      {/* System Status */}
      <Card className="p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
          {t('systemStatus')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs lg:text-sm text-gray-600">{t('database')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs lg:text-sm text-gray-600">{t('api')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs lg:text-sm text-gray-600">{t('email')}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

