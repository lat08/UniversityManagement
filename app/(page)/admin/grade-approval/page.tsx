'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button, SearchInput, Dropdown } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import ExportGradeApprovalModal from './components/ExportGradeApprovalModal';
import FilterDropdown from './components/FilterDropdown';
import { BulkActionBar } from './components/BulkActionBar';
import { ResizableTable, ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable';
import GradeApprovalActionsMenu from './components/GradeApprovalActionsMenu';
// import { gradeApprovalsApi } from './lib/api/gradeApprovalsApi';
import { GradeApproval, getApprovalStatusDisplay, Faculty, Department, Instructor, APPROVAL_STATUS_OPTIONS } from './lib/types/types';
import { TableSkeleton, StatCardsSkeleton } from './components/LoadingSkeleton';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { mockGradeApprovals, mockFaculties, mockDepartments, mockInstructors, mockStats } from './lib/data/mockData';

interface FilterOptions {
  status: string[];
  facultyId: string[];
  departmentId: string[];
  instructorId: string[];
}

const STAT_CARDS = [
  { key: 'total', label: 'Tổng bảng điểm', color: 'blue', icon: FileText, description: 'Toàn bộ' },
  { key: 'pending', label: 'Chờ phê duyệt', color: 'orange', icon: Clock, description: 'Đang chờ' },
  { key: 'approved', label: 'Đã duyệt', color: 'green', icon: CheckCircle, description: 'Hoàn tất' },
  { key: 'rejected', label: 'Từ chối', color: 'red', icon: XCircle, description: 'Bị từ chối' },
] as const;

export default function GradeApprovalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Filter states
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: [],
    facultyId: [],
    departmentId: [],
    instructorId: [],
  });

  // Dropdown data
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  
  // Selected filter types
  const [selectedFilterTypes, setSelectedFilterTypes] = useState<string[]>(['status']);

  const [selectedGradeApprovalIds, setSelectedGradeApprovalIds] = useState<Set<string>>(new Set());

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 50, minWidth: 50, align: 'center', visible: true },
    { key: 'gradeSheetCode', label: 'Mã BD', width: 100, minWidth: 80, align: 'left', visible: true },
    { key: 'courseName', label: 'Môn học', width: 220, minWidth: 180, align: 'left', visible: true },
    { key: 'className', label: 'Lớp', width: 110, minWidth: 90, align: 'left', visible: true },
    { key: 'instructorName', label: 'Giảng viên', width: 160, minWidth: 120, align: 'left', visible: true },
    { key: 'semester', label: 'Học kỳ', width: 130, minWidth: 110, align: 'left', visible: true },
    { key: 'studentCount', label: 'Số SV', width: 90, minWidth: 70, align: 'center', visible: true },
    { key: 'submittedDate', label: 'Ngày nộp', width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'approvalStatus', label: 'Trạng thái', width: 130, minWidth: 110, align: 'center', visible: true },
    { key: 'actions', label: 'Thao tác', width: 180, minWidth: 80, align: 'center', visible: true },
  ]);
  
  const [gradeApprovals, setGradeApprovals] = useState<GradeApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  const [stats, setStats] = useState({
    totalApprovals: 0,
    pendingApprovals: 0,
    approvedApprovals: 0,
    rejectedApprovals: 0,
  });

  // Priority 1: Fetch dropdowns in parallel first for better UX
  useEffect(() => {
    const fetchDropdownData = async () => {
      // Using mock data
      setFaculties(mockFaculties);
      setDepartments(mockDepartments);
      setInstructors(mockInstructors);
      
      // Uncomment below to use real API
      // await Promise.all([
      //   fetchFaculties(),
      //   fetchDepartments(),
      //   fetchInstructors(),
      // ]);
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

  // Uncomment when ready to use real API
  // const fetchFaculties = async () => {
  //   try {
  //     const response = await gradeApprovalsApi.getFaculties();
  //     if (response.success) {
  //       setFaculties(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching faculties:', error);
  //   }
  // };

  // const fetchDepartments = async () => {
  //   try {
  //     const response = await gradeApprovalsApi.getDepartments({});
  //     if (response.success) {
  //       setDepartments(response.data.items);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching departments:', error);
  //   }
  // };

  // const fetchInstructors = async () => {
  //   try {
  //     const response = await gradeApprovalsApi.getInstructors({});
  //     if (response.success) {
  //       setInstructors(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching instructors:', error);
  //   }
  // };

  const fetchGradeApprovals = useCallback(async () => {
    try {
      setLoading(true);
      
      // Using mock data with filters
      let filteredData = [...mockGradeApprovals];
      
      // Apply search filter
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.gradeSheetCode.toLowerCase().includes(keyword) ||
          item.courseName.toLowerCase().includes(keyword) ||
          item.courseCode.toLowerCase().includes(keyword) ||
          item.instructorName.toLowerCase().includes(keyword)
        );
      }
      
      // Apply status filter
      if (filterOptions.status[0]) {
        filteredData = filteredData.filter(item => item.approvalStatus === filterOptions.status[0]);
      }
      
      // Apply instructor filter
      if (filterOptions.instructorId[0]) {
        const instructor = mockInstructors.find(i => i.instructorId === filterOptions.instructorId[0]);
        if (instructor) {
          filteredData = filteredData.filter(item => item.instructorName === instructor.instructorName);
        }
      }
      
      // Calculate pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      setGradeApprovals(paginatedData);
      setTotalCount(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / pageSize));
      setStats(mockStats);
      
      // Uncomment below to use real API
      // const response = await gradeApprovalsApi.getGradeApprovals({
      //   pageNumber: currentPage,
      //   pageSize: pageSize,
      //   searchKeyword: searchKeyword || undefined,
      //   facultyId: filterOptions.facultyId[0] || undefined,
      //   departmentId: filterOptions.departmentId[0] || undefined,
      //   instructorId: filterOptions.instructorId[0] || undefined,
      //   approvalStatus: filterOptions.status[0] || undefined,
      // });
      
      // if (response.success) {
      //   setGradeApprovals(response.data.gradeApprovals);
      //   setTotalCount(response.data.pagination.totalCount);
      //   setTotalPages(response.data.pagination.totalPages);
      //   if (response.data.statistics) {
      //     setStats(response.data.statistics);
      //   }
      // }
    } catch (error) {
      console.error('Error fetching grade approvals:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterOptions, searchKeyword, pageSize]);

  // Priority 2: Fetch grade approvals after dropdowns loaded
  useEffect(() => {
    fetchGradeApprovals();
  }, [fetchGradeApprovals]);

  // Checkbox handlers
  const handleSelectAll = useCallback(() => {
    if (selectedGradeApprovalIds.size === gradeApprovals.length) {
      setSelectedGradeApprovalIds(new Set());
    } else {
      setSelectedGradeApprovalIds(new Set(gradeApprovals.map(ga => ga.gradeApprovalId)));
    }
  }, [gradeApprovals, selectedGradeApprovalIds.size]);

  const handleSelectOne = useCallback((id: string) => {
    setSelectedGradeApprovalIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const isAllSelected = gradeApprovals.length > 0 && selectedGradeApprovalIds.size === gradeApprovals.length;
  const isIndeterminate = selectedGradeApprovalIds.size > 0 && !isAllSelected;

  // Bulk actions
  const handleBulkApprove = async () => {
    if (selectedGradeApprovalIds.size === 0) return;
    console.log('Bulk approve:', Array.from(selectedGradeApprovalIds));
    // TODO: API call
    setSelectedGradeApprovalIds(new Set());
  };

  const handleBulkReject = async () => {
    if (selectedGradeApprovalIds.size === 0) return;
    console.log('Bulk reject:', Array.from(selectedGradeApprovalIds));
    // TODO: API call
    setSelectedGradeApprovalIds(new Set());
  };

  // Memoized stat cards values
  const statValues = useMemo(() => ({
    total: stats.totalApprovals,
    pending: stats.pendingApprovals,
    approved: stats.approvedApprovals,
    rejected: stats.rejectedApprovals,
  }), [stats]);

  // Stats card component with icon
  const StatsCardWithIcon = ({ label, value, description, color, icon: Icon }: Omit<typeof STAT_CARDS[number], 'key'> & { value: number }) => {
    const count = useCountUp(value, { duration: 1200, start: 0 });
    const displayValue = useMemo(() => Math.round(count), [count]);
    
    const getIconAndColors = (color: string) => {
      switch (color) {
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
        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">
          {label}
        </p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">
          {displayValue.toLocaleString('vi-VN')}
        </p>
        {description && (
          <p className="text-xs sm:text-sm text-gray-600 relative z-10">
            {description}
          </p>
        )}
      </div>
    );
  };

  // Handle filter type changes
  const handleFilterTypesChange = (types: string[]) => {
    setSelectedFilterTypes(types);
    // Clear filters for unselected types
    const newFilters = { ...filterOptions };
    if (!types.includes('faculty')) newFilters.facultyId = [];
    if (!types.includes('department')) newFilters.departmentId = [];
    if (!types.includes('instructor')) newFilters.instructorId = [];
    setFilterOptions(newFilters);
  };

  // Table row renderer with dynamic columns
  const renderGradeApprovalRow = useCallback((approval: GradeApproval, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getApprovalStatusDisplay(approval.approvalStatus);
    const isSelected = selectedGradeApprovalIds.has(approval.gradeApprovalId);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    
    const paddingXNum = parseFloat(cellStyle.paddingX);
    const isCompact = paddingXNum < 20;
    
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
                      onChange={() => handleSelectOne(approval.gradeApprovalId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'gradeSheetCode':
              return (
                <td key="gradeSheetCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {approval.gradeSheetCode}
                </td>
              );
            case 'courseName':
              return (
                <td key="courseName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {approval.courseName}
                </td>
              );
            case 'className':
              return (
                <td key="className" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {approval.className}
                </td>
              );
            case 'instructorName':
              return (
                <td key="instructorName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {approval.instructorName}
                </td>
              );
            case 'semester':
              return (
                <td key="semester" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {approval.semester}
                </td>
              );
            case 'studentCount':
              return (
                <td key="studentCount" className="text-center text-gray-900" style={cellPaddingStyle}>
                  {approval.studentCount}
                </td>
              );
            case 'submittedDate':
              return (
                <td key="submittedDate" className="text-center text-gray-600" style={cellPaddingStyle}>
                  {new Date(approval.submittedDate).toLocaleDateString('vi-VN')}
                </td>
              );
            case 'approvalStatus':
              const statusFontSize = isCompact ? '0.65rem' : '0.75rem';
              const statusPadding = isCompact ? '0.125rem 0.375rem' : '0.25rem 0.5rem';
              return (
                <td key="approvalStatus" style={cellPaddingStyle}>
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
                  <GradeApprovalActionsMenu
                    gradeApprovalId={approval.gradeApprovalId}
                    onView={() => console.log('View:', approval.gradeApprovalId)}
                    onApprove={() => console.log('Approve:', approval.gradeApprovalId)}
                    onReject={() => console.log('Reject:', approval.gradeApprovalId)}
                    compact={(column.width || 0) < 160}
                  />
                </td>
              );
            default:
              return null;
          }
        })}
      </>
    );
  }, [selectedGradeApprovalIds, handleSelectOne]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Duyệt bảng điểm</h1>
        <p className="text-gray-600 mt-1">Xét duyệt bảng điểm sinh viên</p>
      </div>

      {/* Stats Cards */}
      {loading && gradeApprovals.length === 0 ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {STAT_CARDS.map((card) => {
            const { key, ...cardProps } = card;
            return (
              <StatsCardWithIcon
                key={key}
                label={cardProps.label}
                description={cardProps.description}
                color={cardProps.color}
                icon={cardProps.icon}
                value={statValues[key]}
              />
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
                Quản lý yêu cầu duyệt
              </h2>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">
                Duyệt từng bảng điểm, xem chi tiết yêu cầu
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="w-4 h-4" />
                Xuất Excel
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <SearchInput
                placeholder="Tìm kiếm theo mã, tên môn học, giảng viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Dropdown */}
            {selectedFilterTypes.includes('status') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={APPROVAL_STATUS_OPTIONS}
                  value={filterOptions.status[0] || ''}
                  placeholder="Trạng thái"
                  onChange={(value) => {
                    setFilterOptions({ ...filterOptions, status: value ? [value] : [] });
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}

            {/* Faculty Dropdown */}
            {selectedFilterTypes.includes('faculty') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={[
                    { value: '', label: 'Tất cả khoa' },
                    ...faculties.map(f => ({ value: f.facultyId, label: f.facultyName }))
                  ]}
                  value={filterOptions.facultyId[0] || ''}
                  placeholder="Khoa"
                  onChange={(value) => {
                    setFilterOptions({ ...filterOptions, facultyId: value ? [value] : [] });
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}

            {/* Department Dropdown */}
            {selectedFilterTypes.includes('department') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={[
                    { value: '', label: 'Tất cả bộ môn' },
                    ...departments.map(d => ({ value: d.departmentId, label: d.departmentName }))
                  ]}
                  value={filterOptions.departmentId[0] || ''}
                  placeholder="Bộ môn"
                  onChange={(value) => {
                    setFilterOptions({ ...filterOptions, departmentId: value ? [value] : [] });
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}

            {/* Instructor Dropdown */}
            {selectedFilterTypes.includes('instructor') && (
              <div className="w-full sm:w-48">
                <Dropdown
                  options={[
                    { value: '', label: 'Tất cả giảng viên' },
                    ...instructors.map(i => ({ value: i.instructorId, label: i.instructorName }))
                  ]}
                  value={filterOptions.instructorId[0] || ''}
                  placeholder="Giảng viên"
                  onChange={(value) => {
                    setFilterOptions({ ...filterOptions, instructorId: value ? [value] : [] });
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}

            {/* Filter Selector */}
            <div className="w-full sm:w-auto">
              <FilterDropdown
                selectedTypes={selectedFilterTypes}
                onTypesChange={handleFilterTypesChange}
              />
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <BulkActionBar
            selectedCount={selectedGradeApprovalIds.size}
            onApprove={handleBulkApprove}
            onReject={handleBulkReject}
            onClear={() => setSelectedGradeApprovalIds(new Set())}
          />
        </div>

        {/* Table */}
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
              isLoading={loading}
              emptyMessage="Không có dữ liệu"
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
      <ExportGradeApprovalModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        filters={{
          searchKeyword: searchKeyword || undefined,
          facultyId: filterOptions.facultyId[0] || undefined,
          departmentId: filterOptions.departmentId[0] || undefined,
          instructorId: filterOptions.instructorId[0] || undefined,
          approvalStatus: filterOptions.status[0] || undefined,
        }}
      />
    </div>
  );
}
