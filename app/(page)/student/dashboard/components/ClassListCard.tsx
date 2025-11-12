"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { User, Clock, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ClassListData } from "../libs/types/types";

const DAYS_OF_WEEK = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

const formatSchedule = (dayOfWeek: number, startPeriod: number, endPeriod: number): string => {
  const dayName = DAYS_OF_WEEK[dayOfWeek] || "Không xác định";
  return `${dayName}, Tiết ${startPeriod} -> ${endPeriod}`;
};

const ClassListCard = memo(({ currentSubjects }: ClassListData) => {
  const router = useRouter();
  const hasClasses = currentSubjects && currentSubjects.length > 0;
  const isLoading = !currentSubjects;

  const handleClassClick = (subjectCode: string, semesterId?: string) => {
    if (!semesterId) return;
    router.push(`/student/schedule/semester?semesterId=${semesterId}&highlightSubject=${subjectCode}`);
  };

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm lg:text-base font-semibold">Lớp đang theo học</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 p-4 rounded-sm">
                <div className="flex justify-between mb-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hasClasses ? (
          currentSubjects.map((classInfo, index) => (
            <div
              key={`${classInfo.courseId}-${classInfo.subjectCode}-${index}`}
              role="button"
              tabIndex={0}
              onClick={() => handleClassClick(classInfo.subjectCode, classInfo.semesterId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClassClick(classInfo.subjectCode, classInfo.semesterId);
                }
              }}
              className="border border-[var(--classlist-border)] shadow shadow-md p-4 rounded-sm hover:border-[var(--primary)] hover:shadow-lg transition-all animate-fade-up cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm lg:text-base font-bold text-[var(--classlist-title)] flex-1">
                  {classInfo.subjectName}
                </h4>
                <span className="inline-flex items-center justify-center text-xs font-medium text-[var(--classlist-badge-text)] px-2 py-1 bg-[var(--classlist-badge-bg)] rounded">
                  {classInfo.subjectCode}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--classlist-text)]">
                  <User className="w-4 h-4 text-[var(--classlist-icon)]" />
                  <span>{classInfo.instructorName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--classlist-text)]">
                  <Clock className="w-4 h-4 text-[var(--classlist-icon)]" />
                  <span>{formatSchedule(classInfo.dayOfWeek, classInfo.startPeriod, classInfo.endPeriod)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center border border-dashed border-[var(--classlist-empty-border)] rounded-lg bg-[var(--classlist-empty-bg)]">
            <div className="flex flex-col items-center justify-center space-y-2 text-[var(--classlist-empty-text)]">
              <Info className="w-5 h-5 text-[var(--classlist-empty-icon)]" />
              <p className="text-sm">Không có lớp học nào.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
ClassListCard.displayName = "ClassListCard";

export default ClassListCard;