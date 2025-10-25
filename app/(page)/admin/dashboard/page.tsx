'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  Settings, 
  Users, 
  Database, 
  Shield, 
  Bell, 
  BarChart3,
  LogOut,
  Save,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Cấu hình đã được lưu!');
    }, 1000);
  };

  const systemSettings: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    link?: string;
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
      id: 'general',
      title: 'Cài đặt chung',
      description: 'Cấu hình thông tin hệ thống cơ bản',
      icon: Settings,
      color: 'bg-blue-500'
    },
    {
      id: 'users',
      title: 'Quản lý người dùng',
      description: 'Quản lý tài khoản sinh viên, giảng viên',
      icon: Users,
      color: 'bg-green-500'
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
      color: 'bg-yellow-500'
    },
    {
      id: 'analytics',
      title: 'Báo cáo & Thống kê',
      description: 'Xem báo cáo và thống kê hệ thống',
      icon: BarChart3,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
                <p className="text-sm text-gray-500">Quản lý và cấu hình toàn bộ hệ thống</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Admin
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Thao tác nhanh</h2>
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Đang lưu...' : 'Lưu tất cả'}
            </Button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemSettings.map((setting) => {
            const IconComponent = setting.icon;
            const CardContent = (
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${setting.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {setting.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {setting.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full group-hover:bg-gray-50"
                  >
                    Cấu hình
                  </Button>
                </div>
              </div>
            );

            if (setting.link) {
              return (
                <Link key={setting.id} href={setting.link}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                    {CardContent}
                  </Card>
                </Link>
              );
            }

            return (
              <Card key={setting.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                {CardContent}
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái hệ thống</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Database: Hoạt động</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">API: Hoạt động</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Email: Hoạt động</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
