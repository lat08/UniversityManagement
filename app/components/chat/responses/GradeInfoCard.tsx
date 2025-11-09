'use client';

import { Button } from '@/app/components/ui/button';
import { GradeInfoData } from '@/lib/types/chat';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, BookOpen } from 'lucide-react';

interface GradeInfoCardProps {
  data: GradeInfoData;
}

export function GradeInfoCard({ data }: GradeInfoCardProps) {
  const router = useRouter();
  const { gpa, totalCredits, semester } = data;

  // Chart data
  const chartData = [
    { name: 'GPA', value: gpa, max: 4.0 }
  ];

  // Determine color based on GPA
  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.6) return '#10b981'; // green
    if (gpa >= 3.2) return '#3b82f6'; // blue
    if (gpa >= 2.5) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getGPALabel = (gpa: number) => {
    if (gpa >= 3.6) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung bình';
    return 'Yếu';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-blue-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Thông tin điểm tích lũy
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* GPA Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">GPA tích lũy</span>
          </div>
          <div className="flex items-end gap-2">
            <span 
              className="text-3xl font-bold" 
              style={{ color: getGPAColor(gpa) }}
            >
              {gpa.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 mb-1">/4.0</span>
          </div>
          <span 
            className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded"
            style={{ 
              backgroundColor: getGPAColor(gpa) + '20',
              color: getGPAColor(gpa)
            }}
          >
            {getGPALabel(gpa)}
          </span>
        </div>

        {/* Credits Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Tín chỉ tích lũy</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {totalCredits}
            </span>
            <span className="text-sm text-gray-500 mb-1">TC</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            {semester || 'Tất cả học kỳ'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}/4.0`, 'Điểm']}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              <Cell fill={getGPAColor(gpa)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => router.push('/student/grades')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        📊 Xem chi tiết bảng điểm
      </Button>
    </div>
  );
}
