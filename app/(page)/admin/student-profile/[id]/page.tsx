'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MapPin, Mail, Phone, Calendar, User, School, Edit } from 'lucide-react';
import Image from 'next/image';
import { studentsApi } from '../lib/api/studentsApi';
import { StudentDetail, getStatusDisplay } from '../lib/types/types';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const [activeTab, setActiveTab] = useState('basic');
  const [studentData, setStudentData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const response = await studentsApi.getStudentById(studentId);
      if (response.success) {
        setStudentData(response.data);
      }
    } catch (error) {
      console.error('Error fetching student detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'academic', label: 'Kết quả học tập' },
    { id: 'tuition', label: 'Học phí' },
  ];

  const handleEdit = () => {
    router.push(`/admin/student-profile/${studentId}/edit`);
  };

  const handleBack = () => {
    router.push('/admin/student-profile');
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format gender
  const formatGender = (gender: string) => {
    const genderMap: Record<string, string> = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    };
    return genderMap[gender] || gender;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
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
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                {studentData.profilePicture ? (
                  <Image
                    src={studentData.profilePicture}
                    alt="Student Avatar"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <button className={`mt-3 w-32 text-xs text-white px-3 py-1.5 rounded-md cursor-pointer transition-colors ${statusDisplay.color === 'bg-green-100 text-green-700' ? 'bg-[#0053AD] hover:bg-[#003d82]' : 'bg-gray-500 hover:bg-gray-600'}`}>
                {statusDisplay.label}
              </button>
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
          <p className="text-4xl font-bold text-gray-900 mb-1">-</p>
          <p className="text-xs text-gray-500">/4.0</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">Tín chỉ tích lũy</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">-</p>
          <p className="text-xs text-gray-500">/120</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">Công nợ</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">-</p>
          <p className="text-xs text-gray-500">Đã thanh toán đầy đủ</p>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div>
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
          )}

          {/* Academic Results Tab */}
          {activeTab === 'academic' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Kết quả học tập</h2>
                <p className="text-sm text-gray-600">Bảng điểm và kết quả học tập theo học kỳ</p>
              </div>

              {/* Semester Selector */}
              <div className="mb-6">
                <div className="relative w-80">
                  <select className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent appearance-none cursor-pointer">
                    <option>Học kỳ I (2021 - 2022)</option>
                    <option>Học kỳ II (2021 - 2022)</option>
                    <option>Học kỳ I (2022 - 2023)</option>
                    <option>Học kỳ II (2022 - 2023)</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
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
                      <th className="px-6 py-4 text-center font-semibold border-r border-blue-400">Điểm TK ( C )</th>
                      <th className="px-6 py-4 text-center font-semibold border-r border-blue-400">Kết quả</th>
                      <th className="px-6 py-4 text-center font-semibold">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                        Chức năng đang được phát triển
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tuition Tab */}
          {activeTab === 'tuition' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Lịch sử học phí</h2>
                <p className="text-sm text-gray-600">Thông tin thanh toán học phí</p>
              </div>

              {/* Semester Selector and Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-80">
                  <select className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent appearance-none cursor-pointer">
                    <option>Học kỳ II - Năm học 2024 - 2025</option>
                    <option>Học kỳ I - Năm học 2024 - 2025</option>
                    <option>Học kỳ II - Năm học 2023 - 2024</option>
                    <option>Học kỳ I - Năm học 2023 - 2024</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    In
                  </button>
                  <button className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Xuất Excel
                  </button>
                </div>
              </div>

              {/* Tuition Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0053AD] text-white text-sm">
                      <th className="px-6 py-4 text-left font-semibold border-r border-blue-400">Ngày</th>
                      <th className="px-6 py-4 text-left font-semibold border-r border-blue-400">Nội dung</th>
                      <th className="px-6 py-4 text-left font-semibold border-r border-blue-400">Số tiền</th>
                      <th className="px-6 py-4 text-left font-semibold border-r border-blue-400">Phương thức</th>
                      <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Chức năng đang được phát triển
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
    </div>
  );
}
