'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, CircleCheck, Download } from 'lucide-react';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { AddDivisionModal } from './components/AddDivisionModal';
import { EditDivisionModal } from './components/EditDivisionModal';
import { ConfirmDeleteDivisionModal } from './components/ConfirmDeleteDivisionModal';
import { BulkDeleteDivisionModal } from './components/BulkDeleteDivisionModal';
import { DivisionActionsMenu } from './components/DivisionActionsMenu';
import { ResizableTable, ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable';
import { TableSkeleton } from '@/app/(page)/admin/student-profile/components/LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { divisionsApi } from './lib/api/divisionsApi';
import { getStatusDisplay, STATUS_OPTIONS } from './lib/types/types';
import type { Division } from './lib/types/types';

export default function FacultyManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingDivisionId, setDeletingDivisionId] = useState<string | null>(null);
  const [deletingDivisionName, setDeletingDivisionName] = useState<string | undefined>(undefined);
  const [deletingDivisionCode, setDeletingDivisionCode] = useState<string | undefined>(undefined);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [selectedDivisionIds, setSelectedDivisionIds] = useState<Set<string>>(new Set());
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'divisionCode', label: 'Mã', width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    { key: 'divisionName', label: 'Tên khoa', width: 250, minWidth: 200, align: 'left', visible: true, required: true },
    { key: 'deanName', label: 'Trưởng khoa', width: 200, minWidth: 150, align: 'left', visible: true },
    { key: 'subjectCount', label: 'Bộ môn', width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'instructorCount', label: 'Giảng viên', width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'status', label: 'Trạng thái', width: 160, minWidth: 140, align: 'center', visible: true },
    { key: 'actions', label: 'HD', width: 100, minWidth: 80, align: 'center', visible: true, required: true },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDivisions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await divisionsApi.getDivisions({
        pageNumber: currentPage,
        pageSize: pageSize,
        searchKeyword: searchKeyword || undefined,
        status: selectedStatus || undefined,
      });
      
      if (response.success) {
        setDivisions(response.data.divisions);
        setTotalCount(response.data.pagination.totalCount);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching divisions:', error);
      toast.error('Không thể tải danh sách khoa. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchKeyword, selectedStatus, pageSize]);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  const handleDeleteClick = useCallback((divisionId: string, divisionName: string, divisionCode: string) => {
    setDeletingDivisionId(divisionId);
    setDeletingDivisionName(divisionName);
    setDeletingDivisionCode(divisionCode);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditClick = useCallback((division: Division) => {
    setEditingDivision(division);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingDivisionId) return;
    const res = await divisionsApi.deleteDivision(deletingDivisionId);
    if (res.success) {
      toast.success('Xóa khoa thành công');
      fetchDivisions();
    } else {
      toast.error(res.message || 'Xóa khoa thất bại');
    }
  };

  const handleSelectAll = useCallback(() => {
    if (selectedDivisionIds.size === divisions.length) {
      setSelectedDivisionIds(new Set());
    } else {
      setSelectedDivisionIds(new Set(divisions.map(d => d.divisionId)));
    }
  }, [divisions, selectedDivisionIds.size]);

  const handleSelectOne = useCallback((divisionId: string) => {
    setSelectedDivisionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(divisionId)) {
        newSet.delete(divisionId);
      } else {
        newSet.add(divisionId);
      }
      return newSet;
    });
  }, []);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedDivisionIds);
    const res = await divisionsApi.bulkDeleteDivisions(ids);
    if (res.success) {
      toast.success(res.message || `Đã xóa ${ids.length} khoa`);
      setSelectedDivisionIds(new Set());
      setIsBulkDeleteModalOpen(false);
      fetchDivisions();
    } else {
      toast.error(res.message || 'Xóa hàng loạt thất bại');
    }
  };

  const renderDivisionRow = useCallback((division: Division, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(division.status);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const isSelected = selectedDivisionIds.has(division.divisionId);

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
                      onChange={() => handleSelectOne(faculty.facultyId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'divisionCode':
              return (
                <td key="divisionCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {division.divisionCode}
                </td>
              );
            case 'divisionName':
              return (
                <td key="divisionName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {division.divisionName}
                </td>
              );
            case 'deanName':
              return (
                <td key="deanName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {division.deanName || 'Chưa chỉ định'}
                </td>
              );
            case 'subjectCount':
              return (
                <td key="subjectCount" className="text-center text-gray-900" style={cellPaddingStyle}>
                  {division.subjectCount} Bộ môn
                </td>
              );
            case 'instructorCount':
              return (
                <td key="instructorCount" className="text-center text-gray-900" style={cellPaddingStyle}>
                  {division.instructorCount} Giảng viên
                </td>
              );
            case 'status':
              const isCompact = parseFloat(cellStyle.paddingX) < 20;
              const statusFontSize = isCompact ? '0.65rem' : '0.75rem';
              return (
                <td key="status" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <span className={`text-center font-medium ${statusDisplay.color}`} style={{ 
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
                  <DivisionActionsMenu
                    divisionId={division.divisionId}
                    divisionName={division.divisionName}
                    status={division.status}
                    onEdit={() => handleEditClick(division)}
                    onDelete={() => handleDeleteClick(division.divisionId, division.divisionName, division.divisionCode)}
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
      }, [handleDeleteClick, handleEditClick, handleSelectOne, selectedDivisionIds]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý khoa</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin các khoa</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          {/* Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Danh sách khoa
              </h2>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const blob = await divisionsApi.exportDivisions({
                      searchKeyword: searchKeyword || undefined,
                      status: selectedStatus || undefined,
                    });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `DanhSachKhoa_${new Date().toISOString().split('T')[0]}.xlsx`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    toast.success('Xuất Excel thành công');
                  } catch (error: any) {
                    toast.error(error?.message || 'Xuất Excel thất bại');
                  }
                }}
              >
                <Download className="w-4 h-4" />
                Xuất Excel
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                <Plus className="w-4 h-4" />
                Thêm khoa
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <SearchInput
                placeholder="Tìm kiếm theo Mã khoa, tên..."
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
          </div>

          {/* Bulk Actions Bar */}
          {selectedDivisionIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  Đã chọn {selectedDivisionIds.size} khoa
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa toàn bộ
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedDivisionIds(new Set())}
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
              data={divisions}
              renderRow={(division, visibleColumns, cellStyle) => (
                <tr className="hover:bg-gray-50 transition-colors">
                  {renderDivisionRow(division, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage="Chưa có khoa nào."
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={divisions.length > 0 && selectedDivisionIds.size === divisions.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedDivisionIds.size > 0 && selectedDivisionIds.size < divisions.length;
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
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modals */}
      <AddDivisionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchDivisions();
        }}
      />

      <EditDivisionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDivision(null);
        }}
        division={editingDivision}
        onSuccess={() => {
          fetchDivisions();
        }}
      />

      <ConfirmDeleteDivisionModal
        isOpen={isDeleteModalOpen}
        divisionName={deletingDivisionName}
        divisionCode={deletingDivisionCode}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingDivisionId(null);
          setDeletingDivisionName(undefined);
          setDeletingDivisionCode(undefined);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteDivisionModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        selectedCount={selectedDivisionIds.size}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}

