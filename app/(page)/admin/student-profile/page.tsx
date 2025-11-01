'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus, Search, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import AddStudentModal from './components/AddStudentModal';
import ImportExcelModal from './components/ImportExcelModal';
import ExportStudentModal from './components/ExportStudentModal';
import ConfirmDeleteStudentModal from './components/ConfirmDeleteStudentModal';
import StudentTableRow from './components/StudentTableRow';
import { studentsApi } from './lib/api/studentsApi';
import { toast } from 'react-hot-toast';
import { Student, AcademicYear, Department, STATUS_OPTIONS } from './lib/types/types';
import { TableSkeleton, StatCardsSkeleton } from './components/LoadingSkeleton';

const STAT_CARDS = [
  { key: 'total', label: 'Tổng sinh viên', color: 'bg-orange-50', icon: '📋', subtitle: 'Đang học' },
  { key: 'enrolled', label: 'Tân sinh viên', color: 'bg-teal-50', icon: '🎓', subtitle: '' },
  { key: 'graduating', label: 'Sắp tốt nghiệp', color: 'bg-blue-50', icon: '🎯', subtitle: 'Dự kiến' },
  { key: 'onLeave', label: 'Bảo lưu', color: 'bg-red-50', icon: '📌', subtitle: 'Tạm nghỉ' },
] as const;

export default function StudentProfilePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [deletingStudentName, setDeletingStudentName] = useState<string | undefined>(undefined);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [stats, setStats] = useState({
    currentYear: undefined as number | undefined,
    totalStudents: 0,
    enrolledThisYear: 0,
    enrolledLastYear: undefined as number | undefined,
    growthPercentage: undefined as number | undefined,
    graduatingSoon: 0,
    onLeave: 0,
  });
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);

  // Priority 1: Fetch dropdowns in parallel first for better UX
  useEffect(() => {
    const fetchDropdownData = async () => {
      await Promise.all([
        fetchDepartments(),
        fetchAcademicYears(),
      ]);
    };
    fetchDropdownData();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Priority 2: Fetch students after dropdowns loaded
  useEffect(() => {
    fetchStudents();
  }, [currentPage, selectedDepartmentId, selectedAcademicYearId, selectedStatus, searchKeyword]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (!target.closest('[data-dropdown]')) {
        setIsDepartmentOpen(false);
        setIsClassOpen(false);
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await studentsApi.getDepartments({
        pageNumber: 1,
        pageSize: 100,
      });
      if (response.success) {
        setDepartments(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await studentsApi.getAcademicYears({ count: 4 });
      if (response.success) {
        setAcademicYears(response.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsApi.getStudents({
        pageNumber: currentPage,
        pageSize: pageSize,
        searchKeyword: searchKeyword || undefined,
        departmentId: selectedDepartmentId || undefined,
        academicYearId: selectedAcademicYearId || undefined,
        enrollmentStatus: selectedStatus || undefined,
      });
      
      if (response.success) {
        setStudents(response.data.students);
        setTotalCount(response.data.pagination.totalCount);
        setTotalPages(response.data.pagination.totalPages);
        if (response.data.statistics) {
          setStats(prev => ({ ...prev, ...response.data.statistics }));
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Memoized pagination calculation
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // Memoized stat cards values
  const statValues = useMemo(() => ({
    total: stats.totalStudents,
    enrolled: stats.enrolledThisYear,
    graduating: stats.graduatingSoon,
    onLeave: stats.onLeave,
  }), [stats]);

  // Prefetch handler for hover
  const handlePrefetchStudent = useCallback((studentId: string) => {
    // Prefetch the student detail page
    router.prefetch(`/admin/student-profile/${studentId}`);
  }, [router]);

  // Delete handler
  const handleDeleteClick = useCallback((studentId: string, studentName: string) => {
    setDeletingStudentId(studentId);
    setDeletingStudentName(studentName);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingStudentId) return;
    const res = await studentsApi.deleteStudent(deletingStudentId);
    if (res.success) {
      toast.success('Xoá sinh viên thành công');
      await fetchStudents();
    } else {
      toast.error(res.message || 'Xoá sinh viên thất bại');
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ sinh viên</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin sinh viên</p>
      </div>

      {/* Stats Cards */}
      {loading && students.length === 0 ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STAT_CARDS.map((card, index) => {
            const value = statValues[card.key];
            return (
            <div
              key={index}
              className={`${card.color} rounded-lg p-6 border border-gray-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">{card.label}</p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">
                    {value.toLocaleString()}
                  </p>
                  {card.subtitle ? (
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  ) : null}
                  {card.key === 'enrolled' && typeof stats.growthPercentage === 'number' && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${stats.growthPercentage < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stats.growthPercentage < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {`${stats.growthPercentage > 0 ? '+' : ''}${stats.growthPercentage.toFixed(1)}%`}
                      </span>
                      <span className="text-xs text-gray-500">so với năm trước</span>
                    </div>
                  )}
                </div>
                <div className="text-3xl">{card.icon}</div>
              </div>
            </div>
            );
          })}
        </div>
      )}

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

            {/* Department Dropdown */}
            <div className="relative w-64" data-dropdown="department">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                onClick={() => {
                  setIsDepartmentOpen(!isDepartmentOpen);
                  setIsClassOpen(false);
                  setIsStatusOpen(false);
                }}
              >
                <span className="text-sm text-gray-900">
                  {selectedDepartmentId 
                    ? departments.find(d => d.departmentId === selectedDepartmentId)?.departmentName || 'Tất cả chuyên ngành'
                    : 'Tất cả chuyên ngành'
                  }
                </span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
              </button>
              {isDepartmentOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
                    onClick={() => {
                      setSelectedDepartmentId('');
                      setIsDepartmentOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    Tất cả chuyên ngành
                  </button>
                  {departments.map((department) => (
                    <button
                      key={department.departmentId}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                      onClick={() => {
                        setSelectedDepartmentId(department.departmentId);
                        setIsDepartmentOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {department.departmentName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Academic Year Dropdown */}
            <div className="relative w-40" data-dropdown="academicYear">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                onClick={() => {
                  setIsClassOpen(!isClassOpen);
                  setIsDepartmentOpen(false);
                  setIsStatusOpen(false);
                }}
              >
                <span className="text-sm text-gray-900">
                  {selectedAcademicYearId
                    ? academicYears.find(y => y.academicYearId === selectedAcademicYearId)?.yearCode || 'Tất cả khóa'
                    : 'Tất cả khóa'
                  }
                </span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
              </button>
              {isClassOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
                    onClick={() => {
                      setSelectedAcademicYearId('');
                      setIsClassOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    Tất cả khóa
                  </button>
                  {academicYears.map((year) => (
                    <button
                      key={year.academicYearId}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                      onClick={() => {
                        setSelectedAcademicYearId(year.academicYearId);
                        setIsClassOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {year.yearCode}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative w-52" data-dropdown="status">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsDepartmentOpen(false);
                  setIsClassOpen(false);
                }}
              >
                <span className="text-sm text-gray-900">
                  {STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label || 'Tất cả'}
                </span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
              </button>
              {isStatusOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setSelectedStatus(status.value);
                        setIsStatusOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {status.label}
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
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <TableSkeleton />
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <StudentTableRow
                        key={student.studentId}
                        student={student}
                        onDelete={handleDeleteClick}
                        onPrefetch={() => handlePrefetchStudent(student.studentId)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-medium">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)}</span> trong tổng số{' '}
            <span className="font-medium">{totalCount}</span> sinh viên
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Trước
            </button>
            {pageNumbers.map((page, index) => 
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#0053AD] text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="px-3 py-1 text-sm text-gray-400">
                  {page}
                </span>
              )
            )}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchStudents}
      />
      <ImportExcelModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={fetchStudents}
      />
      <ExportStudentModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        filters={{
          searchKeyword: searchKeyword || undefined,
          departmentId: selectedDepartmentId || undefined,
          facultyId: departments.find(d => d.departmentId === selectedDepartmentId)?.facultyId || undefined,
          academicYearId: selectedAcademicYearId || undefined,
          enrollmentStatus: selectedStatus || undefined,
        }}
      />

      <ConfirmDeleteStudentModal
        isOpen={isDeleteModalOpen}
        studentName={deletingStudentName}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingStudentId(null);
          setDeletingStudentName(undefined);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

