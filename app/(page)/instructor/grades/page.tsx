'use client';

import { useState, useMemo } from 'react';
import { FileDown, Send, Lock, AlertCircle, History } from 'lucide-react';
import { CourseClassSelector } from './components/CourseClassSelector';
import { GradesTable } from './components/GradesTable';
import { GradeHistoryTable } from './components/GradeHistoryTable';
import { SubmitApprovalDialog } from './components/SubmitApprovalDialog';
import {
  useInstructorCourseClasses,
  useCourseClassGrades,
  useUpdateDraftGrade,
  useSubmitForApproval,
  useGradeHistory,
  useExportGrades,
} from './lib/hooks';
import { GRADE_STATUS_LABELS, GRADE_STATUS_COLORS } from './lib/constants';
import type { InstructorGradeDto } from './lib/types';

const InstructorGradesPage = () => {
  const [selectedCourseClassId, setSelectedCourseClassId] = useState('');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: courseClassesData, isLoading: isLoadingCourseClasses } = useInstructorCourseClasses();
  const { data: gradesData, isLoading: isLoadingGrades } = useCourseClassGrades(
    selectedCourseClassId,
    'draft'
  );
  const { data: historyData } = useGradeHistory(selectedCourseClassId);
  const updateGradeMutation = useUpdateDraftGrade(selectedCourseClassId);
  const submitForApprovalMutation = useSubmitForApproval(selectedCourseClassId);
  const exportGradesMutation = useExportGrades();

  const courseClasses = useMemo(() => courseClassesData?.data || [], [courseClassesData?.data]);
  const gradesInfo = gradesData?.data;
  const history = historyData?.data || [];

  const selectedCourseClass = useMemo(
    () => courseClasses.find((cc) => cc.courseClassId === selectedCourseClassId),
    [courseClasses, selectedCourseClassId]
  );

  const handleGradeChange = (enrollmentId: string, field: keyof InstructorGradeDto, value: number | null) => {
    if (!gradesInfo?.canEditGrades) return;

    updateGradeMutation.mutate({
      enrollmentId,
      attendanceGrade: field === 'attendanceGrade' ? value : null,
      midtermGrade: field === 'midtermGrade' ? value : null,
      finalGrade: field === 'finalGrade' ? value : null,
    });
  };

  const handleSubmitForApproval = (note?: string) => {
    submitForApprovalMutation.mutate(note, {
      onSuccess: () => {
        setIsSubmitDialogOpen(false);
      },
    });
  };

  const handleExport = () => {
    if (!selectedCourseClassId) return;
    exportGradesMutation.mutate({ courseClassId: selectedCourseClassId, type: 'draft' });
  };

  const studentsWithGrades = gradesInfo?.students.filter(
    (s) => s.attendanceGrade !== null && s.midtermGrade !== null && s.finalGrade !== null
  ).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý điểm số</h1>
          <p className="text-gray-600">Nhập và quản lý điểm sinh viên</p>
        </div>

        <div className="mb-6">
          <CourseClassSelector
            courseClasses={courseClasses}
            selectedCourseClassId={selectedCourseClassId}
            onSelect={setSelectedCourseClassId}
            isLoading={isLoadingCourseClasses}
          />
        </div>

        {selectedCourseClass && gradesInfo && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {gradesInfo.courseCode} - {gradesInfo.courseName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Lớp: {gradesInfo.className} | Học kỳ: {selectedCourseClass.semesterName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      GRADE_STATUS_COLORS[gradesInfo.versionStatus] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {gradesInfo.canEditGrades ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {GRADE_STATUS_LABELS[gradesInfo.versionStatus] || gradesInfo.versionStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Tổng sinh viên</p>
                <p className="text-2xl font-bold text-gray-900">{gradesInfo.totalStudents}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Đã nhập điểm</p>
                <p className="text-2xl font-bold text-blue-600">{studentsWithGrades}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Chưa nhập</p>
                <p className="text-2xl font-bold text-orange-600">
                  {gradesInfo.totalStudents - studentsWithGrades}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {gradesInfo.canEditGrades ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Nhấp vào ô điểm để chỉnh sửa</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Bảng điểm đã được khóa</span>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <History className="w-4 h-4" />
                  {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
                </button>
                <button
                  onClick={handleExport}
                  disabled={exportGradesMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <FileDown className="w-4 h-4" />
                  Xuất Excel
                </button>
                <button
                  onClick={() => setIsSubmitDialogOpen(true)}
                  disabled={!gradesInfo.canEditGrades || submitForApprovalMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                    !gradesInfo.canEditGrades || submitForApprovalMutation.isPending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Gửi duyệt
                </button>
              </div>
            </div>

            {isLoadingGrades ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <GradesTable
                students={gradesInfo.students}
                canEdit={gradesInfo.canEditGrades}
                onGradeChange={handleGradeChange}
              />
            )}

            {showHistory && (
              <div className="mt-6">
                <GradeHistoryTable history={history} />
              </div>
            )}

            <SubmitApprovalDialog
              isOpen={isSubmitDialogOpen}
              onClose={() => setIsSubmitDialogOpen(false)}
              onConfirm={handleSubmitForApproval}
              totalStudents={gradesInfo.totalStudents}
              studentsWithGrades={studentsWithGrades}
              courseName={`${gradesInfo.courseCode} - ${gradesInfo.courseName}`}
            />
          </>
        )}

        {!selectedCourseClassId && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">Vui lòng chọn lớp học phần để xem bảng điểm</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorGradesPage;
