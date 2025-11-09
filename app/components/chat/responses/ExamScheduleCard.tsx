'use client';

import { Button } from '@/app/components/ui/button';
import { ExamScheduleResponse } from '@/lib/types/chat';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, FileText, AlertCircle } from 'lucide-react';

interface ExamScheduleCardProps {
  data: ExamScheduleResponse['data'];
}

export function ExamScheduleCard({ data }: ExamScheduleCardProps) {
  const router = useRouter();
  const { items } = data;

  // Get status color
  const getStatusColor = (status: string) => {
    if (status === 'Đã thi') return 'text-gray-500';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getFormatIcon = (format: string) => {
    if (format.includes('Thực hành')) return '💻';
    if (format.includes('Vấn đáp')) return '💬';
    if (format.includes('Trắc nghiệm')) return '📝';
    return '📄';
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-orange-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Lịch thi sắp tới
        </h3>
      </div>

      {/* Exam List */}
      <div className="space-y-3 mb-4">
        {items.map((exam, idx) => (
          <div 
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            {/* Course Name */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                  {exam.courseName}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {exam.courseCode}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(exam.status)}`}>
                {exam.status}
              </span>
            </div>

            {/* Exam Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{exam.date}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  {exam.time} ({exam.duration}p)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Phòng {exam.room}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  {getFormatIcon(exam.format)} {exam.format}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-3 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <p className="text-sm text-orange-900 dark:text-orange-300">
            <strong>{items.length}</strong> môn thi sắp tới
          </p>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => router.push('/student/exam-schedule')}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        size="sm"
      >
        📅 Xem lịch thi đầy đủ
      </Button>
    </div>
  );
}
