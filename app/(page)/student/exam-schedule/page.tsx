"use client";

import { useState, useMemo, useEffect, Suspense, lazy } from "react";
import { Printer } from "lucide-react";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { useSemesters } from "@/lib/hooks";
import { Dropdown } from "@/app/components/ui/dropdown";
import ExamStatCard from "./components/ExamStatCard";
import { ExamStatCard as ExamStatCardType } from "./lib/types/types";
import { Semester } from "@/lib/types";
import { useExamSchedule, useNotes } from "./lib/hooks";

const ExamTimeline = lazy(() => import("./components/ExamTimeline"));
const NotesSection = lazy(() => import("./components/NotesSection"));

export default function ExamSchedulePage() {
  usePageTitle('Lịch thi');
  
  const { data: semesters, loading: semestersLoading } = useSemesters();
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  useEffect(() => {
    if (semesters.length > 0 && !selectedSemester) {
      const currentDate = new Date();
      const currentSemester = semesters.find((semester) => {
        const startDate = new Date(semester.startDate);
        const endDate = new Date(semester.endDate);
        return currentDate >= startDate && currentDate <= endDate;
      });
      setSelectedSemester(currentSemester || semesters[0]);
    }
  }, [semesters, selectedSemester]);

  const { data: exams = [], isLoading: examsLoading } = useExamSchedule(selectedSemester?.semesterId ?? null);
  const { notes, isLoading: notesLoading, createNote, updateNote, deleteNote, isCreating, isUpdating, isDeleting } = useNotes();

  const isInitialLoading = semestersLoading || !selectedSemester || examsLoading;

  const stats = useMemo((): ExamStatCardType[] => {
    const totalExams = exams.length;
    const upcomingExams = exams.filter(e => e.status === 'Sắp tới');
    const pendingExams = exams.filter(e => e.status === 'Chưa tới');
    const completedExams = exams.filter(e => e.status === 'Đã thi');
    const progress = totalExams > 0 ? Math.round((completedExams.length / totalExams) * 100) : 0;

    const nextExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

    return [
      {
        title: 'Tổng số môn thi',
        value: totalExams,
        subtitle: selectedSemester?.semesterName.split(' - ').slice(0, 2).join(' - ') || '',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-600',
      },
      {
        title: 'Môn thi sắp tới',
        value: upcomingExams.length + pendingExams.length,
        subtitle: nextExam 
          ? `${nextExam.subjectNameCode} - ${nextExam.examDate} - ${nextExam.examTimeDuration.split('–')[0]}`
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
        progress,
      },
    ];
  }, [exams, selectedSemester]);

  const handlePrint = () => {
    window.print();
  };

  const isBusy = isCreating || isUpdating || isDeleting;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Lịch thi</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          Theo dõi lịch thi từng học kỳ và nắm thông tin chi tiết cho từng môn
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-stretch justify-between">
        <div className="flex-1 max-w-full sm:max-w-md">
          <Dropdown
            options={semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))}
            value={selectedSemester?.semesterId || ''}
            placeholder="Chọn học kỳ"
            onChange={(value) => {
              const semester = semesters.find(s => s.semesterId === value);
              setSelectedSemester(semester || null);
            }}
            disabled={semesters.length === 0}
          />
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-6 lg:px-8 py-2.5 bg-[var(--button-primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--button-primary-hover)] focus:outline-none cursor-pointer transition-colors whitespace-nowrap"
        >
          <Printer className="w-4 h-4" />
          <span className="text-xs lg:text-sm font-medium">Xuất lịch thi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {stats.map((stat, index) => (
          <ExamStatCard key={index} data={stat} loading={isInitialLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm h-[600px] flex flex-col">
            <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch thi các môn
            </h2>
            <Suspense fallback={<TimelineSkeleton />}>
              <ExamTimeline exams={exams} loading={isInitialLoading} />
            </Suspense>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="h-[600px]">
            <Suspense fallback={<NotesSkeleton />}>
              <NotesSection 
                notes={notes}
                onCreateNote={createNote}
                onUpdateNote={updateNote}
                onDeleteNote={deleteNote}
                loading={notesLoading}
                isBusy={isBusy}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

const TimelineSkeleton = () => (
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

const NotesSkeleton = () => (
  <div className="bg-[#DBEDFF] rounded-lg p-4 lg:p-6 h-full border-2 border-[#4196F0]">
    <div className="h-6 w-32 rounded bg-gray-200 mb-4 animate-pulse" />
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border border-blue-200 bg-white p-3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  </div>
);

