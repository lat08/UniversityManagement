"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { User, Clock, Info } from "lucide-react";
import { ClassListData } from "../libs/types/types";

export default function ClassListCard({ currentSubjects }: ClassListData) {
  const hasClasses = currentSubjects && currentSubjects.length > 0;

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm lg:text-base font-semibold">
            Lớp đang theo học
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 max-h-[400px] overflow-y-auto">
        {/* ✅ Nếu có lớp */}
        {hasClasses ? (
          currentSubjects.map((classInfo) => (
            <div
              key={classInfo.courseId}
              className="border border-[var(--classlist-border)] shadow shadow-md p-4 rounded-sm hover:border-[var(--primary)] hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm lg:text-base font-bold text-[var(--classlist-title)] flex-1">
                  {classInfo.subjectName}
                </h4>
                <span className="text-xs font-medium text-[var(--classlist-badge-text)] px-2 py-1 bg-[var(--classlist-badge-bg)] rounded">
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
                  <span>{classInfo.scheduleSummary}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          // ✅ Nếu không có lớp học
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
}
