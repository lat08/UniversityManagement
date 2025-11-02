'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MapPin, Mail, Phone, Calendar, User, School, Edit, ChevronDown } from 'lucide-react';
import { studentsApi } from '../lib/api/studentsApi';
import { getStatusDisplay } from '../lib/types/types';
import { useStudentDetail } from '../lib/hooks/useStudentDetail';
import { useSemesters } from '../lib/hooks/useSemesters';
import { useTuitionFees } from '../lib/hooks/useTuitionFees';
import { useInsurances } from '../lib/hooks/useInsurances';
import { useGrades } from '../lib/hooks/useGrades';
import { DetailPageSkeleton } from '../components/LoadingSkeleton';
import { GradeDetailModal } from '../components/GradeDetailModal';
import { Grade } from '../lib/types/types';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTuitionSemester, setSelectedTuitionSemester] = useState<string>('');
  const [selectedInsuranceSemester, setSelectedInsuranceSemester] = useState<string>('');
  const [selectedAcademicSemester, setSelectedAcademicSemester] = useState<string>('');
  const [isTuitionSemesterOpen, setIsTuitionSemesterOpen] = useState(false);
  const [isInsuranceSemesterOpen, setIsInsuranceSemesterOpen] = useState(false);
  const [isAcademicSemesterOpen, setIsAcademicSemesterOpen] = useState(false);
  const [exportingTuition, setExportingTuition] = useState(false);
  const [exportingInsurance, setExportingInsurance] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  // Custom hooks for data fetching
  const { studentData, loading: loadingStudent } = useStudentDetail(studentId);
  const { semesters, getCurrentSemester } = useSemesters();
  const { tuitionFees, loading: loadingTuition, fetchTuitionFees } = useTuitionFees(studentId);
  const { insurances, loading: loadingInsurance, fetchInsurances } = useInsurances(studentId);
  const { grades, loading: loadingGrades, fetchGrades } = useGrades(studentId);

  // Initialize semester selection when semesters are loaded
  useEffect(() => {
    if (semesters.length > 0 && !selectedTuitionSemester) {
      const currentSemester = getCurrentSemester();
      const defaultSemester = currentSemester ? currentSemester.semesterId : semesters[0].semesterId;
      setSelectedTuitionSemester(defaultSemester);
      setSelectedInsuranceSemester(defaultSemester);
      setSelectedAcademicSemester(defaultSemester);
    }
  }, [semesters, selectedTuitionSemester, getCurrentSemester]);

  // Lazy load tuition fees only when tuition tab is active
  useEffect(() => {
    if (activeTab === 'tuition' && selectedTuitionSemester) {
      fetchTuitionFees(selectedTuitionSemester);
    }
  }, [selectedTuitionSemester, activeTab, fetchTuitionFees]);

  // Lazy load insurances only when tuition tab is active
  useEffect(() => {
    if (activeTab === 'tuition' && selectedInsuranceSemester) {
      fetchInsurances(selectedInsuranceSemester);
    }
  }, [selectedInsuranceSemester, activeTab, fetchInsurances]);

  // Lazy load grades only when academic tab is active
  useEffect(() => {
    if (activeTab === 'academic' && selectedAcademicSemester) {
      fetchGrades(selectedAcademicSemester);
    }
  }, [selectedAcademicSemester, activeTab, fetchGrades]);

  const tabs = useMemo(() => [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'academic', label: 'Kết quả học tập' },
    { id: 'tuition', label: 'Học phí' },
  ], []);

  const handleEdit = () => {
    router.push(`/admin/student-profile/${studentId}/edit`);
  };

  const handleBack = () => {
    router.push('/admin/student-profile');
    router.refresh(); // Refresh to ensure list is up to date
  };

  // Format helpers - memoized
  const formatDate = useMemo(() => (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const formatGender = useMemo(() => (gender: string) => {
    const genderMap: Record<string, string> = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    };
    return genderMap[gender] || gender;
  }, []);

  const formatCurrency = useMemo(() => (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '0';
    return amount.toLocaleString('vi-VN');
  }, []);

  const formatDateTime = useMemo(() => (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const getPaymentStatusDisplay = useMemo(() => (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700' },
      pending: { label: 'Chưa thanh toán', color: 'bg-yellow-100 text-yellow-700' },
      failed: { label: 'Thất bại', color: 'bg-red-100 text-red-700' },
      partial: { label: 'Thanh toán một phần', color: 'bg-blue-100 text-blue-700' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  }, []);

  const getPaymentMethodDisplay = useMemo(() => (method: string | null) => {
    if (!method) return '-';
    const methodMap: Record<string, string> = {
      cash: 'Tiền mặt',
      bank_transfer: 'Chuyển khoản',
      credit_card: 'Thẻ tín dụng',
      momo: 'Ví MoMo',
      zalopay: 'ZaloPay',
    };
    return methodMap[method] || method;
  }, []);

  // Export handlers
  const handleExportTuition = async () => {
    try {
      setExportingTuition(true);
      const blob = await studentsApi.exportTuitionFees({
        studentId,
        semesterId: selectedTuitionSemester,
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const semester = semesters.find(s => s.semesterId === selectedTuitionSemester);
      const fileName = `HocPhi_${studentData?.studentCode}_${semester?.semesterCode || 'All'}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting tuition fees:', error);
    } finally {
      setExportingTuition(false);
    }
  };

  const handleExportInsurance = async () => {
    try {
      setExportingInsurance(true);
      const blob = await studentsApi.exportInsurances({
        studentId,
        semesterId: selectedInsuranceSemester,
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const semester = semesters.find(s => s.semesterId === selectedInsuranceSemester);
      const fileName = `BaoHiem_${studentData?.studentCode}_${semester?.semesterCode || 'All'}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting insurances:', error);
    } finally {
      setExportingInsurance(false);
    }
  };

  if (loadingStudent) {
    return <DetailPageSkeleton />;
  }

  if (!studentData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Không tìm thấy thông tin sinh viên</div>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(studentData.enrollmentStatus);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chi tiết Sinh viên</h1>
        <p className="text-gray-600 mt-1">Thông tin chi tiết và lịch sử học tập của sinh viên</p>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                {studentData.profilePicture ? (
                  <img
                    src={studentData.profilePicture}
                    alt="Student Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <span className={`mt-4 w-32 text-center px-3 py-1.5 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
                {statusDisplay.label}
              </span>
            </div>

            {/* Student Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#D32F2F] mb-2">{studentData.fullName}</h2>
                  <p className="text-sm text-gray-600 mb-1">Mã số sinh viên: {studentData.studentCode}</p>
                </div>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900 truncate">{studentData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Số điện thoại</p>
                    <p className="text-sm text-gray-900">{studentData.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Ngày sinh</p>
                    <p className="text-sm text-gray-900">{formatDate(studentData.dateOfBirth)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Chuyên ngành</p>
                    <p className="text-sm text-gray-900">{studentData.majorName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Khóa</p>
                    <p className="text-sm text-gray-900">{studentData.academicYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Địa chỉ</p>
                    <p className="text-sm text-gray-900">{studentData.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">GPA</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {studentData.averageGPA !== null && studentData.averageGPA !== undefined 
              ? studentData.averageGPA.toFixed(2) 
              : '-'}
          </p>
          <p className="text-xs text-gray-500">/4.0</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tín chỉ tích lũy</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {studentData.earnedCredits ?? '-'}
          </p>
          <p className="text-xs text-gray-500">/{studentData.totalCreditsRequired ?? '-'}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">Công nợ</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {studentData.unpaidAmount && studentData.unpaidAmount > 0 
              ? `${formatCurrency(studentData.unpaidAmount)} ₫` 
              : '0 ₫'}
          </p>
          <p className="text-xs text-gray-500">
            {studentData.unpaidAmount && studentData.unpaidAmount > 0 
              ? 'Chưa thanh toán đầy đủ' 
              : 'Đã thanh toán đầy đủ'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="overflow-hidden">
          <div className="flex w-full border border-gray-300 rounded-lg bg-gray-100 relative">
            {/* Active tab background slider */}
            <div 
              className="absolute top-0 bottom-0 bg-[#0053AD] rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
              style={{
                width: `${100 / tabs.length}%`,
                left: `${tabs.findIndex(t => t.id === activeTab) * (100 / tabs.length)}%`,
                transform: 'translateX(0)'
              }}
            />
            
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id

              return (
                <div key={tab.id} className="flex-1 relative z-10">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full cursor-pointer px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 relative transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="relative z-100">{tab.label}</span>
                  </button>
                  
                  {/* Divider */}
                  {!isActive && index < tabs.length - 1 && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-gray-300 transition-opacity duration-300"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                {/* Thông tin cơ bản */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Họ và tên</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày sinh</p>
                      <p className="text-sm text-gray-900 font-medium">{formatDate(studentData.dateOfBirth)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giới tính</p>
                      <p className="text-sm text-gray-900 font-medium">{formatGender(studentData.gender)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CCCD</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.citizenId}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin liên hệ */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Thông tin liên hệ</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.address}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin học vấn */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Thông tin học vấn</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Ngành học</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.facultyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chuyên ngành</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.majorName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Khóa</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.academicYear}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lớp</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.className}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hệ đào tạo</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.educationLevel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleBack}
                className="px-6 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        )}

        {/* Academic Results Tab */}
        {activeTab === 'academic' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Kết quả học tập</h2>
                <p className="text-sm text-gray-600">Bảng điểm và kết quả học tập theo học kỳ</p>
              </div>

              {/* Semester Selector and GPA Summary */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-80">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAcademicSemesterOpen(!isAcademicSemesterOpen);
                      setIsTuitionSemesterOpen(false);
                      setIsInsuranceSemesterOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                  >
                    <span className="text-sm text-gray-900">
                      {semesters.find(s => s.semesterId === selectedAcademicSemester)?.semesterName || 'Chọn học kì'} - {semesters.find(s => s.semesterId === selectedAcademicSemester)?.yearRange || ''}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                  </button>
                  {isAcademicSemesterOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {semesters.map((semester) => (
                        <button
                          key={semester.semesterId}
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                          onClick={() => {
                            setSelectedAcademicSemester(semester.semesterId);
                            setIsAcademicSemesterOpen(false);
                          }}
                        >
                          {semester.semesterName} - {semester.yearRange}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* GPA Summary */}
                {grades && (
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">GPA thang 10</p>
                      <p className="text-2xl font-bold text-[#0053AD]">{grades.semesterGPA10.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">GPA thang 4</p>
                      <p className="text-2xl font-bold text-[#0053AD]">{grades.semesterGPA4.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Xếp loại</p>
                      <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-lg ${
                        grades.semesterClassification === 'Xuất sắc' ? 'bg-purple-100 text-purple-700' :
                        grades.semesterClassification === 'Giỏi' ? 'bg-green-100 text-green-700' :
                        grades.semesterClassification === 'Khá' ? 'bg-blue-100 text-blue-700' :
                        grades.semesterClassification === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {grades.semesterClassification}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Grades Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0053AD] text-white text-sm">
                      <th className="px-6 py-4 text-left font-semibold border-r border-blue-400">Mã MH</th>
                      <th className="px-6 py-4 text-left font-semibold border-r border-blue-400">Tên môn học</th>
                      <th className="px-6 py-4 text-center font-semibold border-r border-blue-400">TC</th>
                      <th className="px-6 py-4 text-center font-semibold border-r border-blue-400">Điểm thi</th>
                      <th className="px-6 py-4 text-center font-semibold border-r border-blue-400">Điểm TK (10)</th>
                      <th className="px-6 py-4 text-center font-semibold border-r border-blue-400">Điểm TK (4)</th>
                      <th className="px-6 py-4 text-center font-semibold border-r border-blue-400">Điểm TK (C)</th>
                      <th className="px-6 py-4 text-center font-semibold border-r border-blue-400">Kết quả</th>
                      <th className="px-6 py-4 text-center font-semibold">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loadingGrades ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-[#0053AD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang tải...
                          </div>
                        </td>
                      </tr>
                    ) : !grades || grades.grades.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          Không có dữ liệu điểm
                        </td>
                      </tr>
                    ) : (
                      grades.grades.map((grade) => (
                        <tr key={grade.subjectId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{grade.subjectCode}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{grade.subjectName}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-center">{grade.credits}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            {grade.finalGrade !== null ? grade.finalGrade.toFixed(2) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            {grade.finalGrade10 !== null ? grade.finalGrade10.toFixed(2) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            {grade.finalGrade4.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-center font-semibold">
                            {grade.gradeLetter}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1.5 text-xs font-medium rounded-[5px] ${
                              grade.status === 'Đạt' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {grade.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedGrade(grade);
                                setIsGradeModalOpen(true);
                              }}
                              className="text-gray-600 hover:text-[#0053AD] cursor-pointer transition-colors"
                            >
                              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleBack}
                className="px-6 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        )}

        {/* Tuition Tab */}
        {activeTab === 'tuition' && (
            <div>
              {/* Tuition Fee Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Lịch sử học phí</h2>
                    <p className="text-sm text-gray-600">Thông tin thanh toán học phí</p>
                  </div>

                  {/* Semester Selector and Export */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative w-80">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTuitionSemesterOpen(!isTuitionSemesterOpen);
                          setIsInsuranceSemesterOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                      >
                        <span className="text-sm text-gray-900">
                          {semesters.find(s => s.semesterId === selectedTuitionSemester)?.semesterName || 'Chọn học kì'} - {semesters.find(s => s.semesterId === selectedTuitionSemester)?.yearRange || ''}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                      </button>
                      {isTuitionSemesterOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {semesters.map((semester) => (
                            <button
                              key={semester.semesterId}
                              type="button"
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                              onClick={() => {
                                setSelectedTuitionSemester(semester.semesterId);
                                setIsTuitionSemesterOpen(false);
                              }}
                            >
                              {semester.semesterName} - {semester.yearRange}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleExportTuition}
                      disabled={exportingTuition || !tuitionFees || tuitionFees.courses.length === 0}
                      className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {exportingTuition ? 'Đang xuất...' : 'Xuất Excel'}
                    </button>
                  </div>

                  {/* Tuition Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#0053AD] text-white text-sm">
                          <th className="px-6 py-4 text-left font-semibold border-r border-blue-400">Mã môn học</th>
                          <th className="px-6 py-4 text-left font-semibold border-r border-blue-400">Tên môn học</th>
                          <th className="px-6 py-4 text-center font-semibold border-r border-blue-400">Số tín chỉ</th>
                          <th className="px-6 py-4 text-right font-semibold border-r border-blue-400">Học phí</th>
                          <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {loadingTuition ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-[#0053AD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang tải...
                              </div>
                            </td>
                          </tr>
                        ) : !tuitionFees || tuitionFees.courses.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              Không có dữ liệu học phí
                            </td>
                          </tr>
                        ) : (
                          <>
                            {tuitionFees.courses.map((course) => {
                              const statusDisplay = getPaymentStatusDisplay(course.status);
                              return (
                                <tr key={course.courseId} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm text-gray-900">{course.courseCode}</td>
                                  <td className="px-6 py-4 text-sm text-gray-900">{course.courseName}</td>
                                  <td className="px-6 py-4 text-sm text-gray-900 text-center">{course.credits}</td>
                                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(course.courseFee)} ₫</td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1.5 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
                                      {statusDisplay.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-gray-50 font-semibold">
                              <td colSpan={2} className="px-6 py-4 text-sm text-gray-900 text-right">Tổng cộng:</td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                {tuitionFees.courses.reduce((sum, course) => sum + course.credits, 0)} TC
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                {formatCurrency(tuitionFees.courses.reduce((sum, course) => sum + course.courseFee, 0))} ₫
                              </td>
                              <td></td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Insurance Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Lịch sử Bảo hiểm y tế</h2>
                    <p className="text-sm text-gray-600">Thông tin thanh toán bảo hiểm y tế</p>
                  </div>

                  {/* Semester Selector and Export */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative w-80">
                      <button
                        type="button"
                        onClick={() => {
                          setIsInsuranceSemesterOpen(!isInsuranceSemesterOpen);
                          setIsTuitionSemesterOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                      >
                        <span className="text-sm text-gray-900">
                          {semesters.find(s => s.semesterId === selectedInsuranceSemester)?.semesterName || 'Chọn học kì'} - {semesters.find(s => s.semesterId === selectedInsuranceSemester)?.yearRange || ''}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                      </button>
                      {isInsuranceSemesterOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {semesters.map((semester) => (
                            <button
                              key={semester.semesterId}
                              type="button"
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                              onClick={() => {
                                setSelectedInsuranceSemester(semester.semesterId);
                                setIsInsuranceSemesterOpen(false);
                              }}
                            >
                              {semester.semesterName} - {semester.yearRange}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleExportInsurance}
                      disabled={exportingInsurance || insurances.length === 0}
                      className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {exportingInsurance ? 'Đang xuất...' : 'Xuất Excel'}
                    </button>
                  </div>

                  {/* Insurance Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#0053AD] text-white text-sm">
                          <th className="px-6 py-4 text-left font-semibold border-r border-blue-400">Năm học</th>
                          <th className="px-6 py-4 text-right font-semibold border-r border-blue-400">Phí bảo hiểm</th>
                          <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {loadingInsurance ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                              <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-[#0053AD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang tải...
                              </div>
                            </td>
                          </tr>
                        ) : insurances.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                              Không có dữ liệu bảo hiểm y tế
                            </td>
                          </tr>
                        ) : (
                          insurances.map((insurance) => {
                            const statusDisplay = getPaymentStatusDisplay(insurance.status);
                            return (
                              <tr key={insurance.studentHealthInsuranceId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">{insurance.academicYear}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(insurance.healthInsuranceFee)} ₫</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-3 py-1.5 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
                                    {statusDisplay.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleEdit}
                  className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Grade Detail Modal */}
      <GradeDetailModal
        isOpen={isGradeModalOpen}
        onClose={() => {
          setIsGradeModalOpen(false);
          setSelectedGrade(null);
        }}
        grade={selectedGrade}
      />
    </div>
  );
}

