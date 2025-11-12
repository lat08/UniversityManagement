"use client";

import { Award, Book, CheckCircle } from "lucide-react";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { useMemo } from "react";

interface GradeStatsCardsProps {
  gpa4: number;
  totalCredits: number;
  completedCourses: number;
  totalRequiredCredits: number;
}

export const GradeStatsCards = ({
  gpa4,
  totalCredits,
  completedCourses,
  totalRequiredCredits,
}: GradeStatsCardsProps) => {
  const gpaCount = useCountUp(gpa4, { duration: 1200, start: 0 });
  const totalCreditsCount = useCountUp(totalCredits, { duration: 1200, start: 0 });
  const completedCoursesCount = useCountUp(completedCourses, { duration: 1200, start: 0 });

  const gpaDisplay = useMemo(() => gpaCount.toFixed(2), [gpaCount]);
  const totalCreditsDisplay = useMemo(() => `${totalCreditsCount}`, [totalCreditsCount]);
  const completedCoursesDisplay = useMemo(() => `${completedCoursesCount}`, [completedCoursesCount]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFDDAA] rounded-bl-[100%]">
          <div className="absolute top-5 right-5">
            <Award className="w-6 h-6 text-[#CC8800] flex-shrink-0" strokeWidth={2} />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">Điểm trung bình</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{gpaDisplay}</p>
        <p className="text-xs sm:text-sm text-gray-600 relative z-10">GPA 4.0</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFBBAA] rounded-bl-[100%]">
          <div className="absolute top-5 right-5">
            <Book className="w-6 h-6 text-[#CC4444] flex-shrink-0" strokeWidth={2} />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">Tổng tín chỉ hoàn thành</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{totalCreditsDisplay}</p>
        <p className="text-xs sm:text-sm text-gray-600 relative z-10">/{totalRequiredCredits} tín chỉ</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#CCEECC] rounded-bl-[100%]">
          <div className="absolute top-5 right-5">
            <CheckCircle className="w-6 h-6 text-[#44AA44] flex-shrink-0" strokeWidth={2} />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">Môn đã hoàn thành</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{completedCoursesDisplay}</p>
        <p className="text-xs sm:text-sm text-gray-600 relative z-10">môn học</p>
      </div>
    </div>
  );
};
