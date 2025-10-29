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
              className="border border-blue-700 shadow shadow-md p-4 rounded-sm border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm lg:text-base font-bold text-blue-800/90 flex-1">
                  {classInfo.subjectName}
                </h4>
                <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  {classInfo.subjectCode}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{classInfo.instructorName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{classInfo.scheduleSummary}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          // ✅ Nếu không có lớp học
          <div className="p-4 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
              <Info className="w-5 h-5 text-gray-400" />
              <p className="text-sm">Không có lớp học nào.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
