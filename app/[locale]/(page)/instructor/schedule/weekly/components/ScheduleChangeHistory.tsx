"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Trash2, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { Dropdown, SearchInput, ConfirmDialog } from "@/app/components/ui"
import { Table, TableColumn } from "@/app/components/ui/table"
import { useScheduleChangeRequests, useDeleteScheduleChangeRequest } from "../lib/hooks/useScheduleChange"
import { ScheduleChangeDetailModal } from "./ScheduleChangeDetailModal"
import toast from "react-hot-toast"
import type { AdminScheduleChangeRequestDto } from "../lib/types/scheduleChange.types"

interface ScheduleChangeHistoryProps {
  semesterId: string | null
  selectedWeek?: number | null
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

const getStatusConfig = (t: (key: string) => string) => ({
  pending: {
    label: t('history.pending'),
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: Clock,
  },
  approved: {
    label: t('history.approved'),
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: CheckCircle,
  },
  rejected: {
    label: t('history.rejected'),
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
});

const getStatusOptions = (t: (key: string) => string) => [
  { value: 'all', label: t('history.all') },
  { value: 'pending', label: t('history.pending') },
  { value: 'approved', label: t('history.approved') },
  { value: 'rejected', label: t('history.rejected') },
];

export function ScheduleChangeHistory({ semesterId, selectedWeek }: ScheduleChangeHistoryProps) {
  const t = useTranslations('instructor.schedule.weekly');
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingItem, setViewingItem] = useState<AdminScheduleChangeRequestDto | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AdminScheduleChangeRequestDto | null>(null)

  // Fetch requests based on filterStatus (backend doesn't support semesterId filter)
  const { data: scheduleChangeRequests = [], isLoading, error, refetch } = useScheduleChangeRequests(filterStatus)
  const deleteRequest = useDeleteScheduleChangeRequest()

  const filteredData = useMemo(() => {
    let filtered = scheduleChangeRequests

    // Filter by week (local filter)
    if (selectedWeek) {
      filtered = filtered.filter(
        change => change.cancelledWeek === selectedWeek || change.makeupWeek === selectedWeek
      )
    }

    // Search filter (local filter)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        change => 
          change.subjectCode.toLowerCase().includes(query) ||
          change.subjectName.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [scheduleChangeRequests, selectedWeek, searchQuery])

  const handleView = (item: AdminScheduleChangeRequestDto) => {
    setViewingItem(item)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setViewingItem(null)
  }

  const handleDeleteClick = (change: AdminScheduleChangeRequestDto) => {
    setDeleteConfirmId(change.scheduleChangeRequestId)
    setDeleteConfirmItem(change)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return

    setDeletingId(deleteConfirmId)
    try {
      await deleteRequest.mutateAsync(deleteConfirmId)
      toast.success(t('history.delete.success'))
      await refetch()
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = apiError?.response?.data?.message || apiError?.message || t('history.delete.error')
      toast.error(errorMessage)
    } finally {
      setDeletingId(null)
      setDeleteConfirmId(null)
      setDeleteConfirmItem(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null)
    setDeleteConfirmItem(null)
  }

  const STATUS_CONFIG = getStatusConfig(t);
  const STATUS_OPTIONS = getStatusOptions(t);

  const renderStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    )
  }

  const columns: TableColumn[] = [
    { key: 'createdAt', label: t('history.columns.createdAt'), align: 'left' },
    { key: 'subjectCode', label: t('history.columns.subjectCode'), align: 'left' },
    { key: 'subjectName', label: t('history.columns.subjectName'), align: 'left' },
    { key: 'cancelledWeek', label: t('history.columns.cancelledWeek'), align: 'center' },
    { key: 'status', label: t('history.columns.status'), align: 'center' },
    { key: 'actions', label: t('history.columns.actions'), align: 'center' },
  ]

  const renderRow = (change: AdminScheduleChangeRequestDto) => (
    <>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {format(parseISO(change.createdAt), 'dd/MM/yyyy', { locale: vi })}
        </div>
        <div className="text-xs text-gray-500">
          {format(parseISO(change.createdAt), 'HH:mm', { locale: vi })}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{change.subjectCode}</div>
      </td>
      <td className="px-6 py-4 max-w-[250px]">
        <div className="text-sm text-gray-900 line-clamp-2 overflow-hidden" title={change.subjectName}>{change.subjectName}</div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-medium text-gray-900">{t('changeRequest.week')} {change.cancelledWeek}</span>
      </td>
      <td className="px-6 py-4 text-center">
        {renderStatusBadge(change.status)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleView(change)}
            className="p-2 rounded-md cursor-pointer text-[#4E8EE1] hover:text-[#4E8EE1]/80 hover:bg-[#4E8EE1]/10 transition-colors"
            title={t('history.viewDetail')}
            aria-label={t('history.viewDetail')}
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {change.status === 'pending' && (
            <button
              onClick={() => handleDeleteClick(change)}
              disabled={deletingId === change.scheduleChangeRequestId}
              className="p-2 rounded-md cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('history.deleteRequest')}
              aria-label={t('history.deleteRequest')}
            >
              {deletingId === change.scheduleChangeRequestId ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </td>
    </>
  )

  if (!semesterId) return null

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{t('history.title')}</h2>
      </div>

      {/* Toolbar */}
      <div className="px-4 lg:px-6 pt-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('history.searchPlaceholder')}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Dropdown
              options={STATUS_OPTIONS}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as FilterStatus)}
              placeholder={t('history.filterStatus')}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div>
        <div className="p-4 lg:p-6">
          <Table
            columns={columns}
            data={filteredData}
            renderRow={renderRow}
            isLoading={isLoading}
            loadingMessage={t('history.loading')}
            emptyMessage={
              searchQuery
                ? t('history.empty.noResults', { query: searchQuery })
                : selectedWeek
                ? t('history.empty.noRequestsForWeek', { week: selectedWeek })
                : t('history.empty.noRequests')
            }
          />

          {error && (
            <div className="text-center py-4 text-red-600 mt-4">
              {t('history.error')}
            </div>
          )}
        </div>
      </div>

      <ScheduleChangeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        data={viewingItem}
      />

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t('history.delete.confirmTitle')}
        description={
          deleteConfirmItem
            ? t('history.delete.confirmDescription', { subjectName: deleteConfirmItem.subjectName, subjectCode: deleteConfirmItem.subjectCode })
            : t('history.delete.confirmDescriptionGeneric')
        }
        confirmText={t('history.delete.confirm')}
        cancelText={t('history.delete.cancel')}
        variant="danger"
        isLoading={deletingId === deleteConfirmId}
      />
    </div>
  )
}
