'use client';

import { useEffect, useMemo, useState } from 'react';
import { Archive, ClipboardCheck, FilePenLine, Layers3, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button, Dropdown, Pagination, SearchInput } from '@/app/components/ui';
import { MajorStatCard } from '@/app/(page)/admin/major-management/components/MajorStatCard';
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
  usePageTitle('Quản lý Quy chế / Quy định');

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

  // Stats từ query riêng (không bị ảnh hưởng bởi filter)
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
      toast.error('Không tìm thấy tệp để tải xuống');
      return;
    }

    setDownloadingId(regulation.id);
    const loadingToast = toast.loading('Đang tải xuống tệp...');

    try {
      const response = await fetch(regulation.fileUrl);
      if (!response.ok) {
        throw new Error('Không thể tải file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Lấy tên file từ fileName hoặc extract từ URL
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
          return fileName || 'regulation-document';
        } catch {
          return 'regulation-document';
        }
      };

      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải xuống tệp thành công', { id: loadingToast });
    } catch {
      toast.error('Không thể tải xuống tệp. Vui lòng thử lại.', { id: loadingToast });
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
      toast.error('Không thể tải danh sách quy chế');
    }
  }, [listError]);

  useEffect(() => {
    if (detailError) {
      toast.error('Không thể tải chi tiết quy chế');
    }
  }, [detailError]);

  const handleFormSubmit = async (payload: RegulationMutationPayload, file: File | null) => {
    try {
      if (formMode === 'create') {
        await createMutation.mutateAsync({ payload, file });
        toast.success('Đã tạo quy chế');
      } else if (editingRegulation) {
        await updateMutation.mutateAsync({ id: editingRegulation.id, payload, file });
        toast.success('Đã cập nhật quy chế');
      }
      setIsFormOpen(false);
      setEditingRegulation(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu quy chế';
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
      toast.success('Đã xóa quy chế');
      setIsDeleteModalOpen(false);
      setDeletingRegulation(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa quy chế';
      toast.error(message);
    }
  };

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Quy chế / Quy định</h1>
          <p className="mt-1 text-sm text-gray-600">Quản lý thông tin của các quy chế/quy định của trường</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MajorStatCard label="Tổng số quy chế" value={stats.total} Icon={Layers3} bgColor="bg-sky-100/80" iconColor="text-sky-700" />
          <MajorStatCard
            label={REGULATION_STATUS_META.active.label}
            value={stats.active}
            Icon={ClipboardCheck}
            bgColor="bg-emerald-100/80"
            iconColor="text-emerald-700"
          />
          <MajorStatCard
            label={REGULATION_STATUS_META.draft.label}
            value={stats.draft}
            Icon={FilePenLine}
            bgColor="bg-amber-100/80"
            iconColor="text-amber-700"
          />
          <MajorStatCard
            label={REGULATION_STATUS_META.archived.label}
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
                <h2 className="text-lg font-semibold text-gray-900">Danh sách Quy chế / Quy định</h2>
                {isFetching && <p className="text-xs text-gray-500">Đang đồng bộ dữ liệu...</p>}
              </div>
              <Button className="bg-[#0053AD] text-white hover:bg-[#003d82]" onClick={handleOpenCreate} type="button">
                <Plus className="h-4 w-4" />
                Thêm mới
              </Button>
            </div>

            <div className="flex flex-nowrap items-center gap-3 overflow-x-auto">
              <div className="relative min-w-0 flex-1">
                <SearchInput
                  placeholder="Tìm theo mã, tiêu đề, mô tả..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={[{ value: 'all', label: 'Tất cả loại' }, ...REGULATION_CATEGORIES.map((item) => ({ value: item.value, label: item.label }))]}
                  value={categoryFilter}
                  onChange={(value) => {
                    setCategoryFilter(value ?? 'all');
                    setCurrentPage(1);
                  }}
                  placeholder="Loại quy định"
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={[{ value: 'all', label: 'Tất cả đơn vị' }, ...REGULATION_ISSUING_UNITS.map((item) => ({ value: item.value, label: item.label }))]}
                  value={unitFilter}
                  onChange={(value) => {
                    setUnitFilter(value ?? 'all');
                    setCurrentPage(1);
                  }}
                  placeholder="Đơn vị ban hành"
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={REGULATION_STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter((value ?? 'all') as RegulationStatus | 'all');
                    setCurrentPage(1);
                  }}
                  placeholder="Trạng thái"
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={REGULATION_AUDIENCE_OPTIONS}
                  value={audienceFilter}
                  onChange={(value) => {
                    setAudienceFilter((value ?? 'all') as RegulationAudience | 'all');
                    setCurrentPage(1);
                  }}
                  placeholder="Đối tượng áp dụng"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 px-4 py-6 lg:px-6">
            {listError ? (
              <div className="rounded-2xl border border-dashed border-red-200 p-8 text-center text-red-600">
                Không thể tải danh sách quy chế. Vui lòng thử lại sau.
              </div>
            ) : isLoading ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                Đang tải danh sách quy chế...
              </div>
            ) : regulations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                Không tìm thấy quy chế phù hợp với bộ lọc.
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


