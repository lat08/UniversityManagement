"use client"

import { useState, useMemo } from "react";
import { ExamsHeader } from "./ExamsHeader";
import { ExamsFilters } from "./ExamsFilters";
import { ExamCard } from "./ExamCard";
import { UploadExamModal, type UploadExamFormData } from "./UploadExamModal";
import { ExamDetailModal } from "./ExamDetailModal";
import { useExamEntries } from "../lib/hooks/useExamEntries";
import { useSemesters, useSubjects } from "../lib/hooks/useSemestersAndSubjects";
import { useExamActions } from "../lib/hooks/useExamActions";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SEARCH_DEBOUNCE_MS } from "../lib/constants";
import type { GetExamEntriesParams } from "../lib/types";

export function ExamsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedExamType, setSelectedExamType] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Fetch semesters and subjects
  const { semesters, loading: semestersLoading } = useSemesters();
  const { subjects, loading: subjectsLoading } = useSubjects();

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  // Prepare filter params
  const filterParams = useMemo<GetExamEntriesParams>(() => ({
    searchTerm: debouncedSearchQuery || undefined,
    semesterId: selectedSemester !== "all" ? selectedSemester : undefined,
    subjectId: selectedSubject !== "all" ? selectedSubject : undefined,
    entryStatus: selectedStatus !== "all" ? selectedStatus : undefined,
    examType: selectedExamType !== "all" ? selectedExamType : undefined,
  }), [debouncedSearchQuery, selectedSemester, selectedSubject, selectedStatus, selectedExamType]);

  // Fetch exam entries
  const { examEntries, loading, error, refetch } = useExamEntries(filterParams);

  // Exam actions
  const { uploadExam, updateExam, downloadExamFile, isUploading, isUpdating } = useExamActions(() => {
    refetch();
    setIsUploadModalOpen(false);
  });

  // Extract unique course classes from exam entries for upload modal
  const courseClassesOptions = useMemo(() => {
    const uniqueClasses = new Map<string, { id: string; name: string }>();
    examEntries.forEach(exam => {
      if (!uniqueClasses.has(exam.courseClassId)) {
        uniqueClasses.set(exam.courseClassId, {
          id: exam.courseClassId,
          name: `${exam.courseClassCode} - ${exam.subjectName}`
        });
      }
    });
    return Array.from(uniqueClasses.values());
  }, [examEntries]);

  // Format semesters and subjects for dropdowns
  const semesterOptions = useMemo(() => [
    { id: "all", name: "Tất cả học kỳ" },
    ...semesters.map(s => ({ id: s.semesterId, name: s.semesterName }))
  ], [semesters]);

  const subjectOptions = useMemo(() => [
    { id: "all", name: "Tất cả môn học" },
    ...subjects.map(s => ({ id: s.subjectId, name: s.subjectName }))
  ], [subjects]);

  const statuses = [
    { id: "all", name: "Tất cả trạng thái" },
    { id: "approved", name: "Đã duyệt" },
    { id: "pending", name: "Chờ duyệt" },
    { id: "rejected", name: "Từ chối" },
  ];

  const examTypes = [
    { id: "all", name: "Tất cả loại" },
    { id: "midterm", name: "Giữa kỳ" },
    { id: "final", name: "Cuối kỳ" },
    { id: "quiz", name: "15 phút" },
  ];

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (data: UploadExamFormData) => {
    // If editing, use updateExam instead
    if (selectedExamId) {
      const updateData: any = {};
      if (data.durationMinutes) updateData.durationMinutes = data.durationMinutes;
      if (data.description) updateData.description = data.description;
      if (data.questionFile) updateData.questionFile = data.questionFile;
      if (data.answerFile) updateData.answerFile = data.answerFile;
      
      await updateExam(selectedExamId, updateData);
      return;
    }

    // Transform form data to API format for new upload
    const uploadData = {
      courseClassId: data.courseClassId,
      examType: data.examType as 'midterm' | 'final' | 'quiz',
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

  const handleResubmit = (examEntryId: string) => {
    // Open upload modal in edit mode or show resubmit modal
    setSelectedExamId(examEntryId);
    setIsUploadModalOpen(true);
  };

  const handleView = (examEntryId: string) => {
    setSelectedExamId(examEntryId);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (examEntryId: string) => {
    setSelectedExamId(examEntryId);
    setIsUploadModalOpen(true);
    // TODO: Load exam data for editing
  };

  if (loading && examEntries.length === 0) {
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
        semesters={semesterOptions}
        subjects={subjectOptions}
        statuses={statuses}
        semestersLoading={semestersLoading}
        subjectsLoading={subjectsLoading}
      />

      <div className="space-y-4">
        {examEntries.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Không tìm thấy đề thi nào.</p>
          </div>
        ) : (
          examEntries.map((exam) => (
            <ExamCard
              key={exam.examEntryId}
              exam={exam}
              onDownload={handleDownload}
              onResubmit={handleResubmit}
              onView={handleView}
            />
          ))
        )}
      </div>

      <UploadExamModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedExamId(null);
        }}
        onSubmit={handleUploadSubmit}
        isLoading={isUploading || isUpdating}
        courseClasses={courseClassesOptions}
        examEntryId={selectedExamId}
      />

      <ExamDetailModal
        examEntryId={selectedExamId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedExamId(null);
        }}
        onEdit={handleEdit}
      />
    </div>
  );
}

