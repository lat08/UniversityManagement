'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, School, CheckCircle2, XCircle, Edit2, Trash2, X, CircleCheck, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { AddDivisionModal } from './components/AddDivisionModal';
import { EditDivisionModal } from './components/EditDivisionModal';
import { BulkEditDivisionModal } from './components/BulkEditDivisionModal';
import { ConfirmDeleteDivisionModal } from './components/ConfirmDeleteDivisionModal';
import { BulkDeleteDivisionModal } from './components/BulkDeleteDivisionModal';
import { DivisionActionsMenu } from './components/DivisionActionsMenu';
import { DivisionStatCard } from './components/DivisionStatCard';
import { ResizableTable, ResizableColumn } from '../student-profile/components/ResizableTable';
import { TableSkeleton } from '../student-profile/components/LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { useDivisions } from './lib/hooks/useDivisions';
import { divisionsApi } from './lib/api/divisionsApi';
import { getStatusDisplay } from './lib/types/types';
import type { Division } from './lib/types/types';

const STAT_CARDS = [
  { 
    key: 'total', 
    labelKey: 'stats.total',
    bgColor: 'bg-[#FFDDAA]',
    iconColor: 'text-[#CC8800]',
    Icon: School
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

export default function DivisionManagementPage() {
  const t = useTranslations('admin.divisionManagement');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingDivisionId, setDeletingDivisionId] = useState<string | null>(null);
  const [deletingDivisionName, setDeletingDivisionName] = useState<string | undefined>(undefined);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [selectedDivisionIds, setSelectedDivisionIds] = useState<Set<string>>(new Set());

  const { divisions, loading, currentPage, totalCount, totalPages, stats, fetchDivisions, setCurrentPage } = useDivisions();

  // Initialize columns after translations are loaded
  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([]);

  useEffect(() => {
    setResizableColumns([
      { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
      { key: 'divisionCode', label: t('table.columns.code'), width: 120, minWidth: 100, align: 'left', visible: true, required: true },
      { key: 'divisionName', label: t('table.columns.name'), width: 250, minWidth: 200, align: 'left', visible: true, required: true },
      { key: 'deanName', label: t('table.columns.dean'), width: 200, minWidth: 150, align: 'left', visible: true },
      { key: 'facultyCount', label: t('table.columns.facultyCount'), width: 120, minWidth: 100, align: 'center', visible: true },
      { key: 'instructorCount', label: t('table.columns.instructorCount'), width: 140, minWidth: 120, align: 'center', visible: true },
      { key: 'status', label: t('table.columns.status'), width: 160, minWidth: 140, align: 'center', visible: true },
      { key: 'actions', label: t('table.columns.actions'), width: 140, minWidth: 100, align: 'center', visible: true, required: true },
    ]);
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setCurrentPage]);

  useEffect(() => {
    fetchDivisions({
      pageNumber: currentPage,
      pageSize: 20,
      searchTerm: searchKeyword || undefined,
      status: selectedStatus || undefined,
    });
  }, [currentPage, searchKeyword, selectedStatus, fetchDivisions]);

  const filteredDivisions = useMemo(() => divisions, [divisions]);

  const statValues = useMemo(() => ({
    total: stats.totalDivisions,
    active: stats.activeDivisions,
    inactive: stats.inactiveDivisions,
  }), [stats]);

  const statusLabels = useMemo(() => ({
    active: t('status.active'),
    inactive: t('status.inactive'),
    unknown: t('status.unknown'),
  }), [t]);

  const statusOptions = useMemo(() => ([
    { value: '', label: t('status.all') },
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ]), [t]);

  const handleDeleteClick = useCallback((divisionId: string, divisionName: string) => {
    setDeletingDivisionId(divisionId);
    setDeletingDivisionName(divisionName);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditClick = useCallback((division: Division) => {
    setEditingDivision(division);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingDivisionId) return;
    const res = await divisionsApi.bulkDelete({ divisionIds: [deletingDivisionId] });
    if (res.isSuccess) {
      toast.success(t('hooks.deleteSuccess'));
      fetchDivisions({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        status: selectedStatus || undefined,
      });
    } else {
      toast.error(res.message || t('hooks.deleteError'));
    }
  };

  const handleSelectAll = useCallback(() => {
    if (selectedDivisionIds.size === filteredDivisions.length) {
      setSelectedDivisionIds(new Set());
    } else {
      setSelectedDivisionIds(new Set(filteredDivisions.map(d => d.divisionId)));
    }
  }, [filteredDivisions, selectedDivisionIds.size]);

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
    const res = await divisionsApi.bulkDelete({ divisionIds: ids });
    if (res.isSuccess) {
      toast.success(res.message || t('hooks.bulkDeleteSuccess', { count: res.data.deletedCount }));
      setSelectedDivisionIds(new Set());
      setIsBulkDeleteModalOpen(false);
      fetchDivisions({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        status: selectedStatus || undefined,
      });
    } else {
      toast.error(res.message || t('hooks.bulkDeleteError'));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await divisionsApi.export({
        searchTerm: searchKeyword || undefined,
        status: selectedStatus || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `DanhSachKhoa_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(t('hooks.exportSuccess'));
    } catch (error) {
      toast.error(t('hooks.exportError'));
      console.error('Export error:', error);
    }
  };

  const renderDivisionRow = useCallback((division: Division, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(division.divisionStatus, statusLabels);
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
                      onChange={() => handleSelectOne(division.divisionId)}
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
                  {division.deanName || '-'}
                </td>
              );
            case 'facultyCount':
              return (
                <td key="facultyCount" className="text-gray-900 text-center" style={cellPaddingStyle}>
                  {division.facultyCount ?? 0}
                </td>
              );
            case 'instructorCount':
              return (
                <td key="instructorCount" className="text-gray-900 text-center" style={cellPaddingStyle}>
                  {division.instructorCount ?? 0}
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
                  <DivisionActionsMenu
                    divisionId={division.divisionId}
                    divisionName={division.divisionName}
                    onEdit={() => handleEditClick(division)}
                    onDelete={() => handleDeleteClick(division.divisionId, division.divisionName)}
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
  }, [handleDeleteClick, handleEditClick, handleSelectOne, selectedDivisionIds, statusLabels]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* Stats Cards */}
      {loading && divisions.length === 0 ? (
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
              <DivisionStatCard
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
                onClick={handleExport}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                {t('actions.export')}
              </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <SearchInput
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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
          {selectedDivisionIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  {t('bulk.selected', { count: selectedDivisionIds.size })}
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
                  onClick={() => setSelectedDivisionIds(new Set())}
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
              data={filteredDivisions}
              renderRow={(division, visibleColumns, cellStyle) => (
                <tr key={division.divisionId} className="hover:bg-gray-50 transition-colors">
                  {renderDivisionRow(division, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage={t('table.empty')}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={filteredDivisions.length > 0 && selectedDivisionIds.size === filteredDivisions.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedDivisionIds.size > 0 && selectedDivisionIds.size < filteredDivisions.length;
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
      <AddDivisionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchDivisions({
            pageNumber: currentPage,
            pageSize: 20,
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
          });
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
          fetchDivisions({
            pageNumber: currentPage,
            pageSize: 20,
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
          });
        }}
      />

      <BulkEditDivisionModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedDivisionIds={Array.from(selectedDivisionIds)}
        onSuccess={() => {
          setSelectedDivisionIds(new Set());
          fetchDivisions({
            pageNumber: currentPage,
            pageSize: 20,
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
          });
        }}
      />

      <ConfirmDeleteDivisionModal
        isOpen={isDeleteModalOpen}
        divisionName={deletingDivisionName}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingDivisionId(null);
          setDeletingDivisionName(undefined);
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
