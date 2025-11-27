"use client";

import { Exam } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";
import { memo } from "react";
import { useTranslations } from "next-intl";
import { getExamStatusVariant } from "../lib/utils/examUtils";

interface ExamTimelineProps {
  exams: Exam[];
  loading?: boolean;
}

const statusStyles = {
  completed: {
    dot: 'bg-white border-[#1B6E53]',
    card: 'border-[#1B6E53] bg-[#1B6E53]/5',
    date: 'text-[#1B6E53]',
  },
  upcoming: {
    dot: 'bg-white border-[#B41E14]',
    card: 'border-[#B41E14] bg-[#B41E14]/5',
    date: 'text-[#B41E14]',
  },
  pending: {
    dot: 'bg-white border-[#E6A400]',
    card: 'border-[#E6A400] bg-[#E6A400]/5',
    date: 'text-[#E6A400]',
  },
  other: {
    dot: 'bg-white border-[#757575]',
    card: 'border-[#757575] bg-[#757575]/5',
    date: 'text-[#757575]',
  },
} as const;

const ExamTimeline = memo(function ExamTimeline({ exams, loading = false }: ExamTimelineProps) {
  const t = useTranslations('student.examSchedule');

  const getStyle = (status: Exam['status']) => {
    const variant = getExamStatusVariant(status);
    return statusStyles[variant] || statusStyles.other;
  };

  if (loading) {
    return (
      <div className="relative max-h-[600px] overflow-hidden pr-2">
        <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-3 lg:space-y-4 pt-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="relative animate-pulse pl-8 lg:pl-10">
              <div className="absolute left-[0px] top-3 z-10 h-5 w-5 rounded-full border-4 border-white bg-gray-300 shadow-sm" />
              <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
                <div className="mb-2 h-4 w-48 rounded bg-gray-200" />
                <div className="mb-3 h-5 w-40 rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-56 rounded bg-gray-200" />
                  <div className="h-4 w-40 rounded bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-500">{t('sections.timeline.empty')}</p>
      </div>
    );
  }

  return (
    <div className="relative max-h-[500px] overflow-y-auto pr-2 overscroll-contain">
      <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-3 lg:space-y-4">
        {exams.map((exam) => (
          <div key={exam.id} className="relative pl-8 lg:pl-10">
            <div className={cn(
              "absolute left-[0px] top-3 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10",
              getStyle(exam.status).dot
            )} />

            <div className={cn(
              "p-3 lg:p-4 rounded-lg border-2 transition-all hover:shadow-md",
              getStyle(exam.status).card
            )}>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-xs lg:text-sm font-bold mb-1",
                  getStyle(exam.status).date
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
                    <span>{t('timeline.room', { room: exam.roomCode })}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{t('timeline.studentCount', { count: exam.studentCount })}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{t('timeline.format', { format: exam.examFormat })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ExamTimeline;

