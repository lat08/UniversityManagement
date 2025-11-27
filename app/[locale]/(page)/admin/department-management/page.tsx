'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CircleCheck,
  Edit2,
  Plus,
  School,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import {
  AddDepartmentModal,
  EditDepartmentModal,
  BulkEditDepartmentModal,
  ConfirmDeleteDepartmentModal,
  BulkDeleteDepartmentModal,
  DepartmentActionsMenu,
  DepartmentStatCard,
} from './components';
import { ResizableTable, ResizableColumn } from '../student-profile/components/ResizableTable';
import { TableSkeleton } from '../student-profile/components/LoadingSkeleton';
import { useDepartments } from './lib/hooks/useDepartments';
import { getStatusDisplay } from './lib/types/types';
import type { Department } from './lib/types/types';

const STAT_CARDS = [
  {
    key: 'total',
    labelKey: 'stats.total',
    bgColor: 'bg-[#FFDDAA]',
    iconColor: 'text-[#CC8800]',
    Icon: School,
  },
  {
    key: 'active',
    labelKey: 'stats.active',
    bgColor: 'bg-[#CCEECC]',
    iconColor: 'text-[#44AA44]',
    Icon: CheckCircle2,
  },
  {
    key: 'inactive',
    labelKey: 'stats.inactive',
    bgColor: 'bg-[#FFBBAA]',
    iconColor: 'text-[#CC4444]',
    Icon: XCircle,
  },
] as const;

export default function DepartmentManagementPage() {
  const t = useTranslations('admin.departmentManagement');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);
  const [deletingDepartmentName, setDeletingDepartmentName] = useState<string | undefined>(
    undefined
  );
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<Set<string>>(new Set());

  const {
    departments,
    pagination,
    stats,
    faculties,
    curricula,
    isLoading,
    handleSearch,
    handleFilterChange,
    setCurrentPage,
    deleteDepartment,
    bulkDeleteDepartments,
  } = useDepartments();

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>(() => [
    {
      key: 'checkbox',
      label: '',
      width: 50,
      minWidth: 50,
      align: 'center',
      visible: true,
      required: true,
    },
    {
      key: 'departmentCode',
      label: t('table.columns.code'),
      width: 100,
      minWidth: 80,
      align: 'left',
      visible: true,
      required: true,
    },
    {
      key: 'departmentName',
      label: t('table.columns.name'),
      width: 180,
      minWidth: 150,
      align: 'left',
      visible: true,
      required: true,
    },
    {
      key: 'facultyName',
      label: t('table.columns.faculty'),
      width: 150,
      minWidth: 120,
      align: 'left',
      visible: true,
    },
    {
      key: 'curriculumName',
      label: t('table.columns.curriculum'),
      width: 280,
      minWidth: 200,
      align: 'left',
      visible: true,
    },
    {
      key: 'status',
      label: t('table.columns.status'),
      width: 140,
      minWidth: 120,
      align: 'center',
      visible: true,
    },
    {
      key: 'actions',
      label: t('table.columns.actions'),
      width: 100,
      minWidth: 80,
      align: 'center',
      visible: true,
      required: true,
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setCurrentPage]);

  useEffect(() => {
    handleSearch(searchKeyword);
  }, [searchKeyword, handleSearch]);

  useEffect(() => {
    handleFilterChange({
      facultyId: selectedFacultyId || undefined,
      curriculumId: selectedCurriculumId || undefined,
    });
  }, [selectedFacultyId, selectedCurriculumId, handleFilterChange]);

  const statValues = useMemo(
    () => ({
      total: stats.total,
      active: stats.active,
      inactive: stats.inactive,
    }),
    [stats]
  );

  const handleDeleteClick = useCallback((departmentId: string, departmentName: string) => {
    setDeletingDepartmentId(departmentId);
    setDeletingDepartmentName(departmentName);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditClick = useCallback((department: Department) => {
    setEditingDepartment(department);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingDepartmentId) return;
    deleteDepartment(deletingDepartmentId);
    setIsDeleteModalOpen(false);
    setDeletingDepartmentId(null);
    setDeletingDepartmentName(undefined);
  };

  const handleSelectAll = useCallback(() => {
    if (selectedDepartmentIds.size === departments.length) {
      setSelectedDepartmentIds(new Set());
    } else {
      setSelectedDepartmentIds(new Set(departments.map((d) => d.departmentId)));
    }
  }, [departments, selectedDepartmentIds.size]);

  const handleSelectOne = useCallback((departmentId: string) => {
    setSelectedDepartmentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(departmentId)) {
        newSet.delete(departmentId);
      } else {
        newSet.add(departmentId);
      }
      return newSet;
    });
  }, []);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedDepartmentIds);
    bulkDeleteDepartments(ids);
    setSelectedDepartmentIds(new Set());
    setIsBulkDeleteModalOpen(false);
  };

  const renderDepartmentRow = useCallback(
    (
      department: Department,
      visibleColumns: ResizableColumn[],
      cellStyle: { paddingX: string; paddingY: string }
    ) => {
      const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
      const isSelected = selectedDepartmentIds.has(department.departmentId);

      return (
        <>
          {visibleColumns.map((column) => {
            const widthPercent =
              (column as { widthPercent?: number }).widthPercent ||
              (baseTotalWidth > 0
                ? (column.width / baseTotalWidth) * 100
                : 100 / visibleColumns.length);

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
                        onChange={() => handleSelectOne(department.departmentId)}
                        className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                      />
                    </div>
                  </td>
                );
              case 'departmentCode':
                return (
                  <td
                    key="departmentCode"
                    className="text-gray-900 font-medium"
                    style={cellPaddingStyle}
                  >
                    {department.departmentCode}
                  </td>
                );
              case 'departmentName':
                return (
                  <td
                    key="departmentName"
                    className="text-gray-900"
                    style={cellPaddingStyle}
                  >
                    {department.departmentName}
                  </td>
                );
              case 'facultyName':
                return (
                  <td
                    key="facultyName"
                    className="text-gray-600"
                    style={cellPaddingStyle}
                  >
                    {department.facultyName}
                  </td>
                );
              case 'curriculumName':
                const curriculumNames = department.curricula
                  .map((c) => c.curriculumName)
                  .join(', ');
                return (
                  <td
                    key="curriculumName"
                    className="text-gray-600"
                    style={cellPaddingStyle}
                    title={curriculumNames}
                  >
                    {curriculumNames || '-'}
                  </td>
                );
              case 'status':
                const isCompact = parseFloat(cellStyle.paddingX) < 20;
                const statusFontSize = isCompact ? '0.65rem' : '0.75rem';
                const statusPadding = isCompact ? '0.125rem 0.375rem' : '0.25rem 0.5rem';
                const statusDisplay = getStatusDisplay(department.isActive);
                const statusKey = department.isActive ? 'active' : 'inactive';
                return (
                  <td key="status" style={cellPaddingStyle}>
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
                        {t(`table.status.${statusKey}`)}
                      </span>
                    </div>
                  </td>
                );
              case 'actions':
                return (
                  <td
                    key="actions"
                    style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}
                  >
                    <DepartmentActionsMenu
                      departmentId={department.departmentId}
                      departmentName={department.departmentName}
                      onEdit={() => handleEditClick(department)}
                      onDelete={() =>
                        handleDeleteClick(department.departmentId, department.departmentName)
                      }
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
    },
    [handleDeleteClick, handleEditClick, handleSelectOne, selectedDepartmentIds, t]
  );

  const facultyOptions = [
    { value: '', label: t('filters.allFaculties') },
    ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
  ];

  const curriculumOptions = [
    { value: '', label: t('filters.allCurricula') },
    ...curricula.map((c) => ({ value: c.curriculumId, label: c.curriculumName })),
  ];


  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* Stats Cards */}
      {isLoading && departments.length === 0 ? (
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
              <DepartmentStatCard
                key={index}
                label={t(card.labelKey)}
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
                {t('listTitle')}
              </h2>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                <Plus className="w-4 h-4" />
                {t('actions.add')}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <SearchInput
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Faculty Dropdown */}
            <Dropdown
              options={facultyOptions}
              value={selectedFacultyId || ''}
              placeholder={t('filters.allFaculties')}
              onChange={(value) => {
                setSelectedFacultyId(value);
                setCurrentPage(1);
              }}
            />

            {/* Curriculum Dropdown */}
            <Dropdown
              options={curriculumOptions}
              value={selectedCurriculumId || ''}
              placeholder={t('filters.allCurricula')}
              onChange={(value) => {
                setSelectedCurriculumId(value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Bulk Actions Bar */}
          {selectedDepartmentIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  {t('table.selected', { count: selectedDepartmentIds.size })}
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
                  {t('actions.bulkEdit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('actions.bulkDelete')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedDepartmentIds(new Set())}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  {t('actions.clearSelection')}
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
              data={departments}
              renderRow={(department, visibleColumns, cellStyle) => (
                <tr className="hover:bg-gray-50 transition-colors">
                  {renderDepartmentRow(department, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={isLoading}
              emptyMessage={t('table.empty')}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={
                    departments.length > 0 &&
                    selectedDepartmentIds.size === departments.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedDepartmentIds.size > 0 &&
                        selectedDepartmentIds.size < departments.length;
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
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          handleSearch(searchKeyword);
        }}
      />

      <EditDepartmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDepartment(null);
        }}
        department={editingDepartment}
        onSuccess={() => {
          handleSearch(searchKeyword);
        }}
      />

      <BulkEditDepartmentModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedDepartmentIds={Array.from(selectedDepartmentIds)}
        onSuccess={() => {
          setSelectedDepartmentIds(new Set());
          handleSearch(searchKeyword);
        }}
      />

      <ConfirmDeleteDepartmentModal
        isOpen={isDeleteModalOpen}
        departmentName={deletingDepartmentName}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingDepartmentId(null);
          setDeletingDepartmentName(undefined);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteDepartmentModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        selectedCount={selectedDepartmentIds.size}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}