'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MapPin, Mail, Phone, Calendar, School, ArrowLeft, Edit } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs } from '@/app/components/ui/tabs';
import { Table, Dropdown } from '@/app/components/ui';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils/format';
import { getPaymentStatusDisplay } from '@/lib/utils/statusDisplay';
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
    return formatCurrencyUtil(amount);
  }, []);

  const formatDateTime = useMemo(() => (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 text-sm text-[#0053AD] bg-blue-50 border border-[#0053AD] rounded-lg hover:bg-blue-100 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <Avatar className="w-32 h-32 border border-gray-200 shadow-md">
                <AvatarImage src={studentData.profilePicture || ""} alt={studentData.fullName} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                  {studentData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
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
                  onClick={() => router.push(`/admin/student-profile/${studentId}/edit`)}
                  className="px-4 py-2 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900 truncate">{studentData.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Số điện thoại</p>
                    <p className="text-sm text-gray-900">{studentData.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Ngày sinh</p>
                    <p className="text-sm text-gray-900">{formatDate(studentData.dateOfBirth)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <School className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Chuyên ngành</p>
                    <p className="text-sm text-gray-900">{studentData.departmentName || studentData.majorName || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <School className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Khóa</p>
                    <p className="text-sm text-gray-900">{studentData.academicYear}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
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
            {studentData.averageGPA === null || studentData.averageGPA === undefined 
              ? '-' 
              : studentData.averageGPA.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">/10.0</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tín chỉ tích lũy</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {studentData.creditsEarnedInCurriculum ?? studentData.earnedCredits ?? '-'}
          </p>
          <p className="text-xs text-gray-500">/{studentData.totalCreditsInCurriculum ?? studentData.totalCreditsRequired ?? '-'}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">Công nợ</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {formatCurrency(studentData.unpaidAmount && studentData.unpaidAmount > 0 ? studentData.unpaidAmount : 0)}
          </p>
          <p className="text-xs text-gray-500">
            {studentData.unpaidAmount && studentData.unpaidAmount > 0 ? 'Chưa thanh toán đầy đủ' : 'Đã thanh toán đầy đủ'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          items={tabs.map(tab => ({ key: tab.id, label: tab.label }))}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
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
                      <p className="text-sm text-gray-900 font-medium">{studentData.departmentName || studentData.majorName || '-'}</p>
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

              {/* Semester Selector */}
              <div className="mb-6">
                <div className="w-80">
                  <Dropdown
                    options={semesters.map(s => ({
                      value: s.semesterId,
                      label: s.yearRange ? `${s.semesterName} - ${s.yearRange}` : s.semesterName,
                    }))}
                    value={selectedAcademicSemester}
                    placeholder="Chọn học kì"
                    onChange={(value) => setSelectedAcademicSemester(value)}
                    disabled={loadingGrades || semesters.length === 0}
                  />
                </div>
              </div>

              {/* Grades Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <Table
                  columns={[
                    { key: 'subjectCode', label: 'Mã MH', align: 'left' },
                    { key: 'subjectName', label: 'Tên môn học', align: 'left' },
                    { key: 'credits', label: 'TC', align: 'center' },
                    { key: 'finalGrade', label: 'Điểm thi', align: 'center' },
                    { key: 'finalGrade10', label: 'TK (10)', align: 'center' },
                    { key: 'finalGrade4', label: 'TK (4)', align: 'center' },
                    { key: 'gradeLetter', label: 'TK (C)', align: 'center' },
                    { key: 'status', label: 'Kết quả', align: 'center' },
                    { key: 'details', label: 'Chi tiết', align: 'center' },
                  ]}
                  data={grades?.grades || []}
                  isLoading={loadingGrades}
                  emptyMessage="Không có dữ liệu điểm"
                  className="border-0 rounded-none"
                  renderRow={(grade) => (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{grade.subjectCode}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{grade.subjectName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{grade.credits}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">
                        {grade.finalGrade === null ? '-' : grade.finalGrade.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">
                        {grade.finalGrade10 === null ? '-' : grade.finalGrade10.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">
                        {grade.finalGrade4.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">
                        {grade.gradeLetter || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-medium ${
                          grade.status === 'Đạt' 
                            ? 'text-green-600' 
                            : 'text-red-600'
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
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </button>
                      </td>
                    </>
                  )}
                />

                {/* Summary Section */}
                {grades && (
                  <div className="bg-gray-50 px-6 py-5 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-900">
                          Điểm trung bình tích lũy hệ 4: <span className="text-[#0053AD]">{grades.semesterGPA4.toFixed(2)}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-900">
                          Điểm trung bình tích lũy hệ 10: <span className="text-[#0053AD]">{grades.semesterGPA10.toFixed(2)}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-900">
                          Số tín chỉ tích lũy: <span className="text-[#0053AD]">
                            {grades.grades.filter(g => g.status === 'Đạt').reduce((sum, g) => sum + g.credits, 0)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">Phân loại học lực học kỳ:</span>
                        {(() => {
                          if (!grades.semesterClassification) {
                            return <span className="text-sm text-gray-500">-</span>;
                          }
                          
                          const classificationMap: Record<string, string> = {
                            'Xuất sắc': 'bg-gradient-to-r from-[#FF512F] to-[#DD2476]',
                            'Giỏi': 'bg-gradient-to-r from-[#1FA2FF] to-[#12D8FA]',
                            'Khá': 'bg-gradient-to-r from-[#56ab2f] to-[#a8e063]',
                            'Trung bình': 'bg-gradient-to-r from-[#F7971E] to-[#FFD200]',
                          };
                          
                          const bgClass = classificationMap[grades.semesterClassification] || 'bg-gradient-to-r from-[#ED213A] to-[#93291E]';
                          
                          return (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${bgClass}`}>
                              {grades.semesterClassification}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                    <div className="w-80">
                      <Dropdown
                        options={semesters.map(s => ({
                          value: s.semesterId,
                          label: s.yearRange ? `${s.semesterName} - ${s.yearRange}` : s.semesterName,
                        }))}
                        value={selectedTuitionSemester}
                        placeholder="Chọn học kì"
                        onChange={(value) => setSelectedTuitionSemester(value)}
                        disabled={loadingTuition || semesters.length === 0}
                      />
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
                    <Table
                      columns={[
                        { key: 'courseCode', label: 'Mã môn học', align: 'left' },
                        { key: 'courseName', label: 'Tên môn học', align: 'left' },
                        { key: 'credits', label: 'Số tín chỉ', align: 'center' },
                        { key: 'courseFee', label: 'Học phí', align: 'right' },
                        { key: 'status', label: 'Trạng thái', align: 'center' },
                      ]}
                      data={tuitionFees?.courses || []}
                      isLoading={loadingTuition}
                      emptyMessage="Không có dữ liệu học phí"
                      renderRow={(course) => {
                        const statusDisplay = getPaymentStatusDisplay(course.status);
                        return (
                          <>
                            <td className="px-6 py-4 text-sm text-gray-900">{course.courseCode}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{course.courseName}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{course.credits}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(course.courseFee)}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1.5 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
                                {statusDisplay.label}
                              </span>
                            </td>
                          </>
                        );
                      }}
                    />
                    {tuitionFees && tuitionFees.courses.length > 0 && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        <table className="w-full">
                          <thead className="sr-only">
                            <tr>
                              <th scope="col">Mã môn học</th>
                              <th scope="col">Tên môn học</th>
                              <th scope="col">Số tín chỉ</th>
                              <th scope="col">Học phí</th>
                              <th scope="col">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="font-semibold">
                              <td colSpan={2} className="px-6 py-4 text-sm text-gray-900 text-right">Tổng cộng:</td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                {tuitionFees.courses.reduce((sum, course) => sum + course.credits, 0)} TC
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                {formatCurrency(tuitionFees.courses.reduce((sum, course) => sum + course.courseFee, 0))}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
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
                    <div className="w-80">
                      <Dropdown
                        options={semesters.map(s => ({
                          value: s.semesterId,
                          label: s.yearRange ? `${s.semesterName} - ${s.yearRange}` : s.semesterName,
                        }))}
                        value={selectedInsuranceSemester}
                        placeholder="Chọn học kì"
                        onChange={(value) => setSelectedInsuranceSemester(value)}
                        disabled={loadingInsurance || semesters.length === 0}
                      />
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
                  <Table
                    columns={[
                      { key: 'academicYear', label: 'Năm học', align: 'left' },
                      { key: 'healthInsuranceFee', label: 'Phí bảo hiểm', align: 'right' },
                      { key: 'status', label: 'Trạng thái', align: 'center' },
                    ]}
                    data={insurances}
                    isLoading={loadingInsurance}
                    emptyMessage="Không có dữ liệu bảo hiểm y tế"
                    renderRow={(insurance) => {
                      const statusDisplay = getPaymentStatusDisplay(insurance.status);
                      return (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">{insurance.academicYear}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(insurance.healthInsuranceFee)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1.5 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
                              {statusDisplay.label}
                            </span>
                          </td>
                        </>
                      );
                    }}
                  />
                </div>
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

