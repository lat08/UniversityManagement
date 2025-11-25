'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Download, Plus, Edit, Trash2, X, Users, GraduationCap, BookOpen, School } from 'lucide-react';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import AddStudentModal from './components/AddStudentModal';
import ImportExcelModal from './components/ImportExcelModal';
import ExportStudentModal from './components/ExportStudentModal';
import ConfirmDeleteStudentModal from './components/ConfirmDeleteStudentModal';
import BulkEditStudentModal from './components/BulkEditStudentModal';
import BulkDeleteStudentModal from './components/BulkDeleteStudentModal';
import ColumnSelector, { ColumnConfig } from './components/ColumnSelector';
import { ResizableTable, ResizableColumn } from './components/ResizableTable';
import ActionsMenu from './components/ActionsMenu';
import { studentsApi } from './lib/api/studentsApi';
import { toast } from 'react-hot-toast';
import { Student, AcademicYear, Department, STATUS_OPTIONS, getStatusDisplay } from './lib/types/types';
import { TableSkeleton, StatCardsSkeleton } from './components/LoadingSkeleton';

export default function StudentProfilePage() {
  const t = useTranslations('admin.studentProfile');
  const tCommon = useTranslations('common.actions');
  const locale = useLocale();
  const router = useRouter();
  
  const STAT_CARDS = [
    { 
      key: 'total', 
      label: t('statCards.totalStudents'), 
      bgColor: 'bg-[#FFDDAA]', 
      iconColor: 'text-[#CC8800]',
      Icon: Users,
      subtitle: t('statCards.studying') 
    },
    { 
      key: 'enrolled', 
      label: t('statCards.newStudents'), 
      bgColor: 'bg-[#CCEECC]', 
      iconColor: 'text-[#44AA44]',
      Icon: GraduationCap,
      subtitle: '' 
    },
    { 
      key: 'graduating', 
      label: t('statCards.graduatingSoon'), 
      bgColor: 'bg-[#AACCFF]', 
      iconColor: 'text-[#3366CC]',
      Icon: BookOpen,
      subtitle: t('statCards.expected') 
    },
    { 
      key: 'onLeave', 
      label: t('statCards.onLeave'), 
      bgColor: 'bg-[#FFBBAA]', 
      iconColor: 'text-[#CC4444]',
      Icon: School,
      subtitle: t('statCards.onLeaveSubtitle') 
    },
  ] as const;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [deletingStudentName, setDeletingStudentName] = useState<string | undefined>(undefined);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  
  // Column configuration
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([
    { key: 'checkbox', label: '', visible: true, required: true },
    { key: 'studentCode', label: t('columns.mssv'), visible: true, required: true },
    { key: 'fullName', label: t('columns.fullName'), visible: true, required: true },
    { key: 'email', label: t('columns.email'), visible: true },
    { key: 'facultyName', label: t('columns.faculty'), visible: false },
    { key: 'departmentName', label: t('columns.department'), visible: true },
    { key: 'className', label: t('columns.class'), visible: true },
    { key: 'academicYear', label: t('columns.academicYear'), visible: true },
    { key: 'trainingSystemName', label: t('columns.trainingSystem'), visible: false },
    { key: 'averageGPA', label: t('columns.gpa'), visible: false },
    { key: 'creditsEarned', label: t('columns.credits'), visible: false },
    { key: 'totalOwedAmount', label: t('columns.debt'), visible: false },
    { key: 'enrollmentStatus', label: t('columns.status'), visible: true },
    { key: 'actions', label: t('columns.actions'), visible: true, required: true },
  ]);

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 50, minWidth: 50, align: 'center', visible: true, required: true },
    { key: 'studentCode', label: t('columns.mssv'), width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    { key: 'fullName', label: t('columns.fullName'), width: 200, minWidth: 150, align: 'left', visible: true, required: true },
    { key: 'email', label: t('columns.email'), width: 220, minWidth: 180, align: 'left', visible: true },
    { key: 'facultyName', label: t('columns.faculty'), width: 180, minWidth: 120, align: 'left', visible: false },
    { key: 'departmentName', label: t('columns.department'), width: 180, minWidth: 120, align: 'left', visible: true },
    { key: 'className', label: t('columns.class'), width: 140, minWidth: 100, align: 'left', visible: true },
    { key: 'academicYear', label: t('columns.academicYear'), width: 100, minWidth: 80, align: 'left', visible: true },
    { key: 'trainingSystemName', label: t('columns.trainingSystem'), width: 140, minWidth: 100, align: 'left', visible: false },
    { key: 'averageGPA', label: t('columns.gpa'), width: 100, minWidth: 80, align: 'center', visible: false },
    { key: 'creditsEarned', label: t('columns.credits'), width: 100, minWidth: 80, align: 'center', visible: false },
    { key: 'totalOwedAmount', label: t('columns.debt'), width: 120, minWidth: 100, align: 'center', visible: false },
    { key: 'enrollmentStatus', label: t('columns.status'), width: 140, minWidth: 120, align: 'center', visible: true },
    { key: 'actions', label: t('columns.actions'), width: 140, minWidth: 50, align: 'center', visible: true, required: true },
  ]);
  
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

  const fetchStudents = useCallback(async () => {
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
  }, [currentPage, selectedDepartmentId, selectedAcademicYearId, selectedStatus, searchKeyword, pageSize]);

  // Priority 2: Fetch students after dropdowns loaded
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Memoized stat cards values
  const statValues = useMemo(() => ({
    total: stats.totalStudents,
    enrolled: stats.enrolledThisYear,
    graduating: stats.graduatingSoon,
    onLeave: stats.onLeave,
  }), [stats]);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale],
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const translatedStatusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t],
  );

  const translateStatusDisplay = useCallback(
    (status: string) => getStatusDisplay(status, (key) => t(key)),
    [t],
  );

  // Delete handler
  const handleDeleteClick = useCallback((studentId: string, studentName: string) => {
    setDeletingStudentId(studentId);
    setDeletingStudentName(studentName);
    setIsDeleteModalOpen(true);
  }, []);

  // Select handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      const currentPageStudentIds = students.map(s => s.studentId);
      
      if (checked) {
        // Thêm tất cả students của trang hiện tại vào set (giữ lại selections từ trang khác)
        currentPageStudentIds.forEach(id => newSet.add(id));
      } else {
        // Chỉ xóa students của trang hiện tại khỏi set (giữ lại selections từ trang khác)
        currentPageStudentIds.forEach(id => newSet.delete(id));
      }
      
      return newSet;
    });
  }, [students]);

  const handleSelectOne = useCallback((studentId: string, checked: boolean) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(studentId);
      } else {
        newSet.delete(studentId);
      }
      return newSet;
    });
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedStudentIds(new Set());
  }, []);

  const isAllSelected = useMemo(() => {
    return students.length > 0 && students.every(s => selectedStudentIds.has(s.studentId));
  }, [students, selectedStudentIds]);

  const isSomeSelected = useMemo(() => {
    return selectedStudentIds.size > 0 && !isAllSelected;
  }, [selectedStudentIds, isAllSelected]);

  // Lưu selection info để hiển thị cross-page
  const selectedStudentsInfo = useMemo(() => {
    const selectedOnCurrentPage = students.filter(s => selectedStudentIds.has(s.studentId)).length;
    const totalSelected = selectedStudentIds.size;
    const selectedOnOtherPages = totalSelected - selectedOnCurrentPage;
    
    return {
      selectedOnCurrentPage,
      totalSelected,
      selectedOnOtherPages,
      hasSelectionOnOtherPages: selectedOnOtherPages > 0,
    };
  }, [students, selectedStudentIds]);

  // Handle column visibility changes
  const handleColumnsChange = useCallback((newColumns: typeof columnConfigs) => {
    setColumnConfigs(newColumns);
    // Sync với resizable columns
    setResizableColumns(prev =>
      prev.map(col => ({
        ...col,
        visible: newColumns.find(c => c.key === col.key)?.visible ?? col.visible
      }))
    );
  }, []);

  // Table row renderer with dynamic columns
  const renderStudentRow = useCallback((student: Student, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = translateStatusDisplay(student.enrollmentStatus);
    const isSelected = selectedStudentIds.has(student.studentId);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    
    const paddingXNum = parseFloat(cellStyle.paddingX);
    const isCompact = paddingXNum < 20;
    const checkboxSize = isCompact ? '0.875rem' : '1rem';
    
    return (
      <>
        {visibleColumns.map((column) => {
          const widthPercent = (column as { widthPercent?: number }).widthPercent || 
            (baseTotalWidth > 0 ? (column.width / baseTotalWidth) * 100 : 100 / visibleColumns.length);
          
          const cellPaddingStyle = {
            width: `${widthPercent}%`,
            paddingLeft: cellStyle.paddingX,
            paddingRight: cellStyle.paddingX,
            paddingTop: cellStyle.paddingY,
            paddingBottom: cellStyle.paddingY,
          };
          
          switch (column.key) {
            case 'checkbox':
              return (
                <td key="checkbox" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(student.studentId, e.target.checked)}
                      className="text-[#0053AD] border-gray-300 rounded focus:ring-[#0053AD] cursor-pointer"
                      style={{ width: checkboxSize, height: checkboxSize }}
                    />
                  </div>
                </td>
              );
            case 'studentCode':
              return (
                <td key="studentCode" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.studentCode}
                </td>
              );
            case 'fullName':
              return (
                <td key="fullName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.fullName}
                </td>
              );
            case 'email':
              return (
                <td key="email" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.email}
                </td>
              );
            case 'facultyName':
              return (
                <td key="facultyName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.facultyName || '-'}
                </td>
              );
            case 'departmentName':
              return (
                <td key="departmentName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.departmentName}
                </td>
              );
            case 'className':
              return (
                <td key="className" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.className}
                </td>
              );
            case 'academicYear':
              return (
                <td key="academicYear" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.academicYear}
                </td>
              );
            case 'trainingSystemName':
              return (
                <td key="trainingSystemName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.trainingSystemName || '-'}
                </td>
              );
            case 'averageGPA':
              return (
                <td key="averageGPA" className="text-center text-gray-900" style={cellPaddingStyle}>
                  {student.averageGPA !== null ? student.averageGPA.toFixed(2) : '-'}
                </td>
              );
            case 'creditsEarned':
              return (
                <td key="creditsEarned" className="text-center text-gray-600" style={cellPaddingStyle}>
                  {student.creditsEarnedInCurriculum}/{student.totalCreditsInCurriculum}
                </td>
              );
            case 'totalOwedAmount':
              return (
                <td key="totalOwedAmount" className="text-center text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.totalOwedAmount > 0 ? (
                    <span className="text-red-600 font-medium">
                      {currencyFormatter.format(student.totalOwedAmount)}
                    </span>
                  ) : (
                    <span className="text-green-600">
                      {currencyFormatter.format(0)}
                    </span>
                  )}
                </td>
              );
            case 'enrollmentStatus':
              const statusFontSize = isCompact ? '0.65rem' : '0.75rem';
              const statusPadding = isCompact ? '0.125rem 0.375rem' : '0.25rem 0.5rem';
              return (
                <td key="enrollmentStatus" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <span className={`text-center font-medium rounded ${statusDisplay.color}`} style={{ 
                      padding: statusPadding,
                      fontSize: statusFontSize,
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap',
                    }}>
                      {statusDisplay.label}
                    </span>
                  </div>
                </td>
              );
            case 'actions':
              return (
                <td key="actions" style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}>
                  <ActionsMenu
                    studentId={student.studentId}
                    studentName={student.fullName}
                    onView={() => router.push(`/admin/student-profile/${student.studentId}`)}
                    onEdit={() => router.push(`/admin/student-profile/${student.studentId}/edit`)}
                    onDelete={() => handleDeleteClick(student.studentId, student.fullName)}
                    compact={(column.width || 0) < 120}
                  />
                </td>
              );
            default:
              return null;
          }
        })}
      </>
    );
  }, [router, handleDeleteClick, handleSelectOne, selectedStudentIds, translateStatusDisplay, currencyFormatter]);

  const handleDeleteConfirm = async () => {
    if (!deletingStudentId) return;
    const res = await studentsApi.deleteStudent(deletingStudentId);
    if (res.success) {
      toast.success(t('toast.deleteSuccess'));
      await fetchStudents();
    } else {
      toast.error(res.message || t('toast.deleteError'));
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* Stats Cards */}
      {loading && students.length === 0 ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {STAT_CARDS.map((card, index) => {
            const value = statValues[card.key];
            const { Icon, bgColor, iconColor } = card;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden border border-gray-200">
                <div className={`absolute top-0 right-0 w-20 h-20 ${bgColor} rounded-bl-[100%]`}>
                  <div className="absolute top-5 right-5">
                    <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} strokeWidth={2} />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">
                  {card.label}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">
                  {typeof value === 'number' ? numberFormatter.format(value) : value}
                </p>
                {card.subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600 relative z-10">
                    {card.subtitle}
                  </p>
                )}
                {card.key === 'enrolled' && typeof stats.growthPercentage === 'number' && (
                  <div className="mt-1 flex items-center gap-2 relative z-10">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${stats.growthPercentage < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {stats.growthPercentage < 0 ? (
                        <span className="text-xs">↓</span>
                      ) : (
                        <span className="text-xs">↑</span>
                      )}
                      {`${stats.growthPercentage > 0 ? '+' : ''}${stats.growthPercentage.toFixed(1)}%`}
                    </span>
                    <span className="text-xs text-gray-500">{t('statCards.growthCompared')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          {/* Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                {t('list.title')}
              </h2>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">
                {t('list.description')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Download className="w-4 h-4" />
                {t('import')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="w-4 h-4" />
                {t('export')}
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                <Plus className="w-4 h-4" />
                {t('add')}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <SearchInput
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Department Dropdown */}
            <Dropdown
              options={[
                { value: '', label: t('filters.allDepartments') },
                ...departments.map(d => ({ value: d.departmentId, label: d.departmentName }))
              ]}
              value={selectedDepartmentId || ''}
              placeholder={t('filters.allDepartments')}
              onChange={(value) => {
                setSelectedDepartmentId(value);
                setCurrentPage(1);
              }}
            />

            {/* Academic Year Dropdown */}
            <Dropdown
              options={[
                { value: '', label: t('filters.allAcademicYears') },
                ...academicYears.map(y => ({ value: y.academicYearId, label: y.yearCode }))
              ]}
              value={selectedAcademicYearId || ''}
              placeholder={t('filters.allAcademicYears')}
              onChange={(value) => {
                setSelectedAcademicYearId(value);
                setCurrentPage(1);
              }}
            />

            {/* Status Dropdown & Column Selector */}
            <div className="flex gap-2">
              <Dropdown
                options={translatedStatusOptions}
                value={selectedStatus || ''}
                placeholder={t('filters.allStatuses')}
                onChange={(value) => {
                  setSelectedStatus(value);
                  setCurrentPage(1);
                }}
                className="flex-1"
              />
              
              <ColumnSelector
                columns={columnConfigs}
                onColumnsChange={handleColumnsChange}
              />
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedStudentIds.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {t('bulkActions.selected', { count: selectedStudentsInfo.totalSelected })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkEditModalOpen(true)}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <Edit className="w-4 h-4" />
                  {t('bulkActions.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('bulkActions.delete')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                  {t('bulkActions.deselect')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            <ResizableTable
              columns={resizableColumns}
              data={students}
              renderRow={(student, visibleColumns, cellStyle) => {
                const isSelected = selectedStudentIds.has(student.studentId);
                return (
                  <tr
                    className={`transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 hover:bg-blue-100' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {renderStudentRow(student, visibleColumns, cellStyle)}
                  </tr>
                );
              }}
              renderHeaderCheckbox={() => {
                const checkboxSize = '1rem';
                return (
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="text-white border-white rounded focus:ring-white cursor-pointer"
                    style={{ width: checkboxSize, height: checkboxSize }}
                  />
                );
              }}
              isLoading={loading}
              emptyMessage={tCommon('noData')}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
            />
          </div>
        </div>

        {/* Pagination */}
        <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
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

      <BulkEditStudentModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedStudentIds={Array.from(selectedStudentIds)}
        onSuccess={() => {
          fetchStudents();
          setSelectedStudentIds(new Set());
        }}
      />

      <BulkDeleteStudentModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        selectedStudentIds={Array.from(selectedStudentIds)}
        onSuccess={() => {
          fetchStudents();
          setSelectedStudentIds(new Set());
        }}
      />
    </div>
  );
}

