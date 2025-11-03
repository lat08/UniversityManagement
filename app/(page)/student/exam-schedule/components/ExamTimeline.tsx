"use client";

import { Eye } from "lucide-react";
import { Exam } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";
import { useRef } from "react";

interface ExamTimelineProps {
  exams: Exam[];
}

export default function ExamTimeline({ exams }: ExamTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element) return;

    const isScrollingDown = e.deltaY > 0;
    const isAtTop = element.scrollTop === 0;
    const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    if ((isAtTop && !isScrollingDown) || (isAtBottom && isScrollingDown)) {
      e.preventDefault();
    }
  };
  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'Đã thi':
        return 'bg-white border-[#1B6E53]';
      case 'Sắp tới':
        return 'bg-white border-[#B41E14]';
      case 'Chưa tới':
        return 'bg-white border-[#757575]';
      default:
        return 'bg-white border-[#757575]';
    }
  };

  const getCardBorderColor = (status: Exam['status']) => {
    switch (status) {
      case 'Đã thi':
        return 'border-[#1B6E53] bg-[#1B6E53]/5';
      case 'Sắp tới':
        return 'border-[#B41E14] bg-[#B41E14]/5';
      case 'Chưa tới':
        return 'border-[#757575] bg-[#757575]/5';
      default:
        return 'border-[#757575] bg-[#757575]/5';
    }
  };

  const getDateColor = (status: Exam['status']) => {
    switch (status) {
      case 'Đã thi':
        return 'text-[#1B6E53]';
      case 'Sắp tới':
        return 'text-[#B41E14]';
      case 'Chưa tới':
        return 'text-[#757575]';
      default:
        return 'text-[#757575]';
    }
  };

  return (
    <div 
      ref={scrollRef}
      onWheel={handleWheel}
      className="relative max-h-[600px] overflow-y-auto pr-2 overscroll-contain"
    >
      <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-3 lg:space-y-4">
        {exams.map((exam) => (
          <div key={exam.id} className="relative pl-8 lg:pl-10">
            <div className={cn(
              "absolute left-[0px] top-3 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10",
              getStatusColor(exam.status)
            )} />

            <div className={cn(
              "p-3 lg:p-4 rounded-lg border-2 transition-all hover:shadow-md",
              getCardBorderColor(exam.status)
            )}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-xs lg:text-sm font-bold mb-1",
                    getDateColor(exam.status)
                  )}>
                    {exam.examDate} - {exam.examTimeDuration}
                  </div>

                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="text-sm lg:text-base font-bold text-gray-900">
                      {exam.subjectNameCode}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs lg:text-sm text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{exam.roomCode}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{exam.studentCount} SV</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{exam.examFormat}</span>
                    </div>
                  </div>
                </div>

                {(exam.status === 'Chưa tới' || exam.status === 'Sắp tới') && (
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                    <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

