'use client';

import { useEffect, useMemo, useState } from 'react';
import { Archive, ClipboardCheck, FilePenLine, Layers3, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Button, Dropdown, Pagination, SearchInput } from '@/app/components/ui';
import { MajorStatCard } from '@/app/[locale]/(page)/admin/major-management/components/MajorStatCard';
import {
  REGULATION_AUDIENCE_OPTIONS,
  REGULATION_CATEGORIES,
  REGULATION_ISSUING_UNITS,
  REGULATION_STATUS_META,
  REGULATION_STATUS_OPTIONS,
} from '@/lib/constants/regulations';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import {
  RegulationAudience,
  RegulationMutationPayload,
  RegulationQueryParams,
  RegulationRecord,
  RegulationStatus,
} from '@/lib/types/regulation';
import { RegulationListCard } from './components/regulation-list-card';
import { RegulationFormModal } from './components/regulation-form-modal';
import { ConfirmDeleteRegulationModal } from './components/confirm-delete-regulation-modal';
import { RegulationDetailModal } from './components/regulation-detail-modal';
import {
  useCreateRegulation,
  useDeleteRegulation,
  useRegulationDetail,
  useRegulationsList,
  useRegulationsStats,
  useUpdateRegulation,
} from '@/lib/hooks/useAdminRegulations';

const PAGE_SIZE = 8;
const EMPTY_REGULATIONS: RegulationRecord[] = [];

const AdminRegulationsPage = () => {
  const t = useTranslations('admin.regulations');
  const pageTitle = t('pageTitle');
  usePageTitle(pageTitle);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegulationStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState<RegulationAudience | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingRegulation, setEditingRegulation] = useState<RegulationRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRegulation, setDeletingRegulation] = useState<RegulationRecord | null>(null);
  const [detailPreview, setDetailPreview] = useState<RegulationRecord | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.category.all') },
      ...REGULATION_CATEGORIES.map((item) => ({ value: item.value, label: t(item.labelKey) })),
    ],
    [t],
  );
  const issuingUnitOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.unit.all') },
      ...REGULATION_ISSUING_UNITS.map((item) => ({ value: item.value, label: t(item.labelKey) })),
    ],
    [t],
  );
  const statusOptions = useMemo(
    () => REGULATION_STATUS_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) })),
    [t],
  );
  const audienceOptions = useMemo(
    () => REGULATION_AUDIENCE_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) })),
    [t],
  );

  const queryParams = useMemo<RegulationQueryParams>(
    () => ({
      pageIndex: currentPage,
      pageSize: PAGE_SIZE,
      ...(searchKeyword ? { searchTerm: searchKeyword } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(categoryFilter !== 'all' ? { category: categoryFilter as RegulationQueryParams['category'] } : {}),
      ...(unitFilter !== 'all' ? { issuingUnit: unitFilter as RegulationQueryParams['issuingUnit'] } : {}),
      ...(audienceFilter !== 'all' ? { targetAudience: audienceFilter } : {}),
    }),
    [audienceFilter, categoryFilter, currentPage, searchKeyword, statusFilter, unitFilter],
  );

  const {
    data,
    isLoading,
    isFetching,
    error: listError,
  } = useRegulationsList(queryParams);
  const { data: statsData } = useRegulationsStats();
  const createMutation = useCreateRegulation();
  const updateMutation = useUpdateRegulation();
  const deleteMutation = useDeleteRegulation();
  const {
    data: detailData,
    isLoading: isDetailLoading,
    error: detailError,
  } = useRegulationDetail(detailId);

  const regulations = data?.data ?? EMPTY_REGULATIONS;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const totalCount = data?.totalCount ?? regulations.length;

  // Stats calculated from a separate query (not affected by filters)
  const stats = useMemo(() => {
    const source = statsData?.data ?? [];
    return {
      total: statsData?.totalCount ?? 0,
      active: source.filter((item) => item.status === 'active').length,
      draft: source.filter((item) => item.status === 'draft').length,
      archived: source.filter((item) => item.status === 'archived').length,
    };
  }, [statsData]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingRegulation(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (regulation: RegulationRecord) => {
    setFormMode('edit');
    setEditingRegulation(regulation);
    setIsFormOpen(true);
  };

  const handleDownload = async (regulation: RegulationRecord) => {
    // Block spam download
    if (downloadingId === regulation.id) {
      return;
    }

    if (!regulation.fileUrl) {
      toast.error(t('toast.fileMissing'));
      return;
    }

    setDownloadingId(regulation.id);
    const loadingToast = toast.loading(t('toast.downloadLoading'));

    try {
      const defaultFileName = t('common.defaultFileName');
      const response = await fetch(regulation.fileUrl);
      if (!response.ok) {
        throw new Error(t('toast.downloadError'));
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Use provided fileName or extract from URL
      const getFileName = () => {
        if (regulation.fileName) return regulation.fileName;
        try {
          const urlObj = new URL(regulation.fileUrl);
          const pathParts = urlObj.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          // Remove timestamp prefix if exists
          const parts = fileName.split('-');
          if (parts.length > 1 && /^\d+$/.test(parts[0])) {
            return parts.slice(1).join('-');
          }
          return fileName || defaultFileName;
        } catch {
          return defaultFileName;
        }
      };

      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t('toast.downloadSuccess'), { id: loadingToast });
    } catch {
      toast.error(t('toast.downloadError'), { id: loadingToast });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (regulation: RegulationRecord) => {
    setDetailPreview(regulation);
    setDetailId(regulation.id);
  };

  const handleCloseDetail = () => {
    setDetailPreview(null);
    setDetailId(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRegulation(null);
  };

  useEffect(() => {
    if (listError) {
      toast.error(t('loadListError'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listError]);

  useEffect(() => {
    if (detailError) {
      toast.error(t('loadDetailError'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailError]);

  const handleFormSubmit = async (payload: RegulationMutationPayload, file: File | null) => {
    try {
      if (formMode === 'create') {
        await createMutation.mutateAsync({ payload, file });
        toast.success(t('createSuccess'));
      } else if (editingRegulation) {
        await updateMutation.mutateAsync({ id: editingRegulation.id, payload, file });
        toast.success(t('updateSuccess'));
      }
      setIsFormOpen(false);
      setEditingRegulation(null);
    } catch (error) {
      const fallbackMessage = t('toast.saveError');
      const message = error instanceof Error && error.message ? error.message : fallbackMessage;
      toast.error(message);
      throw error;
    }
  };

  const handleDeleteRequest = (regulation: RegulationRecord) => {
    setDeletingRegulation(regulation);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRegulation) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deletingRegulation.id);
      toast.success(t('toast.deleteSuccess'));
      setIsDeleteModalOpen(false);
      setDeletingRegulation(null);
    } catch (error) {
      const fallbackMessage = t('toast.deleteError');
      const message = error instanceof Error && error.message ? error.message : fallbackMessage;
      toast.error(message);
    }
  };

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('pageDescription')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MajorStatCard
            label={t('stats.total')}
            value={stats.total}
            Icon={Layers3}
            bgColor="bg-sky-100/80"
            iconColor="text-sky-700"
          />
          <MajorStatCard
            label={t(REGULATION_STATUS_META.active.labelKey)}
            value={stats.active}
            Icon={ClipboardCheck}
            bgColor="bg-emerald-100/80"
            iconColor="text-emerald-700"
          />
          <MajorStatCard
            label={t(REGULATION_STATUS_META.draft.labelKey)}
            value={stats.draft}
            Icon={FilePenLine}
            bgColor="bg-amber-100/80"
            iconColor="text-amber-700"
          />
          <MajorStatCard
            label={t(REGULATION_STATUS_META.archived.labelKey)}
            value={stats.archived}
            Icon={Archive}
            bgColor="bg-stone-100/80"
            iconColor="text-stone-700"
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-200 p-4 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('list.title')}</h2>
                {isFetching && <p className="text-xs text-gray-500">{t('list.syncing')}</p>}
              </div>
              <Button className="bg-[#0053AD] text-white hover:bg-[#003d82]" onClick={handleOpenCreate} type="button">
                <Plus className="h-4 w-4" />
                {t('actions.add')}
              </Button>
            </div>

            <div className="flex flex-nowrap items-center gap-3 overflow-x-auto">
              <div className="relative min-w-0 flex-1">
                <SearchInput
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={(value) => {
                    setCategoryFilter(value ?? 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.category.placeholder')}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={issuingUnitOptions}
                  value={unitFilter}
                  onChange={(value) => {
                    setUnitFilter(value ?? 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.unit.placeholder')}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter((value ?? 'all') as RegulationStatus | 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.status.placeholder')}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={audienceOptions}
                  value={audienceFilter}
                  onChange={(value) => {
                    setAudienceFilter((value ?? 'all') as RegulationAudience | 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.audience.placeholder')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 px-4 py-6 lg:px-6">
            {listError ? (
              <div className="rounded-2xl border border-dashed border-red-200 p-8 text-center text-red-600">
                {t('list.states.error')}
              </div>
            ) : isLoading ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                {t('list.states.loading')}
              </div>
            ) : regulations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                {t('list.states.empty')}
              </div>
            ) : (
              regulations.map((regulation) => (
                <RegulationListCard
                  key={regulation.id}
                  regulation={regulation}
                  onView={() => handleView(regulation)}
                  onEdit={() => handleOpenEdit(regulation)}
                  onDownload={() => handleDownload(regulation)}
                  onDelete={() => handleDeleteRequest(regulation)}
                />
              ))
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-4 lg:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <RegulationFormModal
        isOpen={isFormOpen}
        mode={formMode}
        initialData={formMode === 'edit' ? editingRegulation : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDeleteRegulationModal
        isOpen={isDeleteModalOpen}
        regulationTitle={deletingRegulation?.title}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <RegulationDetailModal
        open={Boolean(detailPreview)}
        regulation={isDetailLoading ? detailPreview : detailData ?? detailPreview}
        onClose={handleCloseDetail}
        onDownload={handleDownload}
      />
    </>
  );
};

export default AdminRegulationsPage;


