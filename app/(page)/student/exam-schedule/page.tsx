"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Printer } from "lucide-react";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import ExamStatCard from "./components/ExamStatCard";
import ExamTimeline from "./components/ExamTimeline";
import NotesSection from "./components/NotesSection";
import { MOCK_SEMESTERS, MOCK_EXAMS, MOCK_NOTES } from "./lib/constants/constants";
import { ExamStatCard as ExamStatCardType } from "./lib/types/types";

export default function ExamSchedulePage() {
  usePageTitle('Lịch thi');
  
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(MOCK_SEMESTERS[0]);

  // Calculate stats
  const stats = useMemo((): ExamStatCardType[] => {
    const totalExams = MOCK_EXAMS.length;
    const upcomingExams = MOCK_EXAMS.filter(e => e.status === 'upcoming' || e.status === 'today');
    const completedExams = MOCK_EXAMS.filter(e => e.status === 'completed');
    const progress = totalExams > 0 ? Math.round((completedExams.length / totalExams) * 100) : 0;

    const nextExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

    return [
      {
        title: 'Tổng số môn thi',
        value: totalExams,
        subtitle: selectedSemester.semesterName.split(' - ').slice(0, 2).join(' - '),
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-600',
      },
      {
        title: 'Môn thi sắp tới',
        value: upcomingExams.length,
        subtitle: nextExam 
          ? `${nextExam.courseName} - ${nextExam.date.split(', ')[1]} - ${nextExam.time.split(' - ')[0]}`
          : 'Không có lịch thi sắp tới',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-600',
      },
      {
        title: 'Môn đã thi',
        value: completedExams.length,
        subtitle: 'Tiến độ',
        bgColor: 'bg-green-50',
        iconColor: 'bg-green-600',
        textColor: 'text-green-600',
        progress: progress,
      },
    ];
  }, [selectedSemester]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Lịch thi</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          Hiển thị thời khóa biểu theo kỳ thi học sinh hoặc CCCD khi đi thi
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-stretch justify-between">
        {/* Semester Dropdown */}
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <button 
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full"
            onClick={() => setIsSemesterOpen(!isSemesterOpen)}
          >
            <span className="text-xs lg:text-sm text-gray-900 truncate">
              {selectedSemester.semesterName}
            </span>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-700 flex-shrink-0" />
          </button>
          {isSemesterOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {MOCK_SEMESTERS.map((semester) => (
                <button
                  key={semester.semesterId}
                  className="w-full text-left px-4 py-2.5 text-xs lg:text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => {
                    setSelectedSemester(semester);
                    setIsSemesterOpen(false);
                  }}
                >
                  {semester.semesterName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Print Button */}
        <button 
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-6 lg:px-8 py-2.5 bg-[var(--button-primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--button-primary-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap"
        >
          <Printer className="w-4 h-4" />
          <span className="text-xs lg:text-sm font-medium">Xuất lịch thi</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {stats.map((stat, index) => (
          <ExamStatCard key={index} data={stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left side - Timeline (2/3 width = card 1 + card 2) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm min-h-[400px]">
            <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch thi các môn
            </h2>
            {MOCK_EXAMS.length > 0 ? (
              <ExamTimeline exams={MOCK_EXAMS} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">Chưa có lịch thi nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Notes (1/3 width = card 3) */}
        <div className="lg:col-span-4">
          <NotesSection 
            notes={MOCK_NOTES} 
            onToggleNote={(id) => {
              // Handle toggle note - can be implemented with API call
              console.log('Toggle note:', id);
            }}
          />
        </div>
      </div>
    </div>
  );
}

