'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Building2, CheckCircle2, XCircle, Edit2, Trash2, X, CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DropdownSearch, SearchInput, Button, Dropdown } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { AddDepartmentModal } from './components/AddDepartmentModal';
import { EditDepartmentModal } from './components/EditDepartmentModal';
import { BulkEditDepartmentModal } from './components/BulkEditDepartmentModal';
import { ConfirmDeleteDepartmentModal } from './components/ConfirmDeleteDepartmentModal';
import { BulkDeleteDepartmentModal } from './components/BulkDeleteDepartmentModal';
import { DepartmentCurriculaModal } from './components/DepartmentCurriculaModal';
import { DepartmentActionsMenu } from './components/DepartmentActionsMenu';
import { DepartmentStatCard } from './components/DepartmentStatCard';
import { ResizableTable, ResizableColumn } from '../student-profile/components/ResizableTable';
import { TableSkeleton } from '../student-profile/components/LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { useDepartments } from './lib/hooks/useDepartments';
import { departmentsApi, commonApi } from './lib/api/departmentsApi';
import { getStatusDisplay } from './lib/types/types';
import type { Department, Faculty, Curriculum } from './lib/types/types';

const STAT_CARDS = [
  { 
    key: 'total', 
    labelKey: 'stats.total',
    bgColor: 'bg-[#FFDDAA]',
    iconColor: 'text-[#CC8800]',
    Icon: Building2
  },
  { 
    key: 'active', 
    labelKey: 'stats.active',
    bgColor: 'bg-[#CCEECC]',
    iconColor: 'text-[#44AA44]',
    Icon: CheckCircle2
  },
  { 
    key: 'inactive', 
    labelKey: 'stats.inactive',
    bgColor: 'bg-[#FFBBAA]',
    iconColor: 'text-[#CC4444]',
    Icon: XCircle
  },
] as const;

export default function DepartmentManagementPage() {
  const t = useTranslations('admin.departmentManagement');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isCurriculaModalOpen, setIsCurriculaModalOpen] = useState(false);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);
  const [deletingDepartmentName, setDeletingDepartmentName] = useState<string | undefined>(undefined);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewingCurriculaDepartment, setViewingCurriculaDepartment] = useState<Department | null>(null);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<Set<string>>(new Set());
  
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);

  const { departments, loading, currentPage, totalCount, totalPages, stats, fetchDepartments, fetchStats, setCurrentPage } = useDepartments();

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>(() => [
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'departmentCode', label: t('table.columns.code'), width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    { key: 'departmentName', label: t('table.columns.name'), width: 250, minWidth: 200, align: 'left', visible: true, required: true },
    { key: 'facultyName', label: t('table.columns.faculty'), width: 200, minWidth: 150, align: 'left', visible: true },
    { key: 'curricula', label: t('table.columns.curricula'), width: 220, minWidth: 180, align: 'left', visible: true },
    { key: 'subjectCount', label: t('table.columns.subjects'), width: 100, minWidth: 80, align: 'center', visible: true },
    { key: 'classCount', label: t('table.columns.classes'), width: 100, minWidth: 80, align: 'center', visible: true },
    { key: 'status', label: t('table.columns.status'), width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'actions', label: t('table.columns.actions'), width: 140, minWidth: 100, align: 'center', visible: true, required: true },
  ]);

  // Load faculties on mount
  useEffect(() => {
    setLoadingFaculties(true);
    commonApi.getFaculties()
      .then(setFaculties)
      .catch(() => toast.error(t('hooks.loadFacultiesError')))
      .finally(() => setLoadingFaculties(false));
  }, [t]);

  // Load curriculums when faculty changes
  useEffect(() => {
    if (selectedFacultyId) {
      setLoadingCurriculums(true);
      // Load all curriculums for filtering
      commonApi.getCurriculums(undefined, selectedFacultyId)
        .then(setCurriculums)
        .catch(() => toast.error(t('hooks.loadCurriculumsError')))
        .finally(() => setLoadingCurriculums(false));
    } else {
      setCurriculums([]);
      setSelectedCurriculumId('');
    }
  }, [selectedFacultyId, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setCurrentPage]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchDepartments({
      pageNumber: currentPage,
      pageSize: 20,
      searchTerm: searchKeyword || undefined,
      facultyId: selectedFacultyId || undefined,
      curriculumId: selectedCurriculumId || undefined,
      isActive: selectedStatus ? selectedStatus === 'active' : undefined,
    });
  }, [currentPage, searchKeyword, selectedFacultyId, selectedCurriculumId, selectedStatus, fetchDepartments]);

  const filteredDepartments = useMemo(() => {
    return departments;
  }, [departments]);

  const statValues = useMemo(() => ({
    total: stats.totalDepartments,
    active: stats.activeDepartments,
    inactive: stats.inactiveDepartments,
  }), [stats]);

  const statusLabels = useMemo(() => ({
    active: t('status.active'),
    inactive: t('status.inactive'),
  }), [t]);

  const statusOptions = useMemo(() => ([
    { value: '', label: t('status.all') },
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ]), [t]);

  const facultyOptions = useMemo(() => [
    { value: '', label: t('filters.allFaculties') },
    ...faculties.map(f => ({ value: f.facultyId, label: `${f.facultyCode} - ${f.facultyName}` }))
  ], [faculties, t]);

  const curriculumOptions = useMemo(() => [
    { value: '', label: t('filters.allCurriculums') },
    ...curriculums.map(c => ({ 
      value: c.curriculumId, 
      label: `${c.curriculumCode} - ${c.curriculumName} (${c.appliedYear}, v${c.versionNumber})`,
      // Add searchable text for better filtering
      searchText: `${c.curriculumCode} ${c.curriculumName} ${c.appliedYear} v${c.versionNumber} ${c.departmentName || ''}`.toLowerCase()
    }))
  ], [curriculums, t]);

  // Custom filter function for curriculums
  const filterCurriculums = useCallback((options: typeof curriculumOptions, query: string) => {
    if (!query) return options;
    const lowerQuery = query.toLowerCase();
    return options.filter(opt => {
      if (opt.value === '') return true; // Always show "All" option
      interface OptionWithSearch {
        searchText?: string;
        label: string;
      }
      const optionWithSearch = opt as unknown as OptionWithSearch;
      const searchText = optionWithSearch.searchText || opt.label.toLowerCase();
      return searchText.includes(lowerQuery);
    });
  }, []);

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
    const res = await departmentsApi.delete(deletingDepartmentId);
    if (res.success) {
      toast.success(t('hooks.deleteSuccess'));
      // Refresh both list and stats
      await fetchDepartments({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        facultyId: selectedFacultyId || undefined,
        curriculumId: selectedCurriculumId || undefined,
        isActive: selectedStatus ? selectedStatus === 'active' : undefined,
      }, true); // Pass true to update stats
    } else {
      toast.error(res.message || t('hooks.deleteError'));
    }
  };

  const handleSelectAll = useCallback(() => {
    if (selectedDepartmentIds.size === filteredDepartments.length) {
      setSelectedDepartmentIds(new Set());
    } else {
      setSelectedDepartmentIds(new Set(filteredDepartments.map(d => d.departmentId)));
    }
  }, [filteredDepartments, selectedDepartmentIds.size]);

  const handleSelectOne = useCallback((departmentId: string) => {
    setSelectedDepartmentIds(prev => {
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
    const res = await departmentsApi.bulkDelete(ids);
    if (res.success) {
      toast.success(res.message || t('hooks.bulkDeleteSuccess', { count: ids.length }));
      setSelectedDepartmentIds(new Set());
      setIsBulkDeleteModalOpen(false);
      // Refresh both list and stats
      await fetchDepartments({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        facultyId: selectedFacultyId || undefined,
        curriculumId: selectedCurriculumId || undefined,
        isActive: selectedStatus ? selectedStatus === 'active' : undefined,
      }, true); // Pass true to update stats
    } else {
      toast.error(res.message || t('hooks.bulkDeleteError'));
    }
  };

  const renderDepartmentRow = useCallback((department: Department, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(department.isActive, statusLabels);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const isSelected = selectedDepartmentIds.has(department.departmentId);

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
                      onChange={() => handleSelectOne(department.departmentId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'departmentCode':
              return (
                <td key="departmentCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {department.departmentCode}
                </td>
              );
            case 'departmentName':
              return (
                <td key="departmentName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {department.departmentName}
                </td>
              );
            case 'facultyName':
              return (
                <td key="facultyName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {department.facultyName}
                </td>
              );
            case 'curricula':
              const activeCurricula = department.curricula?.filter(c => c.isActive) || [];
              const totalCurricula = department.curricula?.length || 0;
              const inactiveCurricula = totalCurricula - activeCurricula.length;
              return (
                <td 
                  key="curricula" 
                  className={`text-gray-600 ${totalCurricula > 0 ? 'cursor-pointer hover:text-[#0053AD] hover:underline' : ''}`}
                  style={cellPaddingStyle}
                  onClick={() => {
                    if (totalCurricula > 0) {
                      setViewingCurriculaDepartment(department);
                      setIsCurriculaModalOpen(true);
                    }
                  }}
                  title={totalCurricula > 0 ? t('table.columns.curriculaClickHint') : ''}
                >
                  {totalCurricula > 0 ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {t('table.curricula.totalLabel', { count: totalCurricula })}
                      </span>
                      {activeCurricula.length > 0 && (
                        <span className="text-xs text-green-600">
                          {t('table.curricula.activeLabel', { count: activeCurricula.length })}
                        </span>
                      )}
                      {inactiveCurricula > 0 && (
                        <span className="text-xs text-gray-400">
                          {t('table.curricula.inactiveLabel', { count: inactiveCurricula })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              );
            case 'subjectCount':
              return (
                <td key="subjectCount" className="text-gray-600 text-center" style={cellPaddingStyle}>
                  {department.subjectCount || 0}
                </td>
              );
            case 'classCount':
              return (
                <td key="classCount" className="text-gray-600 text-center" style={cellPaddingStyle}>
                  {department.classCount || 0}
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
                  <DepartmentActionsMenu
                    departmentId={department.departmentId}
                    departmentName={department.departmentName}
                    onEdit={() => handleEditClick(department)}
                    onDelete={() => handleDeleteClick(department.departmentId, department.departmentName)}
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
  }, [handleDeleteClick, handleEditClick, handleSelectOne, selectedDepartmentIds, statusLabels, t]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* Stats Cards */}
      {loading && departments.length === 0 ? (
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
            <DropdownSearch
              options={facultyOptions}
              value={selectedFacultyId || ''}
              placeholder={t('filters.faculty')}
              searchPlaceholder={t('filters.searchFaculty')}
              onChange={(value) => {
                setSelectedFacultyId(value);
                setSelectedCurriculumId('');
                setCurrentPage(1);
              }}
              disabled={loadingFaculties}
            />

            {/* Curriculum Dropdown */}
            <DropdownSearch
              options={curriculumOptions}
              value={selectedCurriculumId || ''}
              placeholder={t('filters.curriculum')}
              searchPlaceholder={t('filters.searchCurriculum')}
              onChange={(value) => {
                setSelectedCurriculumId(value);
                setCurrentPage(1);
              }}
              disabled={loadingCurriculums || !selectedFacultyId}
              filterOptions={filterCurriculums}
            />
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Status Dropdown */}
            <Dropdown
              options={statusOptions}
              value={selectedStatus || ''}
              placeholder={t('status.all')}
              onChange={(value) => {
                setSelectedStatus(value);
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
                  {t('bulk.selected', { count: selectedDepartmentIds.size })}
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
                  {t('bulk.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('bulk.delete')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedDepartmentIds(new Set())}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  {t('bulk.clear')}
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
              data={filteredDepartments}
              renderRow={(department, visibleColumns, cellStyle) => (
                <tr key={department.departmentId} className="hover:bg-gray-50 transition-colors">
                  {renderDepartmentRow(department, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage={t('table.empty')}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={filteredDepartments.length > 0 && selectedDepartmentIds.size === filteredDepartments.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedDepartmentIds.size > 0 && selectedDepartmentIds.size < filteredDepartments.length;
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
      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={async () => {
          await fetchDepartments({
            pageNumber: currentPage,
            pageSize: 20,
            searchTerm: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            curriculumId: selectedCurriculumId || undefined,
            isActive: selectedStatus ? selectedStatus === 'active' : undefined,
          }, true); // Pass true to update stats
        }}
      />

      <EditDepartmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDepartment(null);
        }}
        department={editingDepartment}
        onSuccess={async () => {
          await fetchDepartments({
            pageNumber: currentPage,
            pageSize: 20,
            searchTerm: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            curriculumId: selectedCurriculumId || undefined,
            isActive: selectedStatus ? selectedStatus === 'active' : undefined,
          }, true); // Pass true to update stats
        }}
      />

      <BulkEditDepartmentModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedDepartmentIds={Array.from(selectedDepartmentIds)}
        onSuccess={async () => {
          setSelectedDepartmentIds(new Set());
          await Promise.all([
            fetchDepartments({
              pageNumber: currentPage,
              pageSize: 20,
              searchTerm: searchKeyword || undefined,
              facultyId: selectedFacultyId || undefined,
              curriculumId: selectedCurriculumId || undefined,
              isActive: selectedStatus ? selectedStatus === 'active' : undefined,
            }),
            fetchStats(),
          ]);
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

      <DepartmentCurriculaModal
        isOpen={isCurriculaModalOpen}
        onClose={() => {
          setIsCurriculaModalOpen(false);
          setViewingCurriculaDepartment(null);
        }}
        department={viewingCurriculaDepartment}
      />
    </div>
  );
}

