'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, School, CheckCircle2, XCircle, Edit2, Trash2, X, CircleCheck } from 'lucide-react';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { AddMajorModal } from './components/AddMajorModal';
import { EditMajorModal } from './components/EditMajorModal';
import { BulkEditMajorModal } from './components/BulkEditMajorModal';
import { ConfirmDeleteMajorModal } from './components/ConfirmDeleteMajorModal';
import { BulkDeleteMajorModal } from './components/BulkDeleteMajorModal';
import { MajorActionsMenu } from './components/MajorActionsMenu';
import { MajorStatCard } from './components/MajorStatCard';
import { ResizableTable, ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable';
import { TableSkeleton } from '@/app/(page)/admin/student-profile/components/LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { useMajors } from './lib/hooks/useMajors';
import { majorsApi } from './lib/api/majorsApi';
import { getStatusDisplay } from './lib/types/types';
import type { Major, Faculty, Curriculum } from './lib/types/types';

const STAT_CARDS = [
  { 
    key: 'total', 
    label: 'Tổng chuyên ngành', 
    bgColor: 'bg-[#FFDDAA]',
    iconColor: 'text-[#CC8800]',
    Icon: School
  },
  { 
    key: 'active', 
    label: 'Đang hoạt động', 
    bgColor: 'bg-[#CCEECC]',
    iconColor: 'text-[#44AA44]',
    Icon: CheckCircle2
  },
  { 
    key: 'inactive', 
    label: 'Ngừng hoạt động', 
    bgColor: 'bg-[#FFBBAA]',
    iconColor: 'text-[#CC4444]',
    Icon: XCircle
  },
] as const;

export default function MajorManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingMajorId, setDeletingMajorId] = useState<string | null>(null);
  const [deletingMajorName, setDeletingMajorName] = useState<string | undefined>(undefined);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [selectedMajorIds, setSelectedMajorIds] = useState<Set<string>>(new Set());
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);

  const { majors, loading, currentPage, totalCount, totalPages, stats, fetchMajors, setCurrentPage } = useMajors();

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'majorCode', label: 'Mã', width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    { key: 'majorName', label: 'Tên chuyên ngành', width: 250, minWidth: 200, align: 'left', visible: true, required: true },
    { key: 'facultyName', label: 'Ngành học', width: 200, minWidth: 150, align: 'left', visible: true },
    { key: 'curriculumName', label: 'Thuộc CTĐT', width: 160, minWidth: 120, align: 'left', visible: true },
    { key: 'status', label: 'Trạng thái', width: 160, minWidth: 140, align: 'center', visible: true },
    { key: 'actions', label: 'Thao tác', width: 140, minWidth: 100, align: 'center', visible: true, required: true },
  ]);

  useEffect(() => {
    majorsApi.getFaculties().then((res) => {
      if (res.success) setFaculties(res.data);
    });
    majorsApi.getCurricula().then((res) => {
      if (res.success) setCurricula(res.data);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setCurrentPage]);

  useEffect(() => {
    fetchMajors({
      pageNumber: currentPage,
      pageSize: 20,
      searchKeyword: searchKeyword || undefined,
      facultyId: selectedFacultyId || undefined,
      curriculumId: selectedCurriculumId || undefined,
      status: selectedStatus || undefined,
    });
  }, [currentPage, searchKeyword, selectedFacultyId, selectedCurriculumId, selectedStatus, fetchMajors]);

  const statValues = useMemo(() => ({
    total: stats.totalMajors,
    active: stats.activeMajors,
    inactive: stats.inactiveMajors,
  }), [stats]);

  const handleDeleteClick = useCallback((majorId: string, majorName: string) => {
    setDeletingMajorId(majorId);
    setDeletingMajorName(majorName);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditClick = useCallback((major: Major) => {
    setEditingMajor(major);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingMajorId) return;
    const res = await majorsApi.deleteMajor();
    if (res.success) {
      toast.success('Xóa chuyên ngành thành công');
      fetchMajors({
        pageNumber: currentPage,
        pageSize: 20,
        searchKeyword: searchKeyword || undefined,
        facultyId: selectedFacultyId || undefined,
        curriculumId: selectedCurriculumId || undefined,
        status: selectedStatus || undefined,
      });
    } else {
      toast.error(res.message || 'Xóa chuyên ngành thất bại');
    }
  };

  const handleSelectAll = useCallback(() => {
    if (selectedMajorIds.size === majors.length) {
      setSelectedMajorIds(new Set());
    } else {
      setSelectedMajorIds(new Set(majors.map(m => m.majorId)));
    }
  }, [majors, selectedMajorIds.size]);

  const handleSelectOne = useCallback((majorId: string) => {
    setSelectedMajorIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(majorId)) {
        newSet.delete(majorId);
      } else {
        newSet.add(majorId);
      }
      return newSet;
    });
  }, []);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedMajorIds);
    const res = await majorsApi.bulkDeleteMajors(ids);
    if (res.success) {
      toast.success(res.message || `Đã xóa ${ids.length} chuyên ngành`);
      setSelectedMajorIds(new Set());
      setIsBulkDeleteModalOpen(false);
      fetchMajors({
        pageNumber: currentPage,
        pageSize: 20,
        searchKeyword: searchKeyword || undefined,
        facultyId: selectedFacultyId || undefined,
        curriculumId: selectedCurriculumId || undefined,
        status: selectedStatus || undefined,
      });
    } else {
      toast.error(res.message || 'Xóa hàng loạt thất bại');
    }
  };

  const renderMajorRow = useCallback((major: Major, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(major.status);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const isSelected = selectedMajorIds.has(major.majorId);

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
                      onChange={() => handleSelectOne(major.majorId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'majorCode':
              return (
                <td key="majorCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {major.majorCode}
                </td>
              );
            case 'majorName':
              return (
                <td key="majorName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {major.majorName}
                </td>
              );
            case 'facultyName':
              return (
                <td key="facultyName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {major.facultyName}
                </td>
              );
            case 'curriculumName':
              return (
                <td key="curriculumName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {major.curriculumName}
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
                  <MajorActionsMenu
                    majorId={major.majorId}
                    majorName={major.majorName}
                    onEdit={() => handleEditClick(major)}
                    onDelete={() => handleDeleteClick(major.majorId, major.majorName)}
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
  }, [handleDeleteClick, handleEditClick, handleSelectOne, selectedMajorIds]);

  const facultyOptions = [
    { value: '', label: 'Tất cả ngành học' },
    ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
  ];

  const curriculumOptions = [
    { value: '', label: 'Tất cả CTĐT' },
    ...curricula.map((c) => ({ value: c.curriculumId, label: c.curriculumName })),
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Ngừng hoạt động' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Chuyên ngành</h1>
        <p className="text-gray-600 mt-1">Quản lý các chuyên ngành đào tạo</p>
      </div>

      {/* Stats Cards */}
      {loading && majors.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {STAT_CARDS.map((card, index) => {
            const value = statValues[card.key];
            return (
              <MajorStatCard
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
                Danh sách Chuyên ngành
              </h2>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                <Plus className="w-4 h-4" />
                Thêm mới
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <SearchInput
                placeholder="Tìm kiếm theo mã, tên chuyên ngành..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Faculty Dropdown */}
            <Dropdown
              options={facultyOptions}
              value={selectedFacultyId || ''}
              placeholder="Tất cả ngành học"
              onChange={(value) => {
                setSelectedFacultyId(value);
                setCurrentPage(1);
              }}
            />

            {/* Curriculum Dropdown */}
            <Dropdown
              options={curriculumOptions}
              value={selectedCurriculumId || ''}
              placeholder="Tất cả CTĐT"
              onChange={(value) => {
                setSelectedCurriculumId(value);
                setCurrentPage(1);
              }}
            />

            {/* Status Dropdown */}
            <Dropdown
              options={statusOptions}
              value={selectedStatus || ''}
              placeholder="Tất cả"
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Bulk Actions Bar */}
          {selectedMajorIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  Đã chọn {selectedMajorIds.size} ngành
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkEditModalOpen(true)}
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh sửa toàn bộ
                </Button>
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
                  onClick={() => setSelectedMajorIds(new Set())}
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
              data={majors}
              renderRow={(major, visibleColumns, cellStyle) => (
                <tr className="hover:bg-gray-50 transition-colors">
                  {renderMajorRow(major, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage="Không có dữ liệu"
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={majors.length > 0 && selectedMajorIds.size === majors.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedMajorIds.size > 0 && selectedMajorIds.size < majors.length;
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
      <AddMajorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchMajors({
            pageNumber: currentPage,
            pageSize: 20,
            searchKeyword: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            curriculumId: selectedCurriculumId || undefined,
            status: selectedStatus || undefined,
          });
        }}
      />

      <EditMajorModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMajor(null);
        }}
        major={editingMajor}
        onSuccess={() => {
          fetchMajors({
            pageNumber: currentPage,
            pageSize: 20,
            searchKeyword: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            curriculumId: selectedCurriculumId || undefined,
            status: selectedStatus || undefined,
          });
        }}
      />

      <BulkEditMajorModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedMajorIds={Array.from(selectedMajorIds)}
        onSuccess={() => {
          setSelectedMajorIds(new Set());
          fetchMajors({
            pageNumber: currentPage,
            pageSize: 20,
            searchKeyword: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            curriculumId: selectedCurriculumId || undefined,
            status: selectedStatus || undefined,
          });
        }}
      />

      <ConfirmDeleteMajorModal
        isOpen={isDeleteModalOpen}
        majorName={deletingMajorName}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingMajorId(null);
          setDeletingMajorName(undefined);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteMajorModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        selectedCount={selectedMajorIds.size}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
