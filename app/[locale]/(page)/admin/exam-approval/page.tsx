'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Button, Checkbox, Table, Pagination } from '@/app/components/ui';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useAdminExamsList, useApproveAdminExam, useRejectAdminExam, useExportAdminExams, useExportAdminExamPdf } from '@/lib/hooks/useAdminExams';
import { AdminExamQueryParams, AdminExamRecord, ExamType, ExamStatus } from '@/lib/types/adminExam';
import { EXAM_STATUS_COLORS, DEFAULT_PAGE_SIZE } from '@/lib/constants/adminExam';
import { formatDate } from '@/lib/utils/format';
import { ExamDetailModal } from './components/ExamDetailModal';
import { RejectExamModal } from './components/RejectExamModal';
import { ExamFilters } from './components/ExamFilters';
import { ExamActionsMenu } from './components/ExamActionsMenu';
import { BulkApproveModal } from './components/BulkApproveModal';
import { BulkRejectModal } from './components/BulkRejectModal';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { CircleCheck, CheckCircle2, XCircle, X } from 'lucide-react';

const EMPTY_EXAMS: AdminExamRecord[] = [];

export default function ExamApprovalPage() {
  const t = useTranslations('admin.examApproval');
  const pageTitle = t('pageTitle');
  usePageTitle(pageTitle);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [examTypeFilter, setExamTypeFilter] = useState<ExamType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ExamStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectModalData, setRejectModalData] = useState<{ title: string; type: string } | null>(null);
  const [isBulkApproveModalOpen, setIsBulkApproveModalOpen] = useState(false);
  const [isBulkRejectModalOpen, setIsBulkRejectModalOpen] = useState(false);

  const queryParams = useMemo<AdminExamQueryParams>(
    () => ({
      page: currentPage,
      pageSize: DEFAULT_PAGE_SIZE,
      sortBy: 'createdAt',
      sortDir: 'desc',
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(semesterFilter !== 'all' ? { semesterId: semesterFilter } : {}),
      ...(examTypeFilter !== 'all' ? { examType: examTypeFilter } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    }),
    [debouncedSearch, semesterFilter, examTypeFilter, statusFilter, currentPage],
  );

  const approveMutation = useApproveAdminExam();
  const rejectMutation = useRejectAdminExam();
  const exportMutation = useExportAdminExams();
  const exportPdfMutation = useExportAdminExamPdf();

  const {
    data: response,
    isLoading,
    isFetching,
    error: listError,
  } = useAdminExamsList(queryParams);

  const exams = response?.data?.data ?? EMPTY_EXAMS;
  const paging = response?.data?.paging;
  const totalPages = paging?.totalPages ?? 1;
  const totalCount = paging?.totalItems ?? 0;

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (listError) {
      toast.error(t('loadListError'));
    }
  }, [listError, t]);

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleViewDetail = (exam: AdminExamRecord) => {
    setDetailModalId(exam.id);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync({ id, data: {} });
      toast.success(t('approveSuccess'));
      setDetailModalId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('approveError');
      toast.error(message);
    }
  };

  const handleReject = (exam: AdminExamRecord) => {
    setRejectModalId(exam.id);
    const examTypeLabel = t(`filters.examType.${exam.examType}`) || exam.examType;
    setRejectModalData({
      title: exam.subjectName,
      type: examTypeLabel,
    });
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectModalId) return;

    try {
      await rejectMutation.mutateAsync({ id: rejectModalId, data: { reason } });
      toast.success(t('rejectSuccess'));
      setRejectModalId(null);
      setRejectModalData(null);
      setDetailModalId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('rejectError');
      toast.error(message);
    }
  };

  const handleExportExcel = async () => {
    try {
      const result = await exportMutation.mutateAsync(queryParams);
      
      if (result && typeof result === 'object' && 'success' in result) {
        toast.error((result as { message: string }).message || t('exportNoData'));
        return;
      }

      const blob = result as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam_list_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t('exportSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('exportError');
      toast.error(message);
    }
  };

  const handleDownloadPdf = async (id: string, type: 'exam' | 'answer') => {
    try {
      const blob = await exportPdfMutation.mutateAsync({ id, type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam_${id}_${type}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t('downloadPdfSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('downloadPdfError');
      toast.error(message);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;

    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => approveMutation.mutateAsync({ id, data: {} })));
      toast.success(t('approveSuccess'));
      setSelectedIds(new Set());
      setIsBulkApproveModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('approveError');
      toast.error(message);
    }
  };

  const handleBulkReject = async (reason: string) => {
    if (selectedIds.size === 0) return;

    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => rejectMutation.mutateAsync({ id, data: { reason } })));
      toast.success(t('rejectSuccess'));
      setSelectedIds(new Set());
      setIsBulkRejectModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('rejectError');
      toast.error(message);
    }
  };

  const tableColumns = [
    { key: 'checkbox', label: '', className: 'w-12' },
    { key: 'courseClass', label: t('table.class') },
    { key: 'subject', label: t('table.subject') },
    { key: 'instructor', label: t('table.instructor') },
    { key: 'examType', label: t('table.examType') },
    { key: 'submissionDate', label: t('table.submissionDate') },
    { key: 'semester', label: t('table.semester') },
    { key: 'status', label: t('table.status') },
    { key: 'actions', label: t('table.actions'), className: 'w-20' },
  ];

  const renderStatusBadge = (exam: AdminExamRecord) => {
    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
          EXAM_STATUS_COLORS[exam.status] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {exam.status === 'approved'
          ? t('status.approved')
          : exam.status === 'rejected'
            ? t('status.rejected')
            : t('status.pending')}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('pageDescription')}</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-200 p-4 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('list.title')}</h2>
                {isFetching && <p className="text-xs text-gray-500">{t('list.syncing')}</p>}
              </div>
              <Button
                className="bg-[#0053AD] text-white hover:bg-[#003d82]"
                onClick={handleExportExcel}
                disabled={exportMutation.isPending}
                type="button"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('exportExcel')}
              </Button>
            </div>

            <ExamFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              semesterFilter={semesterFilter}
              onSemesterChange={(value) => {
                setSemesterFilter(value);
                setCurrentPage(1);
              }}
              examTypeFilter={examTypeFilter}
              onExamTypeChange={(value) => {
                setExamTypeFilter(value);
                setCurrentPage(1);
              }}
              statusFilter={statusFilter}
              onStatusChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            />

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                  <span className="text-sm font-medium text-[#0053AD]">
                    {t('bulkActions.selected', { count: selectedIds.size })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkApproveModalOpen(true)}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t('bulkActions.approve')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkRejectModalOpen(true)}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('bulkActions.reject')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    {t('bulkActions.clearSelection')}
                  </Button>
                </div>
              </div>
            )}
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
            ) : exams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                {t('list.states.empty')}
              </div>
            ) : (
              <Table
                columns={tableColumns}
                data={exams}
                renderRow={(exam: AdminExamRecord) => (
                  <>
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedIds.has(exam.id)}
                        onCheckedChange={(checked) => handleSelectOne(exam.id, checked as boolean)}
                        onClick={(event: MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{exam.courseClassCode}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{exam.subjectName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{exam.instructorName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {t(`filters.examType.${exam.examType}`) || exam.examType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {exam.submissionDate ? formatDate(exam.submissionDate) : t('common.na')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{exam.semesterName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(exam)}
                    </td>
                    <td className="px-6 py-4">
                      <ExamActionsMenu
                        status={exam.status}
                        onView={() => handleViewDetail(exam)}
                        onApprove={
                          exam.status === 'pending' ? () => handleApprove(exam.id) : undefined
                        }
                        onReject={exam.status === 'pending' ? () => handleReject(exam) : undefined}
                        onDownloadPdf={(type) => handleDownloadPdf(exam.id, type)}
                      />
                    </td>
                  </>
                )}
                isLoading={isLoading}
                loadingMessage={t('list.states.loading')}
                emptyMessage={t('list.states.empty')}
              />
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-4 lg:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={DEFAULT_PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <ExamDetailModal
        examId={detailModalId}
        isOpen={Boolean(detailModalId)}
        onClose={() => setDetailModalId(null)}
        onApprove={handleApprove}
        onReject={(id) => {
          const matchingExam = exams.find((examRecord) => examRecord.id === id);
          if (matchingExam) handleReject(matchingExam);
        }}
        onDownloadPdf={handleDownloadPdf}
      />

      {rejectModalId && rejectModalData && (
        <RejectExamModal
          isOpen={Boolean(rejectModalId)}
          examTitle={rejectModalData.title}
          examType={rejectModalData.type}
          onClose={() => {
            setRejectModalId(null);
            setRejectModalData(null);
          }}
          onConfirm={handleConfirmReject}
        />
      )}

      <BulkApproveModal
        isOpen={isBulkApproveModalOpen}
        onClose={() => setIsBulkApproveModalOpen(false)}
        onConfirm={handleBulkApprove}
        selectedCount={selectedIds.size}
        isApproving={approveMutation.isPending}
      />

      <BulkRejectModal
        isOpen={isBulkRejectModalOpen}
        onClose={() => setIsBulkRejectModalOpen(false)}
        onConfirm={handleBulkReject}
        selectedCount={selectedIds.size}
        isRejecting={rejectMutation.isPending}
      />
    </>
  );
}
