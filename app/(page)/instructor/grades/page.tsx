'use client';

import { useState, useMemo } from 'react';
import { FileDown, Send, Lock, AlertCircle, History, Unlock } from 'lucide-react';
import { CourseClassSelector } from './components/CourseClassSelector';
import { GradesTable } from './components/GradesTable';
import { GradeHistoryTable } from './components/GradeHistoryTable';
import { SubmitApprovalDialog } from './components/SubmitApprovalDialog';
import { GradeVersionModal } from './components/GradeVersionModal';
import {
  useInstructorCourseClasses,
  useCourseClassGrades,
  useUpdateDraftGrade,
  useSubmitForApproval,
  useGradeHistory,
  useGradeVersion,
  useExportGrades,
  useSemesters,
} from './lib/hooks';
import type { InstructorGradeDto } from './lib/types';

const InstructorGradesPage = () => {
  const [selectedCourseClassId, setSelectedCourseClassId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<number | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const { data: semestersData, isLoading: isLoadingSemesters } = useSemesters();
  const { data: courseClassesData, isLoading: isLoadingCourseClasses } = useInstructorCourseClasses(
    selectedSemesterId || undefined
  );
  const { data: gradesData, isLoading: isLoadingGrades } = useCourseClassGrades(
    selectedCourseClassId,
    'draft'
  );
  const { data: historyData } = useGradeHistory(selectedCourseClassId, showHistory);
  const { data: versionData, isLoading: isLoadingVersion } = useGradeVersion(
    selectedCourseClassId,
    selectedVersionNumber || 0
  );
  const updateGradeMutation = useUpdateDraftGrade(selectedCourseClassId);
  const submitForApprovalMutation = useSubmitForApproval(selectedCourseClassId);
  const exportGradesMutation = useExportGrades();

  const semesters = useMemo(() => semestersData?.data || [], [semestersData?.data]);
  const courseClasses = useMemo(() => courseClassesData?.data || [], [courseClassesData?.data]);
  const gradesInfo = gradesData?.data;
  const history = historyData?.data || [];
  const versionDetail = versionData?.data || null;

  const selectedCourseClass = useMemo(
    () => courseClasses.find((cc) => cc.courseClassId === selectedCourseClassId),
    [courseClasses, selectedCourseClassId]
  );

  const handleSemesterChange = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setSelectedCourseClassId('');
  };

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

  const handleExport = (type: 'draft' | 'official') => {
    if (!selectedCourseClassId) return;
    exportGradesMutation.mutate({ 
      courseClassId: selectedCourseClassId, 
      type,
      courseCode: gradesInfo?.courseCode || '',
      className: gradesInfo?.className || ''
    });
    setShowExportDropdown(false);
  };

  const handleVersionClick = (versionNumber: number) => {
    setSelectedVersionNumber(versionNumber);
  };

  const handleCloseVersionModal = () => {
    setSelectedVersionNumber(null);
  };

  const studentsWithGrades = gradesInfo?.students.filter(
    (s) => s.attendanceGrade !== null && s.midtermGrade !== null && s.finalGrade !== null
  ).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý điểm số</h1>
          <p className="text-gray-600">Nhập và quản lý điểm sinh viên</p>
        </div>

        <div>
          <CourseClassSelector
            courseClasses={courseClasses}
            selectedCourseClassId={selectedCourseClassId}
            onSelect={setSelectedCourseClassId}
            isLoading={isLoadingCourseClasses}
            semesters={semesters}
            selectedSemesterId={selectedSemesterId}
            onSemesterChange={handleSemesterChange}
            isSemestersLoading={isLoadingSemesters}
          />
        </div>

        {selectedCourseClass && gradesInfo && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {gradesInfo.courseName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Mã lớp: {gradesInfo.courseCode} | Học kỳ: {selectedCourseClass.semesterName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      selectedCourseClass?.isDraftEditable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedCourseClass?.isDraftEditable ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {selectedCourseClass?.isDraftEditable ? 'Có thể chỉnh sửa' : 'Đã khoá'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
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
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4" />
                  {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    disabled={!selectedCourseClassId || exportGradesMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileDown className="w-4 h-4" />
                    {exportGradesMutation.isPending ? 'Đang xuất...' : 'Xuất Excel'}
                  </button>
                  {showExportDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowExportDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <button
                          onClick={() => handleExport('draft')}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors cursor-pointer"
                        >
                          Bản nháp
                        </button>
                        <button
                          onClick={() => handleExport('official')}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors cursor-pointer"
                        >
                          Bản chính thức
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setIsSubmitDialogOpen(true)}
                  disabled={!gradesInfo.canEditGrades || submitForApprovalMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                    !gradesInfo.canEditGrades || submitForApprovalMutation.isPending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
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
                <GradeHistoryTable history={history} onVersionClick={handleVersionClick} />
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

            <GradeVersionModal
              isOpen={selectedVersionNumber !== null}
              onClose={handleCloseVersionModal}
              versionDetail={versionDetail}
              isLoading={isLoadingVersion}
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
