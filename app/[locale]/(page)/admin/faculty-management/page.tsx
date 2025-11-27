'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Building2, CheckCircle2, XCircle, Edit2, Trash2, X, CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DropdownSearch, SearchInput, Button, Dropdown } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { AddFacultyModal } from './components/AddFacultyModal';
import { EditFacultyModal } from './components/EditFacultyModal';
import { BulkEditFacultyModal } from './components/BulkEditFacultyModal';
import { ConfirmDeleteFacultyModal } from './components/ConfirmDeleteFacultyModal';
import { BulkDeleteFacultyModal } from './components/BulkDeleteFacultyModal';
import { FacultyActionsMenu } from './components/FacultyActionsMenu';
import { FacultyStatCard } from './components/FacultyStatCard';
import { ResizableTable, ResizableColumn } from '../student-profile/components/ResizableTable';
import { TableSkeleton } from '../student-profile/components/LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { useFaculties } from './lib/hooks/useFaculties';
import { facultiesApi, commonApi } from './lib/api/facultiesApi';
import { getStatusDisplay } from './lib/types/types';
import type { Faculty, Division, Curriculum } from './lib/types/types';

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

export default function FacultyManagementPage() {
  const t = useTranslations('admin.facultyManagement');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingFacultyId, setDeletingFacultyId] = useState<string | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<Set<string>>(new Set());
  
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);

  const { faculties, loading, currentPage, totalCount, totalPages, stats, fetchFaculties, fetchStats, setCurrentPage } = useFaculties();

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>(() => [
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'facultyCode', label: t('table.columns.code'), width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    { key: 'facultyName', label: t('table.columns.name'), width: 250, minWidth: 200, align: 'left', visible: true, required: true },
    { key: 'divisionName', label: t('table.columns.division'), width: 200, minWidth: 150, align: 'left', visible: true },
    { key: 'deanName', label: t('table.columns.dean'), width: 200, minWidth: 150, align: 'left', visible: true },
    { key: 'departmentCount', label: t('table.columns.departments'), width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'status', label: t('table.columns.status'), width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'actions', label: t('table.columns.actions'), width: 140, minWidth: 100, align: 'center', visible: true, required: true },
  ]);

  // Load divisions on mount
  useEffect(() => {
    const loadDivisions = async () => {
      setLoadingDivisions(true);
      try {
        console.log('Loading divisions...');
        const divisionsData = await commonApi.getDivisions();
        console.log('Divisions loaded:', divisionsData);
        setDivisions(divisionsData);
      } catch (error) {
        console.error('Error loading divisions:', error);
        toast.error('Không thể tải danh sách khoa');
      } finally {
        setLoadingDivisions(false);
      }
    };
    
    loadDivisions();
  }, []);

  // Load curriculums when division changes
  useEffect(() => {
    if (selectedDivisionId) {
      setLoadingCurriculums(true);
      // Load curriculums for filtering
      commonApi.getCurriculums(undefined, selectedDivisionId)
        .then(setCurriculums)
        .catch(() => toast.error('Không thể tải danh sách chương trình đào tạo'))
        .finally(() => setLoadingCurriculums(false));
    } else {
      setCurriculums([]);
      setSelectedCurriculumId('');
    }
  }, [selectedDivisionId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setCurrentPage]);

  // Fetch stats on mount (always total counts, not filtered)
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchFaculties({
      pageNumber: currentPage,
      pageSize: 20,
      searchTerm: searchKeyword || undefined,
      divisionId: selectedDivisionId || undefined,
      curriculumId: selectedCurriculumId || undefined,
      isActive: selectedStatus ? selectedStatus === 'active' : undefined,
    });
  }, [currentPage, searchKeyword, selectedDivisionId, selectedCurriculumId, selectedStatus, fetchFaculties]);

  const filteredFaculties = useMemo(() => {
    return faculties;
  }, [faculties]);

  const statValues = useMemo(() => ({
    total: stats.totalFaculties,
    active: stats.activeFaculties,
    inactive: stats.inactiveFaculties,
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

  const divisionOptions = useMemo(() => {
    console.log('Creating divisionOptions, divisions count:', divisions.length, 'divisions:', divisions);
    const options = [
      { value: '', label: t('filters.allDivisions') },
      ...divisions.map(d => ({ 
        value: d.divisionId, 
        label: `${d.divisionCode} - ${d.divisionName}` 
      }))
    ];
    console.log('Division options created:', options.length, 'options');
    return options;
  }, [divisions, t]);

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

  const handleDeleteClick = useCallback((faculty: Faculty) => {
    setDeletingFacultyId(faculty.facultyId);
    setDeletingFaculty(faculty);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditClick = useCallback((faculty: Faculty) => {
    setEditingFaculty(faculty);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingFacultyId) return;
    const res = await facultiesApi.delete(deletingFacultyId);
    if (res.success) {
      toast.success(t('hooks.deleteSuccess'));
      // Refresh both list and stats
      await fetchFaculties({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        divisionId: selectedDivisionId || undefined,
        curriculumId: selectedCurriculumId || undefined,
        isActive: selectedStatus ? selectedStatus === 'active' : undefined,
      }, true); // Pass true to update stats
    } else {
      toast.error(res.message || t('hooks.deleteError'));
    }
  };

  const handleSelectAll = useCallback(() => {
    if (selectedFacultyIds.size === filteredFaculties.length) {
      setSelectedFacultyIds(new Set());
    } else {
      setSelectedFacultyIds(new Set(filteredFaculties.map(f => f.facultyId)));
    }
  }, [filteredFaculties, selectedFacultyIds.size]);

  const handleSelectOne = useCallback((facultyId: string) => {
    setSelectedFacultyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(facultyId)) {
        newSet.delete(facultyId);
      } else {
        newSet.add(facultyId);
      }
      return newSet;
    });
  }, []);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedFacultyIds);
    const res = await facultiesApi.bulkDelete(ids);
    if (res.success) {
      toast.success(res.message || t('hooks.bulkDeleteSuccess', { count: ids.length }));
      setSelectedFacultyIds(new Set());
      setIsBulkDeleteModalOpen(false);
      // Refresh both list and stats
      await fetchFaculties({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        divisionId: selectedDivisionId || undefined,
        curriculumId: selectedCurriculumId || undefined,
        isActive: selectedStatus ? selectedStatus === 'active' : undefined,
      }, true); // Pass true to update stats
    } else {
      toast.error(res.message || t('hooks.bulkDeleteError'));
    }
  };

  const renderFacultyRow = useCallback((faculty: Faculty, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(faculty.isActive, statusLabels);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const isSelected = selectedFacultyIds.has(faculty.facultyId);

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
            case 'facultyCode':
              return (
                <td key="facultyCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {faculty.facultyCode}
                </td>
              );
            case 'facultyName':
              return (
                <td key="facultyName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {faculty.facultyName}
                </td>
              );
            case 'divisionName':
              return (
                <td key="divisionName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {faculty.divisionName || '-'}
                </td>
              );
            case 'deanName':
              return (
                <td key="deanName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {faculty.deanName || '-'}
                </td>
              );
            case 'departmentCount':
              return (
                <td key="departmentCount" className="text-gray-600 text-center" style={cellPaddingStyle}>
                  {faculty.departmentCount ?? 0}
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
                  <FacultyActionsMenu
                    facultyId={faculty.facultyId}
                    facultyName={faculty.facultyName}
                    onEdit={() => handleEditClick(faculty)}
                    onDelete={() => handleDeleteClick(faculty)}
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
  }, [handleDeleteClick, handleEditClick, handleSelectOne, selectedFacultyIds, statusLabels]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* Stats Cards */}
      {loading && faculties.length === 0 ? (
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
              <FacultyStatCard
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

            {/* Division Dropdown */}
            <DropdownSearch
              options={divisionOptions}
              value={selectedDivisionId || ''}
              placeholder={t('filters.division')}
              searchPlaceholder={t('filters.searchDivision')}
              onChange={(value) => {
                setSelectedDivisionId(value);
                setSelectedCurriculumId('');
                setCurrentPage(1);
              }}
              disabled={loadingDivisions}
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
              disabled={loadingCurriculums || !selectedDivisionId}
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
          {selectedFacultyIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  {t('bulk.selected', { count: selectedFacultyIds.size })}
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
                  onClick={() => setSelectedFacultyIds(new Set())}
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
              data={filteredFaculties}
              renderRow={(faculty, visibleColumns, cellStyle) => (
                <tr key={faculty.facultyId} className="hover:bg-gray-50 transition-colors">
                  {renderFacultyRow(faculty, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage={t('table.empty')}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={filteredFaculties.length > 0 && selectedFacultyIds.size === filteredFaculties.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedFacultyIds.size > 0 && selectedFacultyIds.size < filteredFaculties.length;
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
      <AddFacultyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={async () => {
          await fetchFaculties({
            pageNumber: currentPage,
            pageSize: 20,
            searchTerm: searchKeyword || undefined,
            divisionId: selectedDivisionId || undefined,
            curriculumId: selectedCurriculumId || undefined,
            isActive: selectedStatus ? selectedStatus === 'active' : undefined,
          }, true); // Pass true to update stats
        }}
      />

      <EditFacultyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFaculty(null);
        }}
        faculty={editingFaculty}
        onSuccess={async () => {
          await fetchFaculties({
            pageNumber: currentPage,
            pageSize: 20,
            searchTerm: searchKeyword || undefined,
            divisionId: selectedDivisionId || undefined,
            curriculumId: selectedCurriculumId || undefined,
            isActive: selectedStatus ? selectedStatus === 'active' : undefined,
          }, true); // Pass true to update stats
        }}
      />

      <BulkEditFacultyModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedFacultyIds={Array.from(selectedFacultyIds)}
        onSuccess={async () => {
          setSelectedFacultyIds(new Set());
          await Promise.all([
            fetchFaculties({
              pageNumber: currentPage,
              pageSize: 20,
              searchTerm: searchKeyword || undefined,
              divisionId: selectedDivisionId || undefined,
              curriculumId: selectedCurriculumId || undefined,
              isActive: selectedStatus ? selectedStatus === 'active' : undefined,
            }),
            fetchStats(),
          ]);
        }}
      />

      <ConfirmDeleteFacultyModal
        isOpen={isDeleteModalOpen}
        faculty={deletingFaculty}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingFacultyId(null);
          setDeletingFaculty(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteFacultyModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        selectedFacultyIds={Array.from(selectedFacultyIds)}
        faculties={faculties}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}

