"use client";

import { Eye } from "lucide-react";
import { Exam } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";

interface ExamTimelineProps {
  exams: Exam[];
}

export default function ExamTimeline({ exams }: ExamTimelineProps) {
  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-white border-[#1B6E53]';
      case 'today':
        return 'bg-white border-[#B41E14]';
      case 'upcoming':
        return 'bg-white border-[#757575]';
      default:
        return 'bg-white border-[#757575]';
    }
  };

  const getCardBorderColor = (status: Exam['status']) => {
    switch (status) {
      case 'completed':
        return 'border-[#1B6E53] bg-[#1B6E53]/5';
      case 'today':
        return 'border-[#B41E14] bg-[#B41E14]/5';
      case 'upcoming':
        return 'border-[#757575] bg-[#757575]/5';
      default:
        return 'border-[#757575] bg-[#757575]/5';
    }
  };

  const getDateColor = (status: Exam['status']) => {
    switch (status) {
      case 'completed':
        return 'text-[#1B6E53]';
      case 'today':
        return 'text-[#B41E14]';
      case 'upcoming':
        return 'text-[#757575]';
      default:
        return 'text-[#757575]';
    }
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Timeline items */}
      <div className="space-y-3 lg:space-y-4">
        {exams.map((exam, index) => (
          <div key={exam.id} className="relative pl-8 lg:pl-10">
            {/* Timeline dot */}
            <div className={cn(
              "absolute left-[0px] top-3 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10",
              getStatusColor(exam.status)
            )} />

            {/* Exam card */}
            <div className={cn(
              "p-3 lg:p-4 rounded-lg border-2 transition-all hover:shadow-md",
              getCardBorderColor(exam.status)
            )}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Date and time */}
                  <div className={cn(
                    "text-xs lg:text-sm font-bold mb-1",
                    getDateColor(exam.status)
                  )}>
                    {exam.date} ({exam.time})
                  </div>

                  {/* Course name and code */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="text-sm lg:text-base font-bold text-gray-900">
                      {exam.courseName}
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {exam.courseCode}
                    </span>
                  </div>

                  {/* Course details - All on one line */}
                  <div className="flex items-center gap-3 text-xs lg:text-sm text-gray-600 flex-wrap">
                    
                    {/* Room */}
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{exam.room}</span>
                    </div>
                    
                    
                    {/* Exam type */}
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{exam.examType}</span>
                    </div>
                  </div>
                </div>

                {/* Eye icon */}
                {(exam.status === 'upcoming' || exam.status === 'today') && (
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

