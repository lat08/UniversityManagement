'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Building2, CheckCircle2, XCircle, Edit2, Trash2, X, CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { AddBuildingModal } from './components/AddBuildingModal';
import { EditBuildingModal } from './components/EditBuildingModal';
import { BulkEditBuildingModal } from './components/BulkEditBuildingModal';
import { ConfirmDeleteBuildingModal } from './components/ConfirmDeleteBuildingModal';
import { BulkDeleteBuildingModal } from './components/BulkDeleteBuildingModal';
import { BuildingActionsMenu } from './components/BuildingActionsMenu';
import { BuildingStatCard } from './components/BuildingStatCard';
import { ResizableTable, ResizableColumn } from '../student-profile/components/ResizableTable';
import { TableSkeleton } from '../student-profile/components/LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { useBuildings } from './lib/hooks/useBuildings';
import { buildingsApi } from './lib/api/buildingsApi';
import { getStatusDisplay } from './lib/types/types';
import type { Building } from './lib/types/types';

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

export default function BuildingManagementPage() {
  const t = useTranslations('admin.buildingManagement');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingBuildingId, setDeletingBuildingId] = useState<string | null>(null);
  const [deletingBuildingName, setDeletingBuildingName] = useState<string | undefined>(undefined);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<Set<string>>(new Set());

  const { buildings, loading, currentPage, totalCount, totalPages, stats, fetchBuildings, setCurrentPage } = useBuildings();

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>(() => [
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'buildingCode', label: t('table.columns.code'), width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    { key: 'buildingName', label: t('table.columns.name'), width: 250, minWidth: 200, align: 'left', visible: true, required: true },
    { key: 'address', label: t('table.columns.address'), width: 300, minWidth: 200, align: 'left', visible: true },
    { key: 'status', label: t('table.columns.status'), width: 160, minWidth: 140, align: 'center', visible: true },
    { key: 'actions', label: t('table.columns.actions'), width: 140, minWidth: 100, align: 'center', visible: true, required: true },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setCurrentPage]);

  useEffect(() => {
    fetchBuildings({
      pageIndex: currentPage,
      pageSize: 20,
      search: searchKeyword || undefined,
    });
  }, [currentPage, searchKeyword, fetchBuildings]);

  // Filter buildings by status on client side if needed
  const filteredBuildings = useMemo(() => {
    if (!selectedStatus) return buildings;
    return buildings.filter(b => b.buildingStatus?.toLowerCase() === selectedStatus.toLowerCase());
  }, [buildings, selectedStatus]);

  const statValues = useMemo(() => ({
    total: stats.totalBuildings,
    active: stats.activeBuildings,
    inactive: stats.inactiveBuildings,
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

  const handleDeleteClick = useCallback((buildingId: string, buildingName: string) => {
    setDeletingBuildingId(buildingId);
    setDeletingBuildingName(buildingName);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditClick = useCallback((building: Building) => {
    setEditingBuilding(building);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingBuildingId) return;
    const res = await buildingsApi.delete(deletingBuildingId);
    if (res.success) {
      toast.success(t('hooks.deleteSuccess'));
      fetchBuildings({
        pageIndex: currentPage,
        pageSize: 20,
        search: searchKeyword || undefined,
      });
    } else {
      toast.error(res.message || t('hooks.deleteError'));
    }
  };

  const handleSelectAll = useCallback(() => {
    if (selectedBuildingIds.size === filteredBuildings.length) {
      setSelectedBuildingIds(new Set());
    } else {
      setSelectedBuildingIds(new Set(filteredBuildings.map(b => b.buildingId)));
    }
  }, [filteredBuildings, selectedBuildingIds.size]);

  const handleSelectOne = useCallback((buildingId: string) => {
    setSelectedBuildingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(buildingId)) {
        newSet.delete(buildingId);
      } else {
        newSet.add(buildingId);
      }
      return newSet;
    });
  }, []);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedBuildingIds);
    const res = await buildingsApi.bulkDelete(ids);
    if (res.success) {
      toast.success(res.message || t('hooks.bulkDeleteSuccess', { count: ids.length }));
      setSelectedBuildingIds(new Set());
      setIsBulkDeleteModalOpen(false);
      fetchBuildings({
        pageIndex: currentPage,
        pageSize: 20,
        search: searchKeyword || undefined,
      });
    } else {
      toast.error(res.message || t('hooks.bulkDeleteError'));
    }
  };

  const renderBuildingRow = useCallback((building: Building, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(building.buildingStatus, statusLabels);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const isSelected = selectedBuildingIds.has(building.buildingId);

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
                      onChange={() => handleSelectOne(building.buildingId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'buildingCode':
              return (
                <td key="buildingCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {building.buildingCode}
                </td>
              );
            case 'buildingName':
              return (
                <td key="buildingName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {building.buildingName}
                </td>
              );
            case 'address':
              return (
                <td key="address" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {building.address || '-'}
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
                  <BuildingActionsMenu
                    buildingId={building.buildingId}
                    buildingName={building.buildingName}
                    onEdit={() => handleEditClick(building)}
                    onDelete={() => handleDeleteClick(building.buildingId, building.buildingName)}
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
  }, [handleDeleteClick, handleEditClick, handleSelectOne, selectedBuildingIds, statusLabels]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* Stats Cards */}
      {loading && buildings.length === 0 ? (
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
              <BuildingStatCard
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
          {selectedBuildingIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  {t('bulk.selected', { count: selectedBuildingIds.size })}
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
                  onClick={() => setSelectedBuildingIds(new Set())}
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
              data={filteredBuildings}
              renderRow={(building, visibleColumns, cellStyle) => (
                <tr key={building.buildingId} className="hover:bg-gray-50 transition-colors">
                  {renderBuildingRow(building, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage={t('table.empty')}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={filteredBuildings.length > 0 && selectedBuildingIds.size === filteredBuildings.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedBuildingIds.size > 0 && selectedBuildingIds.size < filteredBuildings.length;
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
      <AddBuildingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchBuildings({
            pageIndex: currentPage,
            pageSize: 20,
            search: searchKeyword || undefined,
          });
        }}
      />

      <EditBuildingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBuilding(null);
        }}
        building={editingBuilding}
        onSuccess={() => {
          fetchBuildings({
            pageIndex: currentPage,
            pageSize: 20,
            search: searchKeyword || undefined,
          });
        }}
      />

      <BulkEditBuildingModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedBuildingIds={Array.from(selectedBuildingIds)}
        onSuccess={() => {
          setSelectedBuildingIds(new Set());
          fetchBuildings({
            pageIndex: currentPage,
            pageSize: 20,
            search: searchKeyword || undefined,
          });
        }}
      />

      <ConfirmDeleteBuildingModal
        isOpen={isDeleteModalOpen}
        buildingName={deletingBuildingName}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingBuildingId(null);
          setDeletingBuildingName(undefined);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteBuildingModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        selectedCount={selectedBuildingIds.size}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}