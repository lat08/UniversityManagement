'use client';

import { Button } from '@/app/components/ui/button';
import { ScheduleResponse } from '@/lib/types/chat';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

interface ScheduleTableProps {
  data: ScheduleResponse['data'];
}

export function ScheduleTable({ data }: ScheduleTableProps) {
  const router = useRouter();
  const { weekNumber, dateRange, items } = data;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-green-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Lịch học tuần {weekNumber}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">{dateRange}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Thứ
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Tiết
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Môn học
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Phòng
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Giảng viên
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item, idx) => (
                <tr 
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-3 py-3 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{item.dayOfWeek}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.date}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {item.period}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.courseName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.courseCode}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      {item.room}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      {item.instructor}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          📚 <strong>{items.length}</strong> buổi học trong tuần này
        </p>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => router.push('/student/schedule')}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        📅 Xem lịch học đầy đủ
      </Button>
    </div>
  );
}
