'use client';

import React, { useState } from 'react';
import { FileDown, Send, Lock, AlertCircle } from 'lucide-react';
import GradeTable from './components/GradeTable';
import GradeFilters from './components/GradeFilters';
import SubmitApprovalModal from './components/SubmitApprovalModal';
import { StudentGrade } from './lib/types/types';

// Mock data
const mockStudents: StudentGrade[] = [
  {
    studentId: '1',
    studentCode: '12550446',
    fullName: 'Nguyễn Văn A',
    className: 'K16',
    classCode: '23DAI',
    attendanceScore: 6.5,
    midtermScore: 5.0,
    finalScore: 4.8,
    averageScore: 5.2,
  },
  {
    studentId: '2',
    studentCode: '21122005',
    fullName: 'Lê Anh Kiệt',
    className: 'K16',
    classCode: '23DPM',
    attendanceScore: 10,
    midtermScore: 8.5,
    finalScore: 9.0,
    averageScore: 9.1,
  },
  {
    studentId: '3',
    studentCode: '20032007',
    fullName: 'Trần Thị Thảo',
    className: 'K18',
    classCode: '25DMMT',
    attendanceScore: 10,
    midtermScore: 9.5,
    finalScore: 9.0,
    averageScore: 9.4,
  },
  {
    studentId: '4',
    studentCode: '25577512',
    fullName: 'Phạm Xuân M',
    className: 'K17',
    classCode: '24DCNTT',
    attendanceScore: 8.5,
    midtermScore: 7.0,
    finalScore: 6.4,
    averageScore: 7.0,
  },
];

const InstructorGradesPage = () => {
  const [students, setStudents] = useState<StudentGrade[]>(mockStudents);
  const [selectedCourse, setSelectedCourse] = useState('CNTT01');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const handleGradeChange = (studentId: string, field: keyof StudentGrade, value: number | null) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, [field]: value } : student
      )
    );
  };

  const handleSubmitApproval = () => {
    setIsLocked(true);
    setIsModalOpen(false);
    // Here you would call the API to submit grades
  };

  const handleExportExcel = () => {
    // Here you would implement Excel export functionality
  };

  const filteredStudents = students.filter((student) => {
    const matchesClass = !selectedClass || student.className === selectedClass;
    const matchesSearch =
      !searchQuery ||
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentCode.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  const totalStudents = filteredStudents.length;
  const submittedCount = filteredStudents.filter(
    (s) => s.attendanceScore !== null && s.midtermScore !== null && s.finalScore !== null
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Điểm số</h1>
          <p className="text-gray-600">Nhập và quản lý điểm sinh viên</p>
        </div>

        {/* Course Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Lập trình Web - CNTT01
              </h2>
              <p className="text-sm text-gray-600">Học kỳ 1 - Năm học 2024-2025</p>
            </div>
            <div className="flex items-center gap-2">
              {isLocked ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Đã khóa</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Có thể chỉnh sửa</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <GradeFilters
          selectedCourse={selectedCourse}
          selectedClass={selectedClass}
          searchQuery={searchQuery}
          onCourseChange={setSelectedCourse}
          onClassChange={setSelectedClass}
          onSearchChange={setSearchQuery}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Tổng sinh viên</p>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Đã nhập điểm</p>
            <p className="text-2xl font-bold text-blue-600">{submittedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Chưa nhập</p>
            <p className="text-2xl font-bold text-orange-600">{totalStudents - submittedCount}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>Nhấp vào ô điểm để chỉnh sửa</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Xuất excel
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isLocked}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                isLocked
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Send className="w-4 h-4" />
              Gửi duyệt
            </button>
          </div>
        </div>

        {/* Grade Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <GradeTable
            students={filteredStudents}
            isLocked={isLocked}
            onGradeChange={handleGradeChange}
          />
        </div>

        {/* Submit Approval Modal */}
        <SubmitApprovalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleSubmitApproval}
          totalStudents={totalStudents}
          submittedCount={submittedCount}
          courseName="Lập trình Web - CNTT01"
        />
      </div>
    </div>
  );
};

export default InstructorGradesPage;

