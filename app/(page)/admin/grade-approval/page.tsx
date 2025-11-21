'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button, SearchInput, Dropdown } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { ResizableTable, ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable';
import { TableSkeleton, StatCardsSkeleton } from './components/LoadingSkeleton';
import FilterDropdown from './components/FilterDropdown';
import { BulkActionBar } from './components/BulkActionBar';
import GradeApprovalActionsMenu from './components/GradeApprovalActionsMenu';
import ExportGradeApprovalModal from './components/ExportGradeApprovalModal';
import { GradeApprovalDetailModal } from './components/GradeApprovalDetailModal';
import { gradeApprovalsApi } from './lib/api/gradeApprovalsApi';
import { commonApi } from '@/lib/api/common';
import { queryKeys } from '@/lib/api/queryKeys';
import {
  AdminGradeApprovalListItem,
  GradeApprovalDropdownContext,
  GradeApprovalFilterState,
  APPROVAL_STATUS_OPTIONS,
  ExportGradeApprovalsParams,
  GetGradeApprovalsParams,
  getApprovalStatusDisplay,
} from './lib/types/types';
import { useCountUp } from '@/lib/hooks/useCountUp';

const STAT_CARDS = [
  { key: 'total', label: 'Tổng bảng điểm', color: 'blue', icon: FileText, description: 'Toàn bộ' },
  { key: 'pending', label: 'Chờ phê duyệt', color: 'orange', icon: Clock, description: 'Đang chờ' },
  { key: 'approved', label: 'Đã duyệt', color: 'green', icon: CheckCircle, description: 'Hoàn tất' },
  { key: 'rejected', label: 'Từ chối', color: 'red', icon: XCircle, description: 'Bị từ chối' },
] as const;

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function GradeApprovalPage() {
  const queryClient = useQueryClient();
  const [isStatsAnimationActive, setIsStatsAnimationActive] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  const [filters, setFilters] = useState<GradeApprovalFilterState>({});
  const [selectedFilterTypes, setSelectedFilterTypes] = useState<string[]>(['status', 'semester']);
  const [selectedGradeVersionIds, setSelectedGradeVersionIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchInput.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = useCallback((key: keyof GradeApprovalFilterState, value?: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value || undefined };
      if (key === 'semesterId') {
        next.subjectId = undefined;
        next.courseClassId = undefined;
      }
      if (key === 'subjectId') {
        next.courseClassId = undefined;
      }
      if (key === 'facultyId') {
        next.departmentId = undefined;
      }
      return next;
    });
    setCurrentPage(1);
  }, []);

  const handleFilterTypesChange = useCallback((types: string[]) => {
    setSelectedFilterTypes(types);
    setFilters((prev) => {
      const next = { ...prev };
      if (!types.includes('status')) next.versionStatus = undefined;
      if (!types.includes('semester')) {
        next.semesterId = undefined;
        next.subjectId = undefined;
        next.courseClassId = undefined;
      }
      if (!types.includes('subject')) {
        next.subjectId = undefined;
        next.courseClassId = undefined;
      }
      if (!types.includes('courseClass')) {
        next.courseClassId = undefined;
      }
      if (!types.includes('faculty')) {
        next.facultyId = undefined;
        next.departmentId = undefined;
      }
      if (!types.includes('department')) {
        next.departmentId = undefined;
      }
      if (!types.includes('instructor')) {
        next.instructorId = undefined;
      }
      return next;
    });
  }, []);

  const { data: semesters = [] } = useQuery({
    queryKey: queryKeys.common.semesters(),
    queryFn: async () => {
      const response = await commonApi.getSemesters();
      return response.data ?? [];
    },
    staleTime: 300_000,
  });

  const { data: faculties = [] } = useQuery({
    queryKey: queryKeys.common.faculties(),
    queryFn: async () => {
      const response = await commonApi.getFaculties();
      return response.data ?? [];
    },
    staleTime: 300_000,
  });

  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.common.departments(filters.facultyId),
    queryFn: async () => {
      const response = await commonApi.getDepartments(
        filters.facultyId ? { facultyId: filters.facultyId } : undefined,
      );
      return response.data ?? [];
    },
    enabled: selectedFilterTypes.includes('department') || Boolean(filters.departmentId),
    staleTime: 300_000,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: queryKeys.common.subjects(filters.semesterId),
    queryFn: async () => {
      if (!filters.semesterId) return [];
      const response = await commonApi.getSubjects({ semesterId: filters.semesterId });
      return response.data ?? [];
    },
    enabled: Boolean(filters.semesterId),
    staleTime: 300_000,
  });

  const { data: courseClasses = [] } = useQuery({
    queryKey: queryKeys.common.courseClasses(filters.subjectId, filters.semesterId),
    queryFn: async () => {
      if (!filters.subjectId) return [];
      const response = await commonApi.getCourseClasses({
        subjectId: filters.subjectId,
        semesterId: filters.semesterId,
      });
      return response.data ?? [];
    },
    enabled: Boolean(filters.subjectId),
    staleTime: 300_000,
  });

  const { data: instructors = [] } = useQuery({
    queryKey: queryKeys.common.instructors('all'),
    queryFn: async () => {
      const response = await commonApi.getInstructors();
      return response.data ?? [];
    },
    enabled: selectedFilterTypes.includes('instructor'),
    staleTime: 300_000,
  });

  const listQueryParams = useMemo<GetGradeApprovalsParams>(
    () => ({
      ...filters,
      searchKey: searchKeyword || undefined,
      pageNumber: currentPage,
      pageSize,
    }),
    [filters, searchKeyword, currentPage],
  );

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useQuery({
    queryKey: queryKeys.adminGradeApprovals.list(listQueryParams),
    queryFn: () => gradeApprovalsApi.getGradeApprovals(listQueryParams),
  });

  const {
    data: statisticsData,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: queryKeys.adminGradeApprovals.statistics(),
    queryFn: () => gradeApprovalsApi.getGradeApprovalStatistics(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!statisticsData || !isStatsAnimationActive) {
      return;
    }
    const timer = setTimeout(() => setIsStatsAnimationActive(false), 1_300);
    return () => clearTimeout(timer);
  }, [statisticsData, isStatsAnimationActive]);

  const gradeApprovals = useMemo(() => listData?.items ?? [], [listData?.items]);
  const totalCount = listData?.totalCount ?? 0;
  const totalPages = listData?.totalPages ?? 0;

  const statValues = useMemo(
    () => ({
      total: statisticsData?.totalGradeVersions ?? 0,
      pending: statisticsData?.pendingCount ?? 0,
      approved: statisticsData?.approvedCount ?? 0,
      rejected: statisticsData?.rejectedCount ?? 0,
    }),
    [statisticsData],
  );

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 50, minWidth: 50, align: 'center', visible: true },
    { key: 'courseCode', label: 'Mã môn', width: 120, minWidth: 90, align: 'left', visible: true },
    { key: 'courseName', label: 'Môn học', width: 220, minWidth: 180, align: 'left', visible: true },
    { key: 'className', label: 'Lớp', width: 110, minWidth: 90, align: 'left', visible: true },
    { key: 'instructorName', label: 'Giảng viên', width: 160, minWidth: 120, align: 'left', visible: true },
    { key: 'semester', label: 'Học kỳ', width: 150, minWidth: 120, align: 'left', visible: true },
    { key: 'studentCount', label: 'Số SV', width: 90, minWidth: 70, align: 'center', visible: true },
    { key: 'submittedDate', label: 'Ngày nộp', width: 140, minWidth: 110, align: 'center', visible: true },
    { key: 'approvalStatus', label: 'Trạng thái', width: 140, minWidth: 110, align: 'center', visible: true },
    { key: 'actions', label: 'Thao tác', width: 180, minWidth: 100, align: 'center', visible: true },
  ]);

  const handleSelectAll = useCallback(() => {
    if (selectedGradeVersionIds.size === gradeApprovals.length) {
      setSelectedGradeVersionIds(new Set());
    } else {
      setSelectedGradeVersionIds(new Set(gradeApprovals.map((item) => item.gradeVersionId)));
    }
  }, [gradeApprovals, selectedGradeVersionIds.size]);

  const handleSelectOne = useCallback((id: string) => {
    setSelectedGradeVersionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const bulkApproveMutation = useMutation({
    mutationFn: gradeApprovalsApi.bulkApproveGrades,
  });

  const bulkRejectMutation = useMutation({
    mutationFn: gradeApprovalsApi.bulkRejectGrades,
  });

  const invalidateGradeData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.adminGradeApprovals.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminGradeApprovals.statistics() }),
    ]);
  }, [queryClient]);

  const handleBulkAction = useCallback(
    async (action: 'approve' | 'reject', ids: string[]) => {
      if (ids.length === 0) return;
      try {
        const mutation = action === 'approve' ? bulkApproveMutation : bulkRejectMutation;
        const result = await mutation.mutateAsync({ gradeVersionIds: ids });
        toast.success(
          `${action === 'approve' ? 'Duyệt' : 'Từ chối'} thành công ${result.successCount}/${ids.length} bảng điểm`,
        );
        setSelectedGradeVersionIds(new Set());
        await invalidateGradeData();
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (error as { message?: string })?.message ||
          'Đã xảy ra lỗi. Vui lòng thử lại.';
        toast.error(message);
      }
    },
    [bulkApproveMutation, bulkRejectMutation, invalidateGradeData],
  );

  const handleBulkApprove = () =>
    handleBulkAction('approve', Array.from(selectedGradeVersionIds));
  const handleBulkReject = () =>
    handleBulkAction('reject', Array.from(selectedGradeVersionIds));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedGradeVersionIds(new Set());
  };

  const dropdownContext: GradeApprovalDropdownContext = useMemo(
    () => ({
      semesters,
      subjects,
      courseClasses,
      faculties,
      departments,
      instructors,
    }),
    [semesters, subjects, courseClasses, faculties, departments, instructors],
  );

  const exportFilters: ExportGradeApprovalsParams = {
    ...filters,
    searchKey: searchKeyword || undefined,
  };

  const isAnyMutationPending = bulkApproveMutation.isPending || bulkRejectMutation.isPending;

  const renderGradeApprovalRow = useCallback(
    (
      approval: AdminGradeApprovalListItem,
      visibleColumns: ResizableColumn[],
      cellStyle: { paddingX: string; paddingY: string },
    ) => {
      const statusDisplay = getApprovalStatusDisplay(approval.versionStatus);
      const isSelected = selectedGradeVersionIds.has(approval.gradeVersionId);
      const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);

      const paddingXNum = parseFloat(cellStyle.paddingX);
      const isCompact = paddingXNum < 20;

      return (
        <>
          {visibleColumns.map((column) => {
            const widthPercent =
              (column as { widthPercent?: number }).widthPercent ||
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
                        onChange={() => handleSelectOne(approval.gradeVersionId)}
                        className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                      />
                    </div>
                  </td>
                );
              case 'courseCode':
                return (
                  <td
                    key="courseCode"
                    className="text-gray-900 font-semibold"
                    style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {approval.courseCode}
                  </td>
                );
              case 'courseName':
                return (
                  <td
                    key="courseName"
                    className="text-gray-700"
                    style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {approval.courseName}
                  </td>
                );
              case 'className':
                return (
                  <td
                    key="className"
                    className="text-gray-600"
                    style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {approval.className}
                  </td>
                );
              case 'instructorName':
                return (
                  <td
                    key="instructorName"
                    className="text-gray-600"
                    style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {approval.submittedBy}
                  </td>
                );
              case 'semester':
                return (
                  <td
                    key="semester"
                    className="text-gray-600"
                    style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {approval.semesterName}
                  </td>
                );
              case 'studentCount':
                return (
                  <td key="studentCount" className="text-center text-gray-900" style={cellPaddingStyle}>
                    {approval.totalStudents}
                  </td>
                );
              case 'submittedDate':
                return (
                  <td key="submittedDate" className="text-center text-gray-600" style={cellPaddingStyle}>
                    {formatDate(approval.submittedAt)}
                  </td>
                );
              case 'approvalStatus': {
                const statusFontSize = isCompact ? '0.65rem' : '0.75rem';
                const statusPadding = isCompact ? '0.125rem 0.375rem' : '0.25rem 0.5rem';
                return (
                  <td key="approvalStatus" style={cellPaddingStyle}>
                    <div className="flex justify-center">
                      <span
                        className={`text-center font-medium rounded ${statusDisplay.color}`}
                        style={{
                          padding: statusPadding,
                          fontSize: statusFontSize,
                          lineHeight: '1.2',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {statusDisplay.label}
                      </span>
                    </div>
                  </td>
                );
              }
              case 'actions':
                return (
                  <td key="actions" style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}>
                    <GradeApprovalActionsMenu
                      gradeApprovalId={approval.gradeVersionId}
                      onView={() => setDetailModalId(approval.gradeVersionId)}
                      onApprove={() => handleBulkAction('approve', [approval.gradeVersionId])}
                      onReject={() => handleBulkAction('reject', [approval.gradeVersionId])}
                      compact={(column.width || 0) < 160}
                      disabled={isAnyMutationPending}
                    />
                  </td>
                );
              default:
                return null;
            }
          })}
        </>
      );
    },
    [handleSelectOne, selectedGradeVersionIds, isAnyMutationPending, handleBulkAction],
  );

  const isAllSelected = gradeApprovals.length > 0 && selectedGradeVersionIds.size === gradeApprovals.length;
  const isIndeterminate = selectedGradeVersionIds.size > 0 && !isAllSelected;

  type StatCardConfig = Omit<(typeof STAT_CARDS)[number], 'key'> & { value: number };

  const StatsCardWithIcon = memo(
    ({ label, value, description, color, icon: Icon, animate }: StatCardConfig & { animate: boolean }) => {
      const count = useCountUp(value, { duration: 1200, start: 0, enabled: animate });
      const displayValue = useMemo(() => (animate ? Math.round(count) : Math.round(value)), [animate, count, value]);

      const getIconAndColors = (tone: string) => {
        switch (tone) {
          case 'green':
            return { bgColor: 'bg-[#CCEECC]', iconColor: 'text-[#44AA44]' };
          case 'blue':
            return { bgColor: 'bg-[#AACCFF]', iconColor: 'text-[#3366CC]' };
          case 'red':
            return { bgColor: 'bg-[#FFBBAA]', iconColor: 'text-[#CC4444]' };
          case 'orange':
            return { bgColor: 'bg-[#FFDDAA]', iconColor: 'text-[#CC8800]' };
          default:
            return { bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
        }
      };

      const { bgColor, iconColor } = getIconAndColors(color);

      return (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-20 h-20 ${bgColor} rounded-bl-[100%]`}>
            <div className="absolute top-5 right-5">
              <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} strokeWidth={2} />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">{label}</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">
            {displayValue.toLocaleString('vi-VN')}
          </p>
          {description && (
            <p className="text-xs sm:text-sm text-gray-600 relative z-10">{description}</p>
          )}
        </div>
      );
    },
    (prev, next) =>
      prev.value === next.value &&
      prev.label === next.label &&
      prev.description === next.description &&
      prev.color === next.color &&
      prev.animate === next.animate,
  );

  StatsCardWithIcon.displayName = 'StatsCardWithIcon';

  const statsCardData = useMemo(
    () =>
      STAT_CARDS.map((card) => ({
        ...card,
        value: statValues[card.key as keyof typeof statValues],
      })),
    [statValues],
  );

  const dropdownOptions = {
    semesters: [
      { value: '', label: 'Tất cả học kỳ' },
      ...semesters.map((semester) => ({ value: semester.semesterId, label: semester.semesterName })),
    ],
    subjects: [
      { value: '', label: filters.semesterId ? 'Tất cả môn học' : 'Chọn học kỳ trước' },
      ...subjects.map((subject) => ({ value: subject.subjectId, label: subject.subjectName })),
    ],
    courseClasses: [
      { value: '', label: filters.subjectId ? 'Tất cả lớp học phần' : 'Chọn môn học trước' },
      ...courseClasses.map((courseClass) => ({
        value: courseClass.courseClassId,
        label: `${courseClass.courseClassCode} · ${courseClass.subjectName}`,
      })),
    ],
    faculties: [
      { value: '', label: 'Tất cả khoa' },
      ...faculties.map((faculty) => ({ value: faculty.facultyId, label: faculty.facultyName })),
    ],
    departments: [
      { value: '', label: filters.facultyId ? 'Tất cả bộ môn' : 'Chọn khoa trước' },
      ...departments.map((department) => ({ value: department.departmentId, label: department.departmentName })),
    ],
    instructors: [
      { value: '', label: 'Tất cả giảng viên' },
      ...instructors.map((instructor) => ({ value: instructor.instructorId, label: instructor.fullName })),
    ],
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Duyệt bảng điểm</h1>
        <p className="text-gray-600 mt-1">Xét duyệt bảng điểm sinh viên</p>
      </div>

      {isStatsLoading ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statsCardData.map((card) => (
            <StatsCardWithIcon
              key={card.key}
              label={card.label}
              description={card.description}
              color={card.color}
              icon={card.icon}
              value={card.value}
              animate={isStatsAnimationActive}
            />
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Quản lý yêu cầu duyệt</h2>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">
                Duyệt từng bảng điểm, xem chi tiết yêu cầu
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
                <Download className="w-4 h-4" />
                Xuất Excel
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Tìm kiếm theo mã, tên môn học, giảng viên..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {selectedFilterTypes.includes('status') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={APPROVAL_STATUS_OPTIONS}
                  value={filters.versionStatus || ''}
                  placeholder="Trạng thái"
                  onChange={(value) => handleFilterChange('versionStatus', value || undefined)}
                />
              </div>
            )}

            {selectedFilterTypes.includes('semester') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={dropdownOptions.semesters}
                  value={filters.semesterId || ''}
                  placeholder="Học kỳ"
                  onChange={(value) => handleFilterChange('semesterId', value || undefined)}
                />
              </div>
            )}

            {selectedFilterTypes.includes('subject') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={dropdownOptions.subjects}
                  disabled={!filters.semesterId}
                  value={filters.subjectId || ''}
                  placeholder="Môn học"
                  onChange={(value) => handleFilterChange('subjectId', value || undefined)}
                />
              </div>
            )}

            {selectedFilterTypes.includes('courseClass') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={dropdownOptions.courseClasses}
                  disabled={!filters.subjectId}
                  value={filters.courseClassId || ''}
                  placeholder="Lớp học phần"
                  onChange={(value) => handleFilterChange('courseClassId', value || undefined)}
                />
              </div>
            )}

            {selectedFilterTypes.includes('faculty') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={dropdownOptions.faculties}
                  value={filters.facultyId || ''}
                  placeholder="Khoa"
                  onChange={(value) => handleFilterChange('facultyId', value || undefined)}
                />
              </div>
            )}

            {selectedFilterTypes.includes('department') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={dropdownOptions.departments}
                  disabled={!filters.facultyId}
                  value={filters.departmentId || ''}
                  placeholder="Bộ môn"
                  onChange={(value) => handleFilterChange('departmentId', value || undefined)}
                />
              </div>
            )}

            {selectedFilterTypes.includes('instructor') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={dropdownOptions.instructors}
                  value={filters.instructorId || ''}
                  placeholder="Giảng viên"
                  onChange={(value) => handleFilterChange('instructorId', value || undefined)}
                />
              </div>
            )}

            <div className="w-full sm:w-auto">
              <FilterDropdown selectedTypes={selectedFilterTypes} onTypesChange={handleFilterTypesChange} />
            </div>
          </div>

          <BulkActionBar
            selectedCount={selectedGradeVersionIds.size}
            onApprove={handleBulkApprove}
            onReject={handleBulkReject}
            onClear={() => setSelectedGradeVersionIds(new Set())}
            isProcessing={isAnyMutationPending}
          />
        </div>

        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            <ResizableTable
              columns={resizableColumns}
              data={gradeApprovals}
              renderRow={(approval, visibleColumns, cellStyle) => (
                <tr className="hover:bg-gray-50 transition-colors">
                  {renderGradeApprovalRow(approval, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={isListLoading && !listData}
              emptyMessage={gradeApprovals.length === 0 ? 'Không có dữ liệu' : undefined}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                />
              )}
            />
            {isListFetching && gradeApprovals.length === 0 && <TableSkeleton />}
          </div>
        </div>

        <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <ExportGradeApprovalModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filters={exportFilters}
        dropdowns={dropdownContext}
      />

      <GradeApprovalDetailModal
        gradeVersionId={detailModalId}
        isOpen={Boolean(detailModalId)}
        onClose={() => setDetailModalId(null)}
        onApprove={(id) => handleBulkAction('approve', [id])}
        onReject={(id) => handleBulkAction('reject', [id])}
        isProcessing={isAnyMutationPending}
      />
    </div>
  );
}

