"use client";

import { useState, useMemo, useEffect } from "react";
import { Printer } from "lucide-react";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { useSemesters } from "@/lib/hooks";
import { Dropdown } from "@/app/components/ui/dropdown";
import ExamStatCard from "./components/ExamStatCard";
import ExamTimeline from "./components/ExamTimeline";
import NotesSection from "./components/NotesSection";
import { ExamStatCard as ExamStatCardType, Exam, Note } from "./lib/types/types";
import { Semester } from "@/lib/types";
import { getExamSchedule, getNotes } from "./lib/api/examScheduleApi";
import { sortExamsByStatus, transformExamData } from "./lib/utils/examUtils";

export default function ExamSchedulePage() {
  usePageTitle('Lịch thi');
  
  const { data: semesters } = useSemesters();
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchNotes = async () => {
    try {
      const response = await getNotes({ pageSize: 100, sortOrder: 'desc' });
      if (response.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      if (!selectedSemester) return;
      
      setLoading(true);
      try {
        const data = await getExamSchedule(selectedSemester.semesterId);
        const transformedData = transformExamData(data);
        const sortedExams = sortExamsByStatus(transformedData);
        setExams(sortedExams);
      } catch (error: unknown) {
        console.error('Error fetching exam schedule:', error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [selectedSemester]);

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
        progress: progress,
      },
    ];
  }, [exams, selectedSemester]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Lịch thi</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          Hiển thị thời khóa biểu theo kỳ thi học sinh hoặc CCCD khi đi thi
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
          <ExamStatCard key={index} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm min-h-[600px]">
            <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch thi các môn
            </h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 text-sm">Đang tải lịch thi...</p>
              </div>
            ) : exams.length > 0 ? (
              <ExamTimeline exams={exams} />
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

        <div className="lg:col-span-4">
          <NotesSection 
            notes={notes} 
            onNotesChange={fetchNotes}
          />
        </div>
      </div>
    </div>
  );
}

