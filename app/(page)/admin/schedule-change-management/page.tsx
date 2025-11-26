'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FileDown, CheckCircle2, XCircle, Clock, Edit2, X, CircleCheck, RotateCcw } from 'lucide-react';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { ScheduleChangeStatCard } from './components/ScheduleChangeStatCard';
import { ScheduleChangeActionsMenu } from './components/ScheduleChangeActionsMenu';
import { ViewScheduleChangeDetailModal } from './components/ViewScheduleChangeDetailModal';
import { ApproveScheduleChangeModal } from './components/ApproveScheduleChangeModal';
import { RejectScheduleChangeModal } from './components/RejectScheduleChangeModal';
import { RevertScheduleChangeModal } from './components/RevertScheduleChangeModal';
import { EditScheduleChangeModal } from './components/EditScheduleChangeModal';
import { BulkApproveScheduleChangeModal } from './components/BulkApproveScheduleChangeModal';
import { BulkRejectScheduleChangeModal } from './components/BulkRejectScheduleChangeModal';
import { BulkRevertScheduleChangeModal } from './components/BulkRevertScheduleChangeModal';
import { ResizableTable, ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable';
import { TableSkeleton } from '@/app/(page)/admin/student-profile/components/LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { useScheduleChanges } from './lib/hooks/useScheduleChanges';
import { scheduleChangeApi } from './lib/api/scheduleChangeApi';
import { getStatusDisplay, getPeriodLabel, STATUS_OPTIONS } from './lib/types/types';
import type { LeaveRequest } from './lib/types/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Tổng yêu cầu',
    bgColor: 'bg-[#FFDDAA]',
    iconColor: 'text-[#CC8800]',
    Icon: Clock,
  },
  {
    key: 'approved',
    label: 'Đã duyệt',
    bgColor: 'bg-[#CCEECC]',
    iconColor: 'text-[#44AA44]',
    Icon: CheckCircle2,
  },
  {
    key: 'pending',
    label: 'Chờ duyệt',
    bgColor: 'bg-[#FFEECC]',
    iconColor: 'text-[#CC8800]',
    Icon: Clock,
  },
  {
    key: 'rejected',
    label: 'Từ chối',
    bgColor: 'bg-[#FFBBAA]',
    iconColor: 'text-[#CC4444]',
    Icon: XCircle,
  },
] as const;

export default function ScheduleChangeManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkApproveModalOpen, setIsBulkApproveModalOpen] = useState(false);
  const [isBulkRejectModalOpen, setIsBulkRejectModalOpen] = useState(false);
  const [isBulkRevertModalOpen, setIsBulkRevertModalOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<LeaveRequest | null>(null);
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());

  const { requests, loading, currentPage, totalCount, totalPages, stats, fetchScheduleChanges, setCurrentPage } = useScheduleChanges();

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'requestCode', label: 'Mã YC', width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    { key: 'instructor', label: 'Giảng viên', width: 200, minWidth: 150, align: 'left', visible: true },
    { key: 'subject', label: 'Môn học', width: 200, minWidth: 150, align: 'left', visible: true },
    { key: 'class', label: 'Lớp', width: 120, minWidth: 100, align: 'left', visible: true },
    { key: 'currentSchedule', label: 'Lịch hiện tại', width: 250, minWidth: 200, align: 'left', visible: true },
    { key: 'proposedSchedule', label: 'Lịch đề xuất', width: 250, minWidth: 200, align: 'left', visible: true },
    { key: 'status', label: 'Trạng thái', width: 140, minWidth: 120, align: 'center', visible: true },
    { key: 'actions', label: 'HD', width: 100, minWidth: 80, align: 'center', visible: true, required: true },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setCurrentPage]);

  useEffect(() => {
    fetchScheduleChanges({
      searchTerm: searchKeyword || undefined,
      status: selectedStatus || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      pageNumber: currentPage,
      pageSize: 20,
    });
  }, [currentPage, searchKeyword, selectedStatus, dateFrom, dateTo, fetchScheduleChanges]);

  const statValues = useMemo(() => ({
    total: stats.total,
    approved: stats.approved,
    pending: stats.pending,
    rejected: stats.rejected,
  }), [stats]);

  const handleViewClick = useCallback((request: LeaveRequest) => {
    setViewingRequest(request);
    setIsViewModalOpen(true);
  }, []);

  const handleApproveClick = useCallback((request: LeaveRequest) => {
    setViewingRequest(request);
    setIsApproveModalOpen(true);
  }, []);

  const handleRejectClick = useCallback((request: LeaveRequest) => {
    setViewingRequest(request);
    setIsRejectModalOpen(true);
  }, []);

  const handleRevertClick = useCallback((request: LeaveRequest) => {
    setViewingRequest(request);
    setIsRevertModalOpen(true);
  }, []);

  const handleEditClick = useCallback((request: LeaveRequest) => {
    setViewingRequest(request);
    setIsEditModalOpen(true);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedRequestIds.size === requests.length) {
      setSelectedRequestIds(new Set());
    } else {
      setSelectedRequestIds(new Set(requests.map(r => r.requestId)));
    }
  }, [requests, selectedRequestIds.size]);

  const handleSelectOne = useCallback((requestId: string) => {
    setSelectedRequestIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  }, []);

  const handleExport = async () => {
    try {
      const blob = await scheduleChangeApi.export({
        searchTerm: searchKeyword || undefined,
        status: selectedStatus || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }, 'xlsx');

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `danh-sach-yeu-cau-doi-lich-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Xuất file thành công');
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || 'Xuất file thất bại';
      toast.error(errorMessage);
    }
  };

  // Helper function to calculate date from cancelled week and day of week
  // Assumes week 1 starts from a reference date (could be semester start)
  const calculateCancelledDate = useCallback((cancelledWeek: number, dayOfWeek: number, createdAt: string): Date | null => {
    try {
      // Use created date as reference, or calculate from a base date
      // For now, we'll try to estimate from created date
      const createdDate = new Date(createdAt);
      const createdDayOfWeek = createdDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Convert to our dayOfWeek format (2=Monday, 8=Sunday)
      let createdDayOfWeekFormatted = createdDayOfWeek === 0 ? 8 : createdDayOfWeek + 1;
      
      // Calculate days difference
      let daysDiff = dayOfWeek - createdDayOfWeekFormatted;
      if (daysDiff < 0) daysDiff += 7;
      
      // Estimate: assume cancelled week is relative to created date
      // Week 1 would be the week containing created date
      const weekOffset = (cancelledWeek - 1) * 7;
      const cancelledDate = new Date(createdDate);
      cancelledDate.setDate(createdDate.getDate() + daysDiff + weekOffset);
      
      return cancelledDate;
    } catch {
      return null;
    }
  }, []);

  const renderRequestRow = useCallback((request: LeaveRequest, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(request.status);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const isSelected = selectedRequestIds.has(request.requestId);
    const makeUpDate = request.makeUpDate ? new Date(request.makeUpDate) : null;
    const cancelledDate = calculateCancelledDate(request.cancelledWeek, request.dayOfWeek, request.createdAt);
    const dayLabel = request.dayOfWeekText || `Thứ ${request.dayOfWeek}`;

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
                      onChange={() => handleSelectOne(request.requestId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'requestCode':
              return (
                <td key="requestCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {request.requestCode}
                </td>
              );
            case 'instructor':
              return (
                <td key="instructor" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {request.instructorName}
                </td>
              );
            case 'subject':
              return (
                <td key="subject" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {request.subjectName}
                </td>
              );
            case 'class':
              return (
                <td key="class" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {request.courseClassCode}
                </td>
              );
            case 'currentSchedule':
              return (
                <td key="currentSchedule" style={{ ...cellPaddingStyle, overflow: 'hidden' }}>
                  {cancelledDate ? (
                    <div className="flex flex-col">
                      <span className="text-gray-900">{format(cancelledDate, 'dd/MM/yyyy', { locale: vi })}</span>
                      <span className="text-gray-500 text-sm">
                        {getPeriodLabel(request.startPeriod, request.endPeriod)}
                        {request.currentRoomCode && ` (${request.currentRoomCode})`}
                      </span>
                      <span className="text-gray-500 text-xs">Tuần {request.cancelledWeek}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-gray-900">{dayLabel}</span>
                      <span className="text-gray-500 text-sm">
                        {getPeriodLabel(request.startPeriod, request.endPeriod)}
                        {request.currentRoomCode && ` (${request.currentRoomCode})`}
                      </span>
                      <span className="text-gray-500 text-xs">Tuần {request.cancelledWeek}</span>
                    </div>
                  )}
                </td>
              );
            case 'proposedSchedule':
              return (
                <td key="proposedSchedule" style={{ ...cellPaddingStyle, overflow: 'hidden' }}>
                  {makeUpDate ? (
                    <div className="flex flex-col">
                      <span className="text-gray-900">{format(makeUpDate, 'dd/MM/yyyy', { locale: vi })}</span>
                      <span className="text-gray-500 text-sm">
                        {getPeriodLabel(request.startPeriod, request.endPeriod)}
                        {request.makeUpRoomCode && ` (${request.makeUpRoomCode})`}
                      </span>
                      {request.makeupWeek && (
                        <span className="text-gray-500 text-xs">Tuần dạy bù {request.makeupWeek}</span>
                      )}
                    </div>
                  ) : request.makeupWeek ? (
                    <div className="flex flex-col">
                      <span className="text-gray-900">Tuần dạy bù {request.makeupWeek}</span>
                      <span className="text-gray-500 text-sm">
                        {getPeriodLabel(request.startPeriod, request.endPeriod)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              );
            case 'status':
              const isCompact = parseFloat(cellStyle.paddingX) < 20;
              const statusFontSize = isCompact ? '0.65rem' : '0.75rem';
              const statusPadding = isCompact ? '0.125rem 0.375rem' : '0.25rem 0.5rem';
              return (
                <td key="status" style={cellPaddingStyle}>
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
                  <ScheduleChangeActionsMenu
                    requestId={request.requestId}
                    requestCode={request.requestCode}
                    status={request.status}
                    onView={() => handleViewClick(request)}
                    onApprove={request.status === 'pending' ? () => handleApproveClick(request) : undefined}
                    onReject={request.status === 'pending' ? () => handleRejectClick(request) : undefined}
                    onRevert={(request.status === 'approved' || request.status === 'rejected') ? () => handleRevertClick(request) : undefined}
                    onEdit={(request.status === 'pending' || request.status === 'approved') ? () => handleEditClick(request) : undefined}
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
  }, [handleViewClick, handleApproveClick, handleRejectClick, handleRevertClick, handleSelectOne, selectedRequestIds, calculateCancelledDate]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Phép & Đổi lịch giảng viên</h1>
        <p className="text-gray-600 mt-1">Quản lý yêu cầu nghỉ phép và đổi lịch giảng dạy của giảng viên</p>
      </div>

      {/* Stats Cards */}
      {loading && requests.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
          {STAT_CARDS.map((card, index) => {
            const value = statValues[card.key];
            return (
              <ScheduleChangeStatCard
                key={index}
                label={card.label}
                value={value}
                Icon={card.Icon}
                bgColor={card.bgColor}
                iconColor={card.iconColor}
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
                Danh sách yêu cầu
              </h2>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
              >
                <FileDown className="w-4 h-4" />
                Xuất Excel
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <SearchInput
                placeholder="Tìm kiếm theo mã, tên giảng viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Dropdown */}
            <Dropdown
              options={STATUS_OPTIONS}
              value={selectedStatus || ''}
              placeholder="Tất cả trạng thái"
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            />

            {/* Date Range - Simple implementation */}
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053AD] focus:border-[#0053AD] text-sm"
                placeholder="Từ ngày"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053AD] focus:border-[#0053AD] text-sm"
                placeholder="Đến ngày"
              />
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedRequestIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  Đã chọn {selectedRequestIds.size} yêu cầu
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkApproveModalOpen(true)}
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                >
                  <Edit2 className="w-4 h-4" />
                  Duyệt yêu cầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkRejectModalOpen(true)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkRevertModalOpen(true)}
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Hoàn tác
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedRequestIds(new Set())}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  Bỏ chọn
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
              data={requests}
              renderRow={(request, visibleColumns, cellStyle) => (
                <tr key={request.requestId} className="hover:bg-gray-50 transition-colors">
                  {renderRequestRow(request, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage="Không có dữ liệu"
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={requests.length > 0 && selectedRequestIds.size === requests.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedRequestIds.size > 0 && selectedRequestIds.size < requests.length;
                    }
                  }}
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
            pageSize={20}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modals */}
      <ViewScheduleChangeDetailModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingRequest(null);
        }}
        request={viewingRequest}
      />

      <ApproveScheduleChangeModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setViewingRequest(null);
        }}
        request={viewingRequest}
        onSuccess={() => {
          fetchScheduleChanges({
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            pageNumber: currentPage,
            pageSize: 20,
          });
        }}
      />

      <RejectScheduleChangeModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setViewingRequest(null);
        }}
        request={viewingRequest}
        onSuccess={() => {
          fetchScheduleChanges({
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            pageNumber: currentPage,
            pageSize: 20,
          });
        }}
      />

      <RevertScheduleChangeModal
        isOpen={isRevertModalOpen}
        onClose={() => {
          setIsRevertModalOpen(false);
          setViewingRequest(null);
        }}
        request={viewingRequest}
        onSuccess={() => {
          fetchScheduleChanges({
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            pageNumber: currentPage,
            pageSize: 20,
          });
        }}
      />

      <EditScheduleChangeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setViewingRequest(null);
        }}
        request={viewingRequest}
        onSuccess={() => {
          fetchScheduleChanges({
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            pageNumber: currentPage,
            pageSize: 20,
          });
        }}
      />

      <BulkApproveScheduleChangeModal
        isOpen={isBulkApproveModalOpen}
        onClose={() => setIsBulkApproveModalOpen(false)}
        selectedRequestIds={Array.from(selectedRequestIds)}
        requests={requests}
        onSuccess={() => {
          setSelectedRequestIds(new Set());
          fetchScheduleChanges({
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            pageNumber: currentPage,
            pageSize: 20,
          });
        }}
      />

      <BulkRejectScheduleChangeModal
        isOpen={isBulkRejectModalOpen}
        onClose={() => setIsBulkRejectModalOpen(false)}
        selectedRequestIds={Array.from(selectedRequestIds)}
        onSuccess={() => {
          setSelectedRequestIds(new Set());
          fetchScheduleChanges({
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            pageNumber: currentPage,
            pageSize: 20,
          });
        }}
      />

      <BulkRevertScheduleChangeModal
        isOpen={isBulkRevertModalOpen}
        onClose={() => setIsBulkRevertModalOpen(false)}
        selectedRequestIds={Array.from(selectedRequestIds)}
        requests={requests}
        onSuccess={() => {
          setSelectedRequestIds(new Set());
          fetchScheduleChanges({
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            pageNumber: currentPage,
            pageSize: 20,
          });
        }}
      />
    </div>
  );
}

