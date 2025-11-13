'use client';

import { useState, useMemo, lazy, Suspense } from 'react';
import { Lock, AlertCircle, Unlock } from 'lucide-react';
import { CourseClassSelector } from './components/CourseClassSelector';
import { GradesTable } from './components/GradesTable';
import { SubmitApprovalDialog } from './components/SubmitApprovalDialog';
import { StatsCards } from './components/StatsCards';
import { ActionButtons } from './components/ActionButtons';
import { GradesTableSkeleton } from './components/GradesTableSkeleton';
import { StatsSkeleton } from './components/StatsSkeleton';
import { isGradeComplete } from '@/lib/utils/grade-calculator';
import {
  useInstructorCourseClasses,
  useCourseClassGrades,
  useUpdateDraftGradesBulk,
  useSubmitForApproval,
  useGradeHistory,
  useGradeVersion,
  useExportGrades,
  useSemesters,
  useUpdateGradeNote,
} from './lib/hooks';

const GradeHistoryTable = lazy(() =>
  import('./components/GradeHistoryTable').then((mod) => ({ default: mod.GradeHistoryTable }))
);

const GradeVersionModal = lazy(() =>
  import('./components/GradeVersionModal').then((mod) => ({ default: mod.GradeVersionModal }))
);

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
  const { data: gradesData, isLoading: isLoadingGrades, isFetching: isFetchingGrades } = useCourseClassGrades(
    selectedCourseClassId,
    'draft'
  );
  
  // Show skeleton when loading or fetching new course class data
  // Check if the current data matches the selected course class ID
  const currentDataMatches = gradesData?.data?.courseClassId === selectedCourseClassId;
  const showGradesSkeleton = isLoadingGrades || (isFetchingGrades && (!gradesData?.data || !currentDataMatches));
  const { data: historyData } = useGradeHistory(selectedCourseClassId, showHistory);
  const { data: versionData, isLoading: isLoadingVersion } = useGradeVersion(
    selectedCourseClassId,
    selectedVersionNumber || 0
  );
  const updateNoteMutation = useUpdateGradeNote(selectedCourseClassId);
  const bulkUpdateMutation = useUpdateDraftGradesBulk(selectedCourseClassId);
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

  const handleNoteChange = (enrollmentId: string, note: string | null) => {
    if (!gradesInfo?.canEditGrades) return;
    updateNoteMutation.mutate({ enrollmentId, note });
  };

  const handleBulkSave = (changes: Record<string, {
    attendanceGrade?: number | null;
    midtermGrade?: number | null;
    finalGrade?: number | null;
    note?: string | null;
  }>) => {
    if (!gradesInfo?.canEditGrades || !selectedCourseClassId) return;
    
    const gradesToUpdate = Object.entries(changes).map(([enrollmentId, change]) => ({
      enrollmentId,
      attendanceGrade: change.attendanceGrade ?? null,
      midtermGrade: change.midtermGrade ?? null,
      finalGrade: change.finalGrade ?? null,
      note: change.note ?? null,
    }));

    bulkUpdateMutation.mutate(gradesToUpdate, {
      onSuccess: () => {
        // Clear pending changes sau khi save thành công
        // Sẽ được xử lý trong GradesTable component thông qua prop callback
      }
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
      type
    });
    setShowExportDropdown(false);
  };

  const handleVersionClick = (versionNumber: number) => {
    setSelectedVersionNumber(versionNumber);
  };

  const handleCloseVersionModal = () => {
    setSelectedVersionNumber(null);
  };

  const studentsWithGrades = useMemo(() => {
    return gradesInfo?.students.filter((s) => isGradeComplete(s)).length || 0;
  }, [gradesInfo?.students]);

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

        {selectedCourseClass && (
          <>
            {/* Show header info if we have matching data, otherwise show skeleton */}
            {gradesInfo && currentDataMatches ? (
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
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {showGradesSkeleton ? <StatsSkeleton /> : gradesInfo && currentDataMatches ? (
              <StatsCards
                totalStudents={gradesInfo.totalStudents}
                studentsWithGrades={studentsWithGrades}
              />
            ) : null}

            {gradesInfo && currentDataMatches && (
              <>
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
                  <ActionButtons
                    showHistory={showHistory}
                    onToggleHistory={() => setShowHistory(!showHistory)}
                    showExportDropdown={showExportDropdown}
                    onToggleExportDropdown={() => setShowExportDropdown(!showExportDropdown)}
                    onExport={handleExport}
                    onSubmitForApproval={() => setIsSubmitDialogOpen(true)}
                    canEditGrades={gradesInfo.canEditGrades}
                    isExporting={exportGradesMutation.isPending}
                    isSubmitting={submitForApprovalMutation.isPending}
                    hasSelectedClass={!!selectedCourseClassId}
                  />
                </div>

                {showGradesSkeleton ? <GradesTableSkeleton /> : (
                  <GradesTable
                    students={gradesInfo.students}
                    canEdit={gradesInfo.canEditGrades}
                    onNoteChange={handleNoteChange}
                    onBulkSave={handleBulkSave}
                    isPending={bulkUpdateMutation.isPending}
                    isLoading={isFetchingGrades && !showGradesSkeleton}
                  />
                )}

                {showHistory && (
                  <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-8 text-center">Đang tải...</div>}>
                    <div className="mt-6">
                      <GradeHistoryTable history={history} onVersionClick={handleVersionClick} />
                    </div>
                  </Suspense>
                )}

                <SubmitApprovalDialog
                  isOpen={isSubmitDialogOpen}
                  onClose={() => setIsSubmitDialogOpen(false)}
                  onConfirm={handleSubmitForApproval}
                  totalStudents={gradesInfo.totalStudents}
                  studentsWithGrades={studentsWithGrades}
                  courseName={`${gradesInfo.courseCode} - ${gradesInfo.courseName}`}
                />

                <Suspense fallback={<div />}>
                  <GradeVersionModal
                    isOpen={selectedVersionNumber !== null}
                    onClose={handleCloseVersionModal}
                    versionDetail={versionDetail}
                    isLoading={isLoadingVersion}
                  />
                </Suspense>
              </>
            )}
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
