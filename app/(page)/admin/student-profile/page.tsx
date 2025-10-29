'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Trash2, Download, Plus, Search, ChevronDown } from 'lucide-react';
import AddStudentModal from './components/AddStudentModal';
import ImportExcelModal from './components/ImportExcelModal';
import ExportStudentModal from './components/ExportStudentModal';

// Dummy data
const STATS = [
  { label: 'Tổng sinh viên', value: '2,847', subtitle: 'Đang học', color: 'bg-orange-50', icon: '📋' },
  { label: 'Tân sinh viên', value: '342', subtitle: 'SV mới vào năm trước', color: 'bg-teal-50', icon: '🎓' },
  { label: 'Sắp tốt nghiệp', value: '156', subtitle: 'Năm 2024', color: 'bg-blue-50', icon: '🎯' },
  { label: 'Bảo lưu', value: '23', subtitle: 'Tạm nghỉ', color: 'bg-red-50', icon: '📌' },
];

const STUDENTS = [
  { mssv: '20032007', name: 'Trần Thị Thảo', major: 'Tâm lý học', class: 'K18', email: 'tranthithao18@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21122005', name: 'Lê Anh Kiệt', major: 'Khoa học máy tính', class: 'K16', email: 'leanhkiet16@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055627', name: 'Nguyễn Văn A', major: 'Quản trị kinh doanh', class: 'K16', email: 'nguyenvana16@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055542', name: 'Đào Gia B', major: 'Dược phương học', class: 'K17', email: 'daogiab17@example.com', status: 'Bảo lưu', statusColor: 'bg-gray-100 text-gray-700' },
  { mssv: '21055543', name: 'Trần Nguyễn Kim C', major: 'Marketing', class: 'K16', email: 'trannguyenkimc17@example.com', status: 'Bảo lưu', statusColor: 'bg-gray-100 text-gray-700' },
  { mssv: '21055544', name: 'Phan Thái D', major: 'Logistics', class: 'K17', email: 'phanthaid17@example.com', status: 'Đình chỉ', statusColor: 'bg-yellow-100 text-yellow-700' },
  { mssv: '21055545', name: 'Huỳnh Văn E', major: 'Thương mại điện tử', class: 'K17', email: 'huynhvane17@example.com', status: 'Thôi học', statusColor: 'bg-red-100 text-red-700' },
  { mssv: '21055546', name: 'Bùi Minh F', major: 'Quan hệ công chúng', class: 'K18', email: 'buiminhf18@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055547', name: 'Nguyễn Thị G', major: 'Tâm lý học', class: 'K18', email: 'nguyenthig18@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055548', name: 'Trần Văn H', major: 'Khoa học máy tính', class: 'K17', email: 'tranvanh17@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055549', name: 'Lê Thị I', major: 'Quản trị kinh doanh', class: 'K16', email: 'lethii16@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055550', name: 'Phạm Văn J', major: 'Marketing', class: 'K18', email: 'phamvanj18@example.com', status: 'Bảo lưu', statusColor: 'bg-gray-100 text-gray-700' },
  { mssv: '21055551', name: 'Hoàng Thị K', major: 'Logistics', class: 'K17', email: 'hoangthik17@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055552', name: 'Vũ Văn L', major: 'Thương mại điện tử', class: 'K16', email: 'vuvanl16@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055553', name: 'Đặng Thị M', major: 'Quan hệ công chúng', class: 'K18', email: 'dangthim18@example.com', status: 'Đình chỉ', statusColor: 'bg-yellow-100 text-yellow-700' },
  { mssv: '21055554', name: 'Bùi Văn N', major: 'Tâm lý học', class: 'K17', email: 'buivann17@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055555', name: 'Ngô Thị O', major: 'Khoa học máy tính', class: 'K16', email: 'ngothio16@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055556', name: 'Dương Văn P', major: 'Quản trị kinh doanh', class: 'K18', email: 'duongvanp18@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
  { mssv: '21055557', name: 'Lý Thị Q', major: 'Marketing', class: 'K17', email: 'lythiq17@example.com', status: 'Thôi học', statusColor: 'bg-red-100 text-red-700' },
  { mssv: '21055558', name: 'Trương Văn R', major: 'Logistics', class: 'K16', email: 'truongvanr16@example.com', status: 'Đang học', statusColor: 'bg-green-100 text-green-700' },
];

export default function StudentProfilePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMajorOpen, setIsMajorOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState('Tất cả ngành');
  const [selectedClass, setSelectedClass] = useState('Tất cả khóa');
  const [selectedStatus, setSelectedStatus] = useState('Đang học');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const majors = [
    'Tất cả ngành',
    'Tâm lý học',
    'Khoa học máy tính',
    'Quản trị kinh doanh',
    'Dược phương học',
    'Marketing',
    'Logistics',
    'Thương mại điện tử',
    'Quan hệ công chúng',
  ];

  const classes = ['Tất cả khóa', 'K16', 'K17', 'K18'];
  const statuses = ['Đang học', 'Bảo lưu', 'Đình chỉ', 'Thôi học'];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ sinh viên</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin sinh viên</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} rounded-lg p-6 border border-gray-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Danh sách sinh viên
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý hồ sơ và thông tin sinh viên
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Nhập Excel
              </button>
              <button 
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Xuất Excel
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm sinh viên
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo MSSV, tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
              />
            </div>

            {/* Major Dropdown */}
            <div className="relative w-80" data-dropdown="major">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                onClick={() => {
                  setIsMajorOpen(!isMajorOpen);
                  setIsClassOpen(false);
                  setIsStatusOpen(false);
                }}
              >
                <span className="text-sm text-gray-900">{selectedMajor}</span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
              </button>
              {isMajorOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {majors.map((major) => (
                    <button
                      key={major}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setSelectedMajor(major);
                        setIsMajorOpen(false);
                      }}
                    >
                      {major}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Class Dropdown */}
            <div className="relative w-40" data-dropdown="class">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                onClick={() => {
                  setIsClassOpen(!isClassOpen);
                  setIsMajorOpen(false);
                  setIsStatusOpen(false);
                }}
              >
                <span className="text-sm text-gray-900">{selectedClass}</span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
              </button>
              {isClassOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  {classes.map((cls) => (
                    <button
                      key={cls}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setSelectedClass(cls);
                        setIsClassOpen(false);
                      }}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative w-40" data-dropdown="status">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsMajorOpen(false);
                  setIsClassOpen(false);
                }}
              >
                <span className="text-sm text-gray-900">{selectedStatus}</span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
              </button>
              {isStatusOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setSelectedStatus(status);
                        setIsStatusOpen(false);
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0053AD] text-white text-sm">
                    <th className="px-6 py-4 text-left font-semibold">MSSV</th>
                    <th className="px-6 py-4 text-left font-semibold">Họ và tên</th>
                    <th className="px-6 py-4 text-left font-semibold">Ngành học</th>
                    <th className="px-6 py-4 text-left font-semibold">Khóa</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {STUDENTS.map((student, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.mssv}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.major}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.class}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`w-full text-center px-3 py-1 text-xs font-medium rounded-[5px] ${student.statusColor}`}>
                            {student.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/student-profile/${student.mssv}`)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/student-profile/${student.mssv}/edit`)}
                            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-medium">1-20</span> trong tổng số{' '}
            <span className="font-medium">2,847</span> sinh viên
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 cursor-pointer">
              Trước
            </button>
            <button className="px-3 py-1 text-sm bg-[#0053AD] text-white rounded cursor-pointer">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
              2
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
              3
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
              ...
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
              143
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <ImportExcelModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <ExportStudentModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
}

