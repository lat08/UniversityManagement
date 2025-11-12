"use client"

import { useState, useMemo, useEffect, Suspense } from "react";
import { ExamsHeader } from "./ExamsHeader";
import { ExamsFilters } from "./ExamsFilters";
import { ExamCard } from "./ExamCard";
import { UploadExamModal, type UploadExamFormData } from "./UploadExamModal";
import { ExamDetailModal } from "./ExamDetailModal";
import { useExamEntries } from "../lib/hooks/useExamEntries";
import { useSemesters, useSubjects } from "@/lib/hooks";
import { useProfile } from "../../profile/lib/hooks/useProfile";
import { UpdateExamRequest } from "../lib/types";
import { useExamActions } from "../lib/hooks/useExamActions";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Pagination } from "@/app/components/ui/pagination";
import { SEARCH_DEBOUNCE_MS, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from "../lib/constants";
import type { GetExamEntriesParams } from "../lib/types";

export function ExamsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedExamType, setSelectedExamType] = useState("all");
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedExamForResubmit, setSelectedExamForResubmit] = useState<ExamEntry | null>(null); // Add this line

  const { data: semesters, loading: semestersLoading } = useSemesters();
  const { profile } = useProfile();
  const { data: subjects, loading: subjectsLoading } = useSubjects({ 
    instructorId: profile?.instructorId,
    semesterId: selectedSemester === "all" ? undefined : selectedSemester
  });

  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  const filterParams = useMemo<GetExamEntriesParams>(() => ({
    searchKeyword: debouncedSearchQuery || undefined,
    semesterId: selectedSemester === "all" ? undefined : selectedSemester,
    subjectId: selectedSubject === "all" ? undefined : selectedSubject,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    examType: selectedExamType === "all" ? undefined : selectedExamType,
    pageNumber: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
  }), [debouncedSearchQuery, selectedSemester, selectedSubject, selectedStatus, selectedExamType, currentPage]);

  const { examEntries, totalCount, totalPages, loading, error, refetch } = useExamEntries(filterParams);

  useEffect(() => {
    setCurrentPage(DEFAULT_PAGE_NUMBER);
  }, [debouncedSearchQuery, selectedSemester, selectedSubject, selectedStatus, selectedExamType]);

  const { uploadExam, updateExam, downloadExamFile, isUploading, isUpdating } = useExamActions(() => {
    refetch();
    setIsUploadModalOpen(false);
  });

  const courseClassesOptions = useMemo(() => {
    const uniqueClasses = new Map<string, { id: string; name: string }>();
    for (const exam of examEntries) {
      if (!uniqueClasses.has(exam.courseClassId)) {
        uniqueClasses.set(exam.courseClassId, {
          id: exam.courseClassId,
          name: `${exam.courseClassCode} - ${exam.subjectName}`
        });
      }
    }
    return Array.from(uniqueClasses.values());
  }, [examEntries]);

  const semesterOptions = useMemo(() => [
    { id: "all", name: "Tất cả học kỳ" },
    ...semesters.map(s => ({ id: s.semesterId, name: s.semesterName }))
  ], [semesters]);

  const subjectOptions = useMemo(() => 
    subjects.map(s => ({ id: s.subjectId, name: `${s.subjectCode} - ${s.subjectName}` }))
  , [subjects]);

  const statuses = useMemo(() => [
    { id: "all", name: "Tất cả trạng thái" },
    { id: "approved", name: "Đã duyệt" },
    { id: "pending", name: "Chờ duyệt" },
    { id: "rejected", name: "Từ chối" },
  ], []);

  const examTypes = useMemo(() => [
    { id: "all", name: "Tất cả loại" },
    { id: "midterm", name: "Giữa kỳ" },
    { id: "final", name: "Cuối kỳ" },
    { id: "quiz", name: "15 phút" },
  ], []);

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleResubmit = (examEntryId: string) => {
    const exam = examEntries.find(e => e.examEntryId === examEntryId);
    if (exam) {
      setSelectedExamForResubmit(exam);
      setSelectedExamId(examEntryId);
      setIsUploadModalOpen(true);
    }
  };

  const handleUploadSubmit = async (data: UploadExamFormData) => {
    if (selectedExamId) {
      const updateData: Partial<UpdateExamRequest> = {};
      if (data.durationMinutes) updateData.durationMinutes = data.durationMinutes;
      if (data.description) updateData.description = data.description;
      if (data.questionFile) updateData.questionFile = data.questionFile;
      if (data.answerFile) updateData.answerFile = data.answerFile;
      await updateExam(selectedExamId, updateData);
      setSelectedExamForResubmit(null);
      return;
    }

    const uploadData = {
      courseClassId: data.courseClassId,
      examType: data.examType as 'midterm' | 'final' | 'quiz' | 'makeup',
      durationMinutes: data.durationMinutes,
      description: data.description || '',
      questionFile: data.questionFile!,
      answerFile: data.answerFile!,
    };
    
    await uploadExam(uploadData);
  };

  const handleDownload = async (examEntryId: string, fileType: 'question' | 'answer') => {
    await downloadExamFile(examEntryId, fileType);
  };

  const handleView = (examEntryId: string) => {
    setSelectedExamId(examEntryId);
    setIsDetailModalOpen(true);
  };

  if (examEntries.length === 0 && loading) {
    return (
      <div className="space-y-6">
        <ExamsHeader onUploadClick={handleUpload} />
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ExamsHeader onUploadClick={handleUpload} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ExamsHeader onUploadClick={handleUpload} />

      <ExamsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSemester={selectedSemester}
        onSemesterChange={setSelectedSemester}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedExamType={selectedExamType}
        onExamTypeChange={setSelectedExamType}
        semesters={semesterOptions}
        subjects={subjectOptions}
        statuses={statuses}
        examTypes={examTypes}
        semestersLoading={semestersLoading}
        subjectsLoading={subjectsLoading}
      />

      <div className="space-y-4">
        {examEntries.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Không tìm thấy đề thi nào.</p>
          </div>
        ) : (
          examEntries.map((exam, index) => (
            <ExamCard
              key={exam.examEntryId}
              exam={exam}
              onDownload={handleDownload}
              onResubmit={handleResubmit}
              onView={handleView}
              animationDelay={index * 100}
              onClick={() => handleView(exam.examEntryId)}
            />
          ))
        )}
      </div>

      {!loading && !error && totalCount > 0 && (
        <div className="pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {isUploadModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <UploadExamModal
            isOpen={isUploadModalOpen}
            onClose={() => {
              setIsUploadModalOpen(false);
              setSelectedExamId(null);
              setSelectedExamForResubmit(null); // Reset on close
            }}
            onSubmit={handleUploadSubmit}
            isSubmitting={isUploading || isUpdating}
            courseClasses={courseClassesOptions}
            mode={selectedExamForResubmit ? 'resubmit' : 'upload'} // Pass mode based on whether we have exam data
            existingExam={selectedExamForResubmit ? {
              subjectName: selectedExamForResubmit.subjectName,
              courseClassCode: selectedExamForResubmit.courseClassCode,
              examType: selectedExamForResubmit.examType,
              durationMinutes: selectedExamForResubmit.durationMinutes,
            } : undefined} // Pass exam data
          />
        </Suspense>
      )}

      <ExamDetailModal
        examEntryId={selectedExamId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedExamId(null);
        }}
      />
    </div>
  );
}

