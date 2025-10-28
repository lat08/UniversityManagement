"use client"

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

export default function AdminDashboardContent() {
  usePageTitle('Bảng điều khiển - Admin')

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
      title: 'Cấu hình Theme',
      description: 'Tùy chỉnh màu sắc hệ thống real-time',
      icon: Settings,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      link: '/admin/theme-configuration'
    },
    {
      id: 'users',
      title: 'Quản lý người dùng',
      description: 'Quản lý tài khoản sinh viên, giảng viên',
      icon: Users,
      color: 'bg-green-500',
      link: '/admin/users'
    },
    {
      id: 'departments',
      title: 'Quản lý khoa',
      description: 'Quản lý các khoa và phòng ban',
      icon: Building2,
      color: 'bg-blue-500',
      link: '/admin/departments'
    },
    {
      id: 'courses',
      title: 'Quản lý khóa học',
      description: 'Quản lý các khóa học và môn học',
      icon: BookOpen,
      color: 'bg-indigo-500',
      link: '/admin/courses'
    },
    {
      id: 'database',
      title: 'Cơ sở dữ liệu',
      description: 'Backup, restore và bảo trì database',
      icon: Database,
      color: 'bg-purple-500'
    },
    {
      id: 'security',
      title: 'Bảo mật',
      description: 'Cài đặt bảo mật và phân quyền',
      icon: Shield,
      color: 'bg-red-500'
    },
    {
      id: 'notifications',
      title: 'Thông báo',
      description: 'Cấu hình hệ thống thông báo',
      icon: Bell,
      color: 'bg-yellow-500',
      link: '/admin/notifications'
    },
    {
      id: 'analytics',
      title: 'Báo cáo & Thống kê',
      description: 'Xem báo cáo và thống kê hệ thống',
      icon: BarChart3,
      color: 'bg-teal-500',
      link: '/admin/reports'
    }
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
          Bảng điều khiển Admin
        </h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          Quản lý và cấu hình toàn bộ hệ thống
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-500">Tổng sinh viên</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">1,245</p>
            </div>
            <div className="h-10 w-10 lg:h-12 lg:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-500">Tổng giảng viên</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">89</p>
            </div>
            <div className="h-10 w-10 lg:h-12 lg:w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-500">Tổng khóa học</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">156</p>
            </div>
            <div className="h-10 w-10 lg:h-12 lg:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-500">Tổng khoa</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div className="h-10 w-10 lg:h-12 lg:w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* System Settings Grid */}
      <div>
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
          Cấu hình hệ thống
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
                    Cấu hình
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
          Trạng thái hệ thống
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs lg:text-sm text-gray-600">Database: Hoạt động</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs lg:text-sm text-gray-600">API: Hoạt động</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs lg:text-sm text-gray-600">Email: Hoạt động</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

