'use client';

import React, { useState, useEffect } from 'react';
import { FileDown, Send, Lock, AlertCircle, Search } from 'lucide-react';
import GradeTable from './components/GradeTable';
import GradeFilters from './components/GradeFilters';
import SubmitApprovalModal from './components/SubmitApprovalModal';
import GradeHistoryTable from './components/GradeHistoryTable';
import { StudentGrade, GradeHistory, Semester, CourseClass, CourseClassGrades } from './lib/types/types';
import { gradesApi } from './lib/api/gradesApi';
import { toast } from 'react-hot-toast';

const InstructorGradesPage = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [courseClassData, setCourseClassData] = useState<CourseClassGrades | null>(null);
  const [history] = useState<GradeHistory[]>([]);
  
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch semesters on mount
  useEffect(() => {
    const fetchSemesters = async () => {
      const response = await gradesApi.getSemesters();
      if (response.success) {
        setSemesters(response.data);
        if (response.data.length > 0) {
          setSelectedSemester(response.data[0].semesterId);
        }
      }
      setLoading(false);
    };
    fetchSemesters();
  }, []);

  // Fetch course classes when semester changes
  useEffect(() => {
    if (selectedSemester) {
      const fetchCourseClasses = async () => {
        const response = await gradesApi.getCourseClassesBySemester(selectedSemester);
        if (response.success) {
          setCourseClasses(response.data);
          if (response.data.length > 0) {
            setSelectedCourse(response.data[0].courseClassId);
          } else {
            setSelectedCourse('');
            setCourseClassData(null);
          }
        }
      };
      fetchCourseClasses();
    }
  }, [selectedSemester]);

  // Fetch grades when course changes
  useEffect(() => {
    if (selectedCourse) {
      const fetchGrades = async () => {
        const response = await gradesApi.getCourseClassGrades(selectedCourse);
        if (response.success) {
          setCourseClassData(response.data);
        }
      };
      fetchGrades();
    }
  }, [selectedCourse]);

  const handleGradeChange = (enrollmentId: string, field: keyof StudentGrade, value: number | null) => {
    if (!courseClassData) return;
    
    setCourseClassData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        students: prev.students.map((student) =>
          student.enrollmentId === enrollmentId ? { ...student, [field]: value } : student
        ),
      };
    });
  };

  const handleSubmitApproval = () => {
    console.log('Submitting grades for approval...');
    setIsModalOpen(false);
    toast.success('Đã gửi điểm để duyệt');
    // Here you would call the API to submit grades
  };

  const handleExportExcel = () => {
    console.log('Exporting to Excel...');
    toast.success('Đang xuất file Excel...');
    // Here you would implement Excel export functionality
  };

  const filteredStudents = courseClassData?.students.filter((student) => {
    const matchesSearch =
      !searchQuery ||
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.mssv.includes(searchQuery);
    return matchesSearch;
  }) || [];

  const totalStudents = courseClassData?.totalStudents || 0;
  const submittedCount = filteredStudents.filter(
    (s) => s.attendanceGrade !== null && s.midtermGrade !== null && s.finalGrade !== null
  ).length;

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Điểm số</h1>
        <p className="text-gray-600 mt-1">Nhập và quản lý điểm sinh viên</p>
      </div>

      {/* Course Info Card */}
      {courseClassData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {courseClassData.courseName} - {courseClassData.courseCode}
              </h2>
              <p className="text-sm text-gray-600">
                {courseClasses.find(c => c.courseClassId === selectedCourse)?.semesterName || ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!courseClassData.canEditGrades ? (
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
      )}

      {/* Filters */}
      <GradeFilters
        selectedCourse={selectedCourse}
        selectedSemester={selectedSemester}
        onCourseChange={setSelectedCourse}
        onSemesterChange={setSelectedSemester}
        semesters={semesters}
        courseClasses={courseClasses}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-orange-50 rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Tổng sinh viên</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{totalStudents}</p>
          <p className="text-xs text-gray-500">Đang học</p>
        </div>
        <div className="bg-teal-50 rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Đã nhập điểm</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{submittedCount}</p>
          <p className="text-xs text-gray-500">Hoàn thành</p>
        </div>
        <div className="bg-red-50 rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Chưa nhập</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{totalStudents - submittedCount}</p>
          <p className="text-xs text-gray-500">Cần cập nhật</p>
        </div>
      </div>

      {/* Grade Table Wrapper with Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* Header with Search and Actions */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bảng điểm sinh viên
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Nhấp vào ô điểm để chỉnh sửa
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                Xuất Excel
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!courseClassData?.canEditGrades}
                className={`px-4 py-2 text-sm text-white rounded-lg flex items-center gap-2 cursor-pointer ${
                  !courseClassData?.canEditGrades
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#0053AD] hover:bg-[#003d82]'
                }`}
              >
                <Send className="w-4 h-4" />
                Gửi duyệt
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo MSSV, tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
            />
          </div>

          {/* Table with border */}
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <GradeTable
              students={filteredStudents}
              isLocked={!courseClassData?.canEditGrades}
              onGradeChange={handleGradeChange}
            />
          </div>
        </div>
      </div>

      {/* Grade History Table */}
      <GradeHistoryTable history={history} />

      {/* Submit Approval Modal */}
      {courseClassData && (
        <SubmitApprovalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleSubmitApproval}
          totalStudents={totalStudents}
          submittedCount={submittedCount}
          courseName={`${courseClassData.courseName} - ${courseClassData.courseCode}`}
        />
      )}
    </div>
  );
};

export default InstructorGradesPage;

