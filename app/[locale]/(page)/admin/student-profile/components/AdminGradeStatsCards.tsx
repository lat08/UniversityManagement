"use client";

import { Award, Book, CheckCircle, TrendingUp } from "lucide-react";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

interface AdminGradeStatsCardsProps {
  gpa10: number;
  gpa4: number;
  totalCredits: number;
  completedCourses: number;
  totalRequiredCredits: number;
}

export const AdminGradeStatsCards = ({
  gpa10,
  gpa4,
  totalCredits,
  completedCourses,
  totalRequiredCredits,
}: AdminGradeStatsCardsProps) => {
  const t = useTranslations("admin.studentProfile.gradeStats");
  const gpa10Count = useCountUp(gpa10, { duration: 1200, start: 0 });
  const gpa4Count = useCountUp(gpa4, { duration: 1200, start: 0 });
  const totalCreditsCount = useCountUp(totalCredits, { duration: 1200, start: 0 });
  const completedCoursesCount = useCountUp(completedCourses, { duration: 1200, start: 0 });

  const gpa10Display = useMemo(() => gpa10Count.toFixed(2), [gpa10Count]);
  const gpa4Display = useMemo(() => gpa4Count.toFixed(2), [gpa4Count]);
  const totalCreditsDisplay = useMemo(() => `${totalCreditsCount}`, [totalCreditsCount]);
  const completedCoursesDisplay = useMemo(() => `${completedCoursesCount}`, [completedCoursesCount]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden border border-gray-200">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-bl-[100%]">
          <div className="absolute top-5 right-5">
            <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0" strokeWidth={2} />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">{t("gpa10")}</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{gpa10Display}</p>
        <p className="text-xs sm:text-sm text-gray-600 relative z-10">/10.0</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden border border-gray-200">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFDDAA] rounded-bl-[100%]">
          <div className="absolute top-5 right-5">
            <Award className="w-6 h-6 text-[#CC8800] flex-shrink-0" strokeWidth={2} />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">{t("gpa4")}</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{gpa4Display}</p>
        <p className="text-xs sm:text-sm text-gray-600 relative z-10">/4.0</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden border border-gray-200">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFBBAA] rounded-bl-[100%]">
          <div className="absolute top-5 right-5">
            <Book className="w-6 h-6 text-[#CC4444] flex-shrink-0" strokeWidth={2} />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">{t("totalCredits")}</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{totalCreditsDisplay}</p>
        <p className="text-xs sm:text-sm text-gray-600 relative z-10">
          {t("requiredCredits", { count: totalRequiredCredits })}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden border border-gray-200">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#CCEECC] rounded-bl-[100%]">
          <div className="absolute top-5 right-5">
            <CheckCircle className="w-6 h-6 text-[#44AA44] flex-shrink-0" strokeWidth={2} />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">{t("completedCourses")}</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{completedCoursesDisplay}</p>
        <p className="text-xs sm:text-sm text-gray-600 relative z-10">{t("courseUnit")}</p>
      </div>
    </div>
  );
};
