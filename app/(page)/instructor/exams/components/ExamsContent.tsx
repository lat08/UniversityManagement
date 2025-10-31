"use client"

import { useState } from "react";
import { ExamsHeader } from "./ExamsHeader";
import { ExamsFilters } from "./ExamsFilters";
import { ExamCard, type Exam } from "./ExamCard";
import { UploadExamModal, type UploadExamFormData } from "./UploadExamModal";

export function ExamsContent() {
  const [selectedSemester, setSelectedSemester] = useState("20251");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const semesters = [
    { id: "all", name: "Tất cả học kỳ" },
    { id: "20251", name: "Học kỳ 1 - Năm học 2025 - 2026" },
    { id: "20242", name: "Học kỳ 2 - Năm học 2024 - 2025" },
  ];

  const subjects = [
    { id: "all", name: "Tất cả môn học" },
    { id: "web", name: "Lập trình web" },
    { id: "network", name: "Mạng máy tính" },
    { id: "database", name: "Cơ sở dữ liệu" },
  ];

  const statuses = [
    { id: "all", name: "Tất cả trạng thái" },
    { id: "approved", name: "Đã duyệt" },
    { id: "pending", name: "Chờ duyệt" },
    { id: "rejected", name: "Từ chối" },
  ];

  const exams: Exam[] = [
    {
      id: "1",
      title: "Đề thi giữa kỳ - Lập trình Web",
      subject: "Lập trình web",
      duration: "90 phút",
      date: "10/01/2025",
      status: "approved",
      examType: "midterm",
    },
    {
      id: "2",
      title: "Đề thi cuối kỳ - Cơ sở dữ liệu",
      subject: "Cơ sở dữ liệu",
      duration: "120 phút",
      date: "15/01/2025",
      status: "rejected",
      examType: "final",
      rejectionReason: "Cần bổ sung thêm câu hỏi phần SQL nâng cao",
    },
    {
      id: "3",
      title: "Đề kiểm tra 15 phút - HTML/CSS",
      subject: "Lập trình web",
      duration: "15 phút",
      date: "05/01/2025",
      status: "pending",
      examType: "quiz",
    },
  ];

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (data: UploadExamFormData) => {
    // TODO: Implement upload API call
    console.log("Upload exam data:", data);
    // After successful upload, refetch exams list
  };

  const handleDownload = (id: string) => {
    // TODO: Implement download functionality
    console.log("Download exam:", id);
  };

  const handleResubmit = (id: string) => {
    // TODO: Implement resubmit functionality
    console.log("Resubmit exam:", id);
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSemester = selectedSemester === "all" || true; // TODO: Add semester filter logic
    
    const matchesSubject =
      selectedSubject === "all" ||
      exam.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || exam.status === selectedStatus;

    return matchesSemester && matchesSubject && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <ExamsHeader onUploadClick={handleUpload} />

      <ExamsFilters
        selectedSemester={selectedSemester}
        onSemesterChange={setSelectedSemester}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        semesters={semesters}
        subjects={subjects}
        statuses={statuses}
      />

      <div className="space-y-4">
        {filteredExams.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Không tìm thấy đề thi nào.</p>
          </div>
        ) : (
          filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onDownload={handleDownload}
              onResubmit={handleResubmit}
            />
          ))
        )}
      </div>

      <UploadExamModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
      />
    </div>
  );
}

