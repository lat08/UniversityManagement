"use client"

import { useState, useMemo, lazy, Suspense } from "react";
import { ExamsHeader } from "./ExamsHeader";
import { ExamsFilters } from "./ExamsFilters";
import { ExamCard } from "./ExamCard";
import { ExamsSkeleton } from "./ExamsSkeleton";
import { useExamEntries } from "../lib/hooks/useExamEntries";
import { useExamActions } from "../lib/hooks/useExamActions";
import { useExamFilters } from "../lib/hooks/useExamFilters";
import { UpdateExamRequest, ExamEntry } from "../lib/types";
import { Pagination } from "@/app/components/ui/pagination";
import { DEFAULT_PAGE_SIZE } from "../lib/constants";

const UploadExamModal = lazy(() => 
  import("./UploadExamModal").then(m => ({ default: m.UploadExamModal }))
);
const ExamDetailModal = lazy(() => 
  import("./ExamDetailModal").then(m => ({ default: m.ExamDetailModal }))
);

export interface UploadExamFormData {
  courseClassId: string;
  examType: string;
  durationMinutes: number;
  description: string;
  questionFile: File | null;
  answerFile: File | null;
}

export const ExamsContent = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedExamForResubmit, setSelectedExamForResubmit] = useState<ExamEntry | null>(null); // Add this line

  const {
    searchQuery,
    setSearchQuery,
    selectedSemester,
    setSelectedSemester,
    selectedSubject,
    setSelectedSubject,
    selectedStatus,
    setSelectedStatus,
    selectedExamType,
    setSelectedExamType,
    currentPage,
    setCurrentPage,
    filterParams,
    semesterOptions,
    subjectOptions,
    statuses,
    examTypes,
    semestersLoading,
    subjectsLoading,
  } = useExamFilters();

  const { examEntries, totalCount, totalPages, loading, error } = useExamEntries(filterParams);

  const { uploadExam, updateExam, downloadExamFile, isUploading, isUpdating } = useExamActions(() => {
    setIsUploadModalOpen(false);
    setSelectedExamId(null);
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

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleResubmit = (examEntryId: string) => {
    // Find the exam from the list
    const exam = examEntries.find(e => e.examEntryId === examEntryId);
    if (exam) {
      setSelectedExamForResubmit(exam); // Store the full exam object
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
      setSelectedExamForResubmit(null); // Reset after submit
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

  const handleDownload = (fileUrl: string, fileName?: string) => {
    downloadExamFile(fileUrl, fileName);
  };

  const handleView = (examEntryId: string) => {
    setSelectedExamId(examEntryId);
    setIsDetailModalOpen(true);
  };

  if (examEntries.length === 0 && loading) {
    return <ExamsSkeleton />;
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
    <div className="space-y-4 sm:space-y-6">
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
              setSelectedExamForResubmit(null);
            }}
            onSubmit={handleUploadSubmit}
            isSubmitting={isUploading || isUpdating}
            courseClasses={courseClassesOptions}
            mode={selectedExamForResubmit ? 'resubmit' : 'upload'}
            existingExam={selectedExamForResubmit ? {
              subjectName: selectedExamForResubmit.subjectName,
              courseClassCode: selectedExamForResubmit.courseClassCode,
              examType: selectedExamForResubmit.examType,
              durationMinutes: selectedExamForResubmit.durationMinutes,
            } : undefined}
          />
        </Suspense>
      )}

      {isDetailModalOpen && (
        <Suspense fallback={null}>
          <ExamDetailModal
            examEntryId={selectedExamId}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedExamId(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
