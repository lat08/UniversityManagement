'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Download, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { useAdminExamDetail } from '@/lib/hooks/useAdminExams';
import { EXAM_STATUS_COLORS } from '@/lib/constants/adminExam';
import { formatDate } from '@/lib/utils/format';
import toast from 'react-hot-toast';

interface ExamDetailModalProps {
  readonly examId: string | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onApprove?: (id: string) => void;
  readonly onReject?: (id: string) => void;
  readonly onDownloadPdf?: (id: string, type: 'exam' | 'answer') => void;
}

export const ExamDetailModal = ({
  examId,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDownloadPdf,
}: ExamDetailModalProps) => {
  const t = useTranslations('admin.examApproval.detailModal');
  const tFilters = useTranslations('admin.examApproval.filters');
  
  const { data: response, isLoading, error } = useAdminExamDetail(examId);
  const examDetail = response?.data;

  const handleDownload = (fileUrl: string, fileName?: string) => {
    if (!fileUrl) {
      toast.error(t('fileNotFound'));
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || fileUrl.split('/').pop() || 'file';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('downloadSuccess'));
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string })?.message || t('downloadError');
      toast.error(errorMessage);
    }
  };

  const handleDownloadPdf = (type: 'exam' | 'answer') => {
    if (!examId || !onDownloadPdf) return;
    onDownloadPdf(examId, type);
  };

  const statusLabel = useMemo(() => {
    if (!examDetail) return '';
    const status = examDetail.status;
    if (status === 'approved') return t('status.approved');
    if (status === 'pending') return t('status.pending');
    if (status === 'rejected') return t('status.rejected');
    return status;
  }, [examDetail, t]);

  const examTypeLabel = useMemo(() => {
    if (!examDetail) return '';
    return tFilters(`examType.${examDetail.examType}`) || examDetail.examType;
  }, [examDetail, tFilters]);

  if (!isOpen || !examId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto [&>button[data-radix-dialog-close]:not(.custom-close)]:hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {t('title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {t('description')}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('close')}
              className="custom-close p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="py-8 text-center">
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        )}

        {error && (
          <div className="py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{t('error')}</p>
            </div>
          </div>
        )}

        {examDetail && !isLoading && (
          <div className="space-y-6">
            {/* TRẠNG THÁI HIỆN TẠI */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <p className="text-gray-500">{t('currentStatus')}</p>
                <p className="text-gray-900 mt-0.5">
                  {t('subjectCode')}: <span className="font-semibold">{examDetail.subjectCode || examDetail.courseClassCode}</span>
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  EXAM_STATUS_COLORS[examDetail.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {statusLabel}
              </span>
            </div>

            {/* THÔNG TIN ĐỀ THI */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t('examInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">{t('subject')}</label>
                  <input
                    type="text"
                    readOnly
                    value={examDetail.subjectName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">{t('courseClass')}</label>
                  <input
                    type="text"
                    readOnly
                    value={`${examDetail.courseClassCode} - ${examDetail.courseClassName || ''}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">{t('semester')}</label>
                  <input
                    type="text"
                    readOnly
                    value={examDetail.semesterName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">{t('examType')}</label>
                  <input
                    type="text"
                    readOnly
                    value={examTypeLabel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">{t('duration')}</label>
                  <input
                    type="text"
                    readOnly
                    value={`${examDetail.durationMinutes || 0} ${t('minutes')}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">{t('entryCode')}</label>
                  <input
                    type="text"
                    readOnly
                    value={examDetail.entryCode || t('common.na')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* CÁC TỆP ĐỀ THI */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t('files')}
              </h3>
              <div className="space-y-2">
                {examDetail.questionFilePath && (
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {examDetail.questionFilePath?.split('/').pop() || t('defaultQuestionFileName')}
                        </p>
                        <p className="text-xs text-gray-500">{t('uploaded')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {onDownloadPdf && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPdf('exam')}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {t('downloadPdf')}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(
                          examDetail.questionFilePath!,
                          examDetail.questionFilePath?.split('/').pop() || t('defaultQuestionFileName')
                        )}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {t('download')}
                      </Button>
                    </div>
                  </div>
                )}

                {examDetail.answerFilePath && (
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {examDetail.answerFilePath?.split('/').pop() || t('defaultAnswerFileName')}
                        </p>
                        <p className="text-xs text-gray-500">{t('uploaded')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {onDownloadPdf && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPdf('answer')}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {t('downloadPdf')}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(
                          examDetail.answerFilePath!,
                          examDetail.answerFilePath?.split('/').pop() || t('defaultAnswerFileName')
                        )}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {t('download')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {examDetail.status === 'rejected' && examDetail.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-1">{t('rejectionReason')}</p>
                <p className="text-sm text-red-700">{examDetail.rejectionReason}</p>
              </div>
            )}

            {/* Footer Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('instructor')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {examDetail.instructorName || t('common.na')}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('submissionDate')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {examDetail.submissionDate ? formatDate(examDetail.submissionDate) : t('common.na')}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('approvalDate')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {examDetail.reviewedAt ? formatDate(examDetail.reviewedAt) : t('common.na')}
                </p>
              </div>
            </div>

            {/* Actions */}
            {examDetail.status === 'pending' && (onApprove || onReject) && (
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                {onReject && (
                  <Button
                    variant="outline"
                    onClick={() => onReject(examId)}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {t('reject')}
                  </Button>
                )}
                {onApprove && (
                  <Button
                    onClick={() => onApprove(examId)}
                    className="bg-[#0053AD] text-white hover:bg-[#003d82]"
                  >
                    {t('approve')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

