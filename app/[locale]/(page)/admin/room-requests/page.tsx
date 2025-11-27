'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { Button, Dropdown, Pagination, SearchInput, Table, Checkbox } from '@/app/components/ui';
import 'react-day-picker/dist/style.css';
import { MajorStatCard } from './components/MajorStatCard';
import { ROOM_REQUEST_STATUS_META, ROOM_REQUEST_STATUS_OPTIONS } from '@/lib/constants/room-request';
import { ROOM_TYPE_LABELS } from '@/lib/types/room';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import {
  useRoomRequestsList,
  useRoomRequestStats,
  useRoomRequestDetail,
  useApproveRoomRequest,
  useRejectRoomRequest,
  useCancelRoomRequest,
  useBulkApproveRoomRequests,
  useBulkRejectRoomRequests,
} from '@/lib/hooks/useRoomRequests';
import type { RoomRequestQueryParams, RoomRequestRecord, RoomRequestStatus } from '@/lib/types/room-request';
import { formatDate } from '@/lib/utils/format';
import { RoomRequestDetailModal } from './components/RoomRequestDetailModal';
import { ApproveRoomRequestModal } from './components/ApproveRoomRequestModal';
import { RejectRoomRequestModal } from './components/RejectRoomRequestModal';
import { CancelRoomRequestModal } from './components/CancelRoomRequestModal';
import { BulkApproveRoomRequestsModal } from './components/BulkApproveRoomRequestsModal';
import { BulkRejectRoomRequestsModal } from './components/BulkRejectRoomRequestsModal';
import { RoomRequestActionsMenu } from './components/RoomRequestActionsMenu';
import { commonApi } from '@/lib/api/common';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';

const PAGE_SIZE = 20;
const EMPTY_REQUESTS: RoomRequestRecord[] = [];

export default function RoomRequestsPage() {
  const t = useTranslations('admin.roomRequests');
  const locale = useLocale();
  const pageTitle = t('pageTitle');
  usePageTitle(pageTitle);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomRequestStatus | 'all'>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [usageDateFilter, setUsageDateFilter] = useState<string>('');
  const [usageDate, setUsageDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateLocale = locale === 'vi' ? vi : enUS;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal states
  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  const [approveModalRequest, setApproveModalRequest] = useState<RoomRequestRecord | null>(null);
  const [rejectModalRequest, setRejectModalRequest] = useState<RoomRequestRecord | null>(null);
  const [cancelModalRequest, setCancelModalRequest] = useState<RoomRequestRecord | null>(null);
  const [bulkApproveModalOpen, setBulkApproveModalOpen] = useState(false);
  const [bulkRejectModalOpen, setBulkRejectModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (datePickerRef.current && !datePickerRef.current.contains(target)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // Get buildings for filter
  const { data: buildingsData } = useQuery({
    queryKey: queryKeys.common.buildings(),
    queryFn: async () => {
      const response = await commonApi.getBuildings();
      return response.data ?? [];
    },
    staleTime: 300_000,
  });

  const buildingOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.building.all') },
      ...(buildingsData?.map((b) => ({ value: b.buildingCode, label: b.buildingName })) || []),
    ],
    [buildingsData, t],
  );

  const roomTypeOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.roomType.all') },
      ...Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => ({ value, label })),
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => ROOM_REQUEST_STATUS_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) })),
    [t],
  );

  const queryParams = useMemo<RoomRequestQueryParams>(
    () => ({
      pageIndex: currentPage,
      pageSize: PAGE_SIZE,
      ...(searchKeyword ? { searchTerm: searchKeyword } : {}),
      ...(statusFilter !== 'all' ? { bookingStatus: statusFilter } : {}),
      ...(roomTypeFilter !== 'all' ? { roomType: roomTypeFilter } : {}),
      ...(buildingFilter !== 'all' ? { buildingCode: buildingFilter } : {}),
      ...(usageDateFilter ? { bookingDateFrom: usageDateFilter } : {}),
    }),
    [buildingFilter, currentPage, roomTypeFilter, searchKeyword, statusFilter, usageDateFilter],
  );

  const {
    data,
    isLoading,
    isFetching,
    error: listError,
  } = useRoomRequestsList(queryParams);
  const { data: statsData } = useRoomRequestStats();
  const { data: detailData, isLoading: isDetailLoading } = useRoomRequestDetail(detailModalId);
  const approveMutation = useApproveRoomRequest();
  const rejectMutation = useRejectRoomRequest();
  const cancelMutation = useCancelRoomRequest();
  const bulkApproveMutation = useBulkApproveRoomRequests();
  const bulkRejectMutation = useBulkRejectRoomRequests();

  const requests = data?.items ?? EMPTY_REQUESTS;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const totalCount = data?.totalCount ?? requests.length;

  const stats = useMemo(() => {
    return {
      total: statsData?.total ?? 0,
      pending: statsData?.pending ?? 0,
      confirmed: statsData?.confirmed ?? 0,
      rejected: statsData?.rejected ?? 0,
    };
  }, [statsData]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const selectedRequests = useMemo(
    () => requests.filter((r) => selectedIds.has(r.bookingId)),
    [requests, selectedIds],
  );

  const handleView = (request: RoomRequestRecord) => {
    setDetailModalId(request.bookingId);
  };

  const handleApprove = (request: RoomRequestRecord) => {
    setApproveModalRequest(request);
  };

  const handleReject = (request: RoomRequestRecord) => {
    setRejectModalRequest(request);
  };

  const handleCancel = (request: RoomRequestRecord) => {
    setCancelModalRequest(request);
  };

  const handleConfirmApprove = async (note?: string) => {
    if (!approveModalRequest) return;
    try {
      await approveMutation.mutateAsync({ id: approveModalRequest.bookingId, payload: { note } });
      setApproveModalRequest(null);
      setSelectedIds(new Set());
    } catch {
      // Error handled by hook
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectModalRequest) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectModalRequest.bookingId, payload: { reason } });
      setRejectModalRequest(null);
      setSelectedIds(new Set());
    } catch {
      // Error handled by hook
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelModalRequest) return;
    try {
      await cancelMutation.mutateAsync({ id: cancelModalRequest.bookingId, payload: { reason } });
      setCancelModalRequest(null);
      setSelectedIds(new Set());
    } catch {
      // Error handled by hook
    }
  };

  const handleBulkApprove = () => {
    if (selectedRequests.length === 0) return;
    setBulkApproveModalOpen(true);
  };

  const handleBulkReject = () => {
    if (selectedRequests.length === 0) return;
    setBulkRejectModalOpen(true);
  };

  const handleConfirmBulkApprove = async (note?: string) => {
    try {
      await bulkApproveMutation.mutateAsync({
        bookingIds: selectedRequests.map((r) => r.bookingId),
        note,
      });
      setBulkApproveModalOpen(false);
      setSelectedIds(new Set());
    } catch {
      // Error handled by hook
    }
  };

  const handleConfirmBulkReject = async (reason: string) => {
    try {
      await bulkRejectMutation.mutateAsync({
        bookingIds: selectedRequests.map((r) => r.bookingId),
        reason,
      });
      setBulkRejectModalOpen(false);
      setSelectedIds(new Set());
    } catch {
      // Error handled by hook
    }
  };

  const isAllSelected = requests.length > 0 && selectedIds.size === requests.length;
  const isIndeterminate = selectedIds.size > 0 && !isAllSelected;

  const handleToggleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(requests.map((r) => r.bookingId)));
    } else {
      setSelectedIds(new Set());
    }
  }, [requests]);

  const tableColumns = useMemo(
    () => [
      {
        key: 'checkbox',
        label: (
          <Checkbox
            checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
            onCheckedChange={(checked) => handleToggleSelectAll(checked === true)}
            aria-label={t('list.columns.selectAll')}
          />
        ),
        className: 'w-12 text-center',
        headerClassName: 'text-center',
      },
      { key: 'code', label: t('list.columns.code') },
      { key: 'room', label: t('list.columns.room') },
      { key: 'student', label: t('list.columns.student') },
      { key: 'usageDate', label: t('list.columns.usageDate') },
      { key: 'registrationDate', label: t('list.columns.registrationDate') },
      { key: 'status', label: t('list.columns.status') },
      { key: 'action', label: t('list.columns.action'), className: 'w-20' },
    ],
    [handleToggleSelectAll, isAllSelected, isIndeterminate, t],
  );

  const renderRow = (request: RoomRequestRecord) => {
    const statusMeta = ROOM_REQUEST_STATUS_META[request.bookingStatus];
    const isSelected = selectedIds.has(request.bookingId);

    return (
      <>
        <td className="px-6 py-4">
          <div className="flex justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => handleSelectOne(request.bookingId, checked === true)}
            />
          </div>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          {request.bookingCode || request.bookingId.substring(0, 8).toUpperCase()}
        </td>
        <td className="px-6 py-4 text-sm text-gray-700">
          {request.roomCode} - {request.roomName}
        </td>
        <td className="px-6 py-4 text-sm text-gray-700">
          {request.bookedByUser.fullName} - {request.bookedByUser.studentCode || 'N/A'}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {formatDate(request.bookingDate)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {formatDate(request.createdAt)}
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
              statusMeta?.badgeClass || 'bg-gray-100 text-gray-700'
            }`}
          >
            {statusMeta ? t(statusMeta.labelKey) : request.bookingStatus}
          </span>
        </td>
        <td className="px-6 py-4">
          <RoomRequestActionsMenu
            request={request}
            onView={() => handleView(request)}
            onApprove={request.bookingStatus === 'pending' ? () => handleApprove(request) : undefined}
            onReject={request.bookingStatus === 'pending' ? () => handleReject(request) : undefined}
            onCancel={request.bookingStatus === 'confirmed' ? () => handleCancel(request) : undefined}
          />
        </td>
      </>
    );
  };

  const hasSelected = selectedIds.size > 0;

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
            Icon={FileText}
            bgColor="bg-sky-100/80"
            iconColor="text-sky-700"
          />
          <MajorStatCard
            label={t('stats.pending')}
            value={stats.pending}
            Icon={Clock}
            bgColor="bg-yellow-100/80"
            iconColor="text-yellow-700"
          />
          <MajorStatCard
            label={t('stats.confirmed')}
            value={stats.confirmed}
            Icon={CheckCircle}
            bgColor="bg-green-100/80"
            iconColor="text-green-700"
          />
          <MajorStatCard
            label={t('stats.rejected')}
            value={stats.rejected}
            Icon={XCircle}
            bgColor="bg-red-100/80"
            iconColor="text-red-700"
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-200 p-4 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('list.title')}</h2>
                {isFetching && <p className="text-xs text-gray-500">{t('list.syncing')}</p>}
              </div>
              {hasSelected && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBulkApprove}
                    type="button"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    {t('bulkActions.approve')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBulkReject}
                    type="button"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    {t('bulkActions.reject')}
                  </Button>
                </div>
              )}
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
                  options={buildingOptions}
                  value={buildingFilter}
                  onChange={(value) => {
                    setBuildingFilter(value ?? 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.building.placeholder')}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={roomTypeOptions}
                  value={roomTypeFilter}
                  onChange={(value) => {
                    setRoomTypeFilter(value ?? 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.roomType.placeholder')}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter((value ?? 'all') as RoomRequestStatus | 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.status.placeholder')}
                />
              </div>
              <div className="flex-shrink-0 w-48 relative">
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={usageDate ? format(usageDate, 'dd/MM/yyyy', { locale: dateLocale }) : ''}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    onFocus={() => setShowDatePicker(true)}
                    placeholder={t('filters.usageDate')}
                    className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                </div>
                {showDatePicker && (
                  <div
                    ref={datePickerRef}
                    className="absolute z-10 mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                  >
                    <DayPicker
                      mode="single"
                      selected={usageDate}
                      onSelect={(date) => {
                        setUsageDate(date);
                        setUsageDateFilter(date ? format(date, 'yyyy-MM-dd') : '');
                        setShowDatePicker(false);
                        setCurrentPage(1);
                      }}
                      locale={dateLocale}
                      classNames={{
                        day_selected: 'bg-[#4E8EE1] text-white',
                        day_today: 'bg-[#4E8EE1]/20 text-[#4E8EE1] font-semibold',
                      }}
                    />
                    <div className="flex gap-2 mt-2 pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setUsageDate(undefined);
                          setUsageDateFilter('');
                          setShowDatePicker(false);
                          setCurrentPage(1);
                        }}
                        className="flex-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        {t('filters.clearDate', { defaultValue: 'Xóa' })}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-6 lg:px-6">
            {listError ? (
              <div className="rounded-2xl border border-dashed border-red-200 p-8 text-center text-red-600">
                {t('list.states.error')}
              </div>
            ) : isLoading ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                {t('list.states.loading')}
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                {t('list.states.empty')}
              </div>
            ) : (
              <Table
                columns={tableColumns}
                data={requests}
                renderRow={renderRow}
                isLoading={isLoading}
                emptyMessage={t('list.states.empty')}
              />
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

      <RoomRequestDetailModal
        open={Boolean(detailModalId)}
        request={isDetailLoading ? null : detailData ?? requests.find((r) => r.bookingId === detailModalId) ?? null}
        onClose={() => setDetailModalId(null)}
        onApprove={
          detailData?.bookingStatus === 'pending'
            ? () => {
                if (detailData) handleApprove(detailData);
                setDetailModalId(null);
              }
            : undefined
        }
        onReject={
          detailData?.bookingStatus === 'pending'
            ? () => {
                if (detailData) handleReject(detailData);
                setDetailModalId(null);
              }
            : undefined
        }
      />

      <ApproveRoomRequestModal
        isOpen={Boolean(approveModalRequest)}
        request={approveModalRequest}
        onClose={() => setApproveModalRequest(null)}
        onConfirm={handleConfirmApprove}
      />

      <RejectRoomRequestModal
        isOpen={Boolean(rejectModalRequest)}
        request={rejectModalRequest}
        onClose={() => setRejectModalRequest(null)}
        onConfirm={handleConfirmReject}
      />

      <CancelRoomRequestModal
        isOpen={Boolean(cancelModalRequest)}
        request={cancelModalRequest}
        onClose={() => setCancelModalRequest(null)}
        onConfirm={handleConfirmCancel}
      />

      <BulkApproveRoomRequestsModal
        isOpen={bulkApproveModalOpen}
        requests={selectedRequests}
        onClose={() => setBulkApproveModalOpen(false)}
        onConfirm={handleConfirmBulkApprove}
      />

      <BulkRejectRoomRequestsModal
        isOpen={bulkRejectModalOpen}
        requests={selectedRequests}
        onClose={() => setBulkRejectModalOpen(false)}
        onConfirm={handleConfirmBulkReject}
      />
    </>
  );
}