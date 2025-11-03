'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus, TrendingUp, TrendingDown, Eye, Edit, Trash2 } from 'lucide-react';
import { Dropdown, StatCard, SearchInput, Button } from '@/app/components/ui';
import { Table } from '@/app/components/ui/table';
import { Pagination } from '@/app/components/ui/pagination';
import AddStudentModal from './components/AddStudentModal';
import ImportExcelModal from './components/ImportExcelModal';
import ExportStudentModal from './components/ExportStudentModal';
import ConfirmDeleteStudentModal from './components/ConfirmDeleteStudentModal';
import { studentsApi } from './lib/api/studentsApi';
import { toast } from 'react-hot-toast';
import { Student, AcademicYear, Department, STATUS_OPTIONS, getStatusDisplay } from './lib/types/types';
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
  

  // Memoized stat cards values
  const statValues = useMemo(() => ({
    total: stats.totalStudents,
    enrolled: stats.enrolledThisYear,
    graduating: stats.graduatingSoon,
    onLeave: stats.onLeave,
  }), [stats]);

  // Prefetch handler for hover
  const handlePrefetchStudent = useCallback((studentId: string) => {
    router.prefetch(`/admin/student-profile/${studentId}`);
  }, [router]);

  // Delete handler
  const handleDeleteClick = useCallback((studentId: string, studentName: string) => {
    setDeletingStudentId(studentId);
    setDeletingStudentName(studentName);
    setIsDeleteModalOpen(true);
  }, []);

  // Table columns
  const tableColumns = [
    { key: 'studentCode', label: 'MSSV', align: 'left' as const },
    { key: 'fullName', label: 'Họ và tên', align: 'left' as const },
    { key: 'departmentName', label: 'Ngành học', align: 'left' as const },
    { key: 'academicYear', label: 'Khóa', align: 'left' as const },
    { key: 'email', label: 'Email', align: 'left' as const },
    { key: 'status', label: 'Trạng thái', align: 'center' as const },
    { key: 'actions', label: 'Thao tác', align: 'center' as const },
  ];

  // Table row renderer
  const renderStudentRow = useCallback((student: Student, index: number) => {
    const statusDisplay = getStatusDisplay(student.enrollmentStatus);
    return (
      <>
        <td className="px-6 py-4 text-sm text-gray-900">
          {student.studentCode}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {student.fullName}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {student.departmentName}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {student.academicYear}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {student.email}
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-center">
            <span className={`w-full text-center px-3 py-1 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
              {statusDisplay.label}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/student-profile/${student.studentId}`)}
              onMouseEnter={() => handlePrefetchStudent(student.studentId)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              title="Xem chi tiết"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/student-profile/${student.studentId}/edit`)}
              className="text-gray-600 hover:text-green-600 hover:bg-green-50"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(student.studentId, student.fullName)}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </>
    );
  }, [router, handlePrefetchStudent, handleDeleteClick]);

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
              <StatCard
                key={index}
                label={card.label}
                value={value}
                subtitle={card.subtitle || undefined}
                icon={card.icon}
                color={card.color}
                growth={card.key === 'enrolled' && typeof stats.growthPercentage === 'number' ? {
                  percentage: stats.growthPercentage,
                  label: 'so với năm trước'
                } : undefined}
              />
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
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Download className="w-4 h-4" />
                Nhập Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="w-4 h-4" />
                Xuất Excel
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                <Plus className="w-4 h-4" />
                Thêm sinh viên
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            {/* Search Input */}
            <SearchInput
              placeholder="Tìm kiếm theo MSSV, tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Department Dropdown */}
            <div className="w-64">
              <Dropdown
                options={[
                  { value: '', label: 'Tất cả chuyên ngành' },
                  ...departments.map(d => ({ value: d.departmentId, label: d.departmentName }))
                ]}
                value={selectedDepartmentId || ''}
                placeholder="Tất cả chuyên ngành"
                onChange={(value) => {
                  setSelectedDepartmentId(value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Academic Year Dropdown */}
            <div className="w-40">
              <Dropdown
                options={[
                  { value: '', label: 'Tất cả khóa' },
                  ...academicYears.map(y => ({ value: y.academicYearId, label: y.yearCode }))
                ]}
                value={selectedAcademicYearId || ''}
                placeholder="Tất cả khóa"
                onChange={(value) => {
                  setSelectedAcademicYearId(value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Status Dropdown */}
            <div className="w-52">
              <Dropdown
                options={STATUS_OPTIONS}
                value={selectedStatus || ''}
                placeholder="Tất cả"
                onChange={(value) => {
                  setSelectedStatus(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="mt-6">
            <Table
              columns={tableColumns}
              data={students}
              renderRow={renderStudentRow}
              isLoading={loading}
              loadingComponent={
                <tr>
                  <td colSpan={7} className="p-0">
                    <TableSkeleton />
                  </td>
                </tr>
              }
              emptyMessage="Không có dữ liệu"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
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

