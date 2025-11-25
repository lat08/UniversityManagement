"use client"

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Download, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { useExamEntryDetail } from "../lib/hooks/useExamEntries";
import { useExamActions } from "../lib/hooks/useExamActions";
import { EXAM_TYPE_LABELS, ENTRY_STATUS_LABELS, ENTRY_STATUS_COLORS } from "../lib/constants";
import { formatDate } from "@/lib/utils/format";
import toast from 'react-hot-toast';

interface ExamDetailModalProps {
  readonly examEntryId: string | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function ExamDetailModal({
  examEntryId,
  isOpen,
  onClose,
}: ExamDetailModalProps) {
  const t = useTranslations('instructor.exams.detailModal');
  const tStatuses = useTranslations('instructor.exams.statuses');
  const tExamTypes = useTranslations('instructor.exams.examTypes');
  
  const { examEntryDetail, loading, error } = useExamEntryDetail(
    isOpen ? examEntryId : null
  );
  const { downloadExamFile } = useExamActions();

  const handleDownload = (fileUrl: string, fileName?: string) => {
    if (!fileUrl) {
      toast.error(t('fileNotFound'));
      return;
    }
    downloadExamFile(fileUrl, fileName);
  };

  const statusLabel = useMemo(() => {
    if (!examEntryDetail) return '';
    return tStatuses(examEntryDetail.entryStatus as 'approved' | 'pending' | 'rejected') || ENTRY_STATUS_LABELS[examEntryDetail.entryStatus] || examEntryDetail.entryStatus;
  }, [examEntryDetail, tStatuses]);

  const examTypeLabel = useMemo(() => {
    if (!examEntryDetail) return '';
    return tExamTypes(examEntryDetail.examType as 'midterm' | 'final' | 'quiz' | 'makeup') || EXAM_TYPE_LABELS[examEntryDetail.examType] || examEntryDetail.examType;
  }, [examEntryDetail, tExamTypes]);

  if (!isOpen || !examEntryId) return null;

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

        {loading && (
          <div className="py-8 text-center">
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        )}

        {error && (
          <div className="py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {examEntryDetail && !loading && (
          <div className="space-y-6">
            {/* TRẠNG THÁI HIỆN TẠI */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <p className="text-gray-500">{t('currentStatus')}</p>
                <p className="text-gray-900 mt-0.5">
                  {t('subjectCode')}: <span className="font-semibold">{examEntryDetail.courseClassCode}</span>
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  ENTRY_STATUS_COLORS[examEntryDetail.entryStatus] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {statusLabel}
              </span>
            </div>

            {/* Mã môn - nếu có */}
            {examEntryDetail.entryCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <span className="text-sm text-gray-600">{t('entryCode')}: </span>
                <span className="text-sm font-semibold text-gray-900">{examEntryDetail.entryCode}</span>
              </div>
            )}

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
                    value={`${examEntryDetail.subjectName}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">{t('courseClass')}</label>
                  <input
                    type="text"
                    readOnly
                    value={`${examEntryDetail.courseClassCode} - ${examEntryDetail.courseClassName}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">{t('semester')}</label>
                  <input
                    type="text"
                    readOnly
                    value={examEntryDetail.semesterName}
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
                    value={`${examEntryDetail.durationMinutes} ${t('minutes')}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">{t('entryCodeLabel')}</label>
                  <input
                    type="text"
                    readOnly
                    value={examEntryDetail.entryCode || 'N/A'}
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
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {examEntryDetail.questionFilePath?.split('/').pop() || 'example.pdf'}
                      </p>
                      <p className="text-xs text-gray-500">{t('uploaded')}</p>
                    </div>
                  </div>
                  {examEntryDetail.questionFilePath && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(
                        examEntryDetail.questionFilePath!,
                        examEntryDetail.questionFilePath?.split('/').pop() || 'de_thi.pdf'
                      )}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      {t('download')}
                    </Button>
                  )}
                </div>

                {examEntryDetail.answerFilePath && (
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {examEntryDetail.answerFilePath?.split('/').pop() || 'answer.pdf'}
                        </p>
                        <p className="text-xs text-gray-500">{t('uploaded')}</p>
                      </div>
                    </div>
                    {examEntryDetail.answerFilePath && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(
                          examEntryDetail.answerFilePath!,
                          examEntryDetail.answerFilePath?.split('/').pop() || 'dap_an.pdf'
                        )}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Tải xuống
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {examEntryDetail.entryStatus === "rejected" && examEntryDetail.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-1">{t('rejectionReason')}</p>
                <p className="text-sm text-red-700">{examEntryDetail.rejectionReason}</p>
              </div>
            )}

            {/* Footer Info - 3 boxes */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('createdAt')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {examEntryDetail.createdAt ? formatDate(examEntryDetail.createdAt) : 'N/A'}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('reviewedAt')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {examEntryDetail.reviewedAt ? formatDate(examEntryDetail.reviewedAt) : 'N/A'}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('reviewer')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {examEntryDetail.reviewerName || 'N/A'}
                </p>
              </div>
            </div>

            {/* Actions */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

