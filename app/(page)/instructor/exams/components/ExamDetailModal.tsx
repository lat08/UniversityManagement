"use client"

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

interface ExamDetailModalProps {
  examEntryId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (examEntryId: string) => void;
}

export function ExamDetailModal({
  examEntryId,
  isOpen,
  onClose,
  onEdit,
}: ExamDetailModalProps) {
  const { examEntryDetail, loading, error } = useExamEntryDetail(
    isOpen ? examEntryId : null
  );
  const { downloadExamFile } = useExamActions();

  if (!isOpen || !examEntryId) return null;


  const handleDownload = async (fileType: 'question' | 'answer') => {
    if (!examEntryId) return;
    await downloadExamFile(examEntryId, fileType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Chi tiết đề thi
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Thông tin chi tiết về đề thi
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-8 text-center">
            <p className="text-gray-600">Đang tải dữ liệu...</p>
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
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-900">Môn học</label>
                <p className="text-sm text-gray-900 mt-1">
                  {examEntryDetail.subjectName} ({examEntryDetail.subjectCode})
                </p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900">Lớp học phần</label>
                <p className="text-sm text-gray-900 mt-1">
                  {examEntryDetail.courseClassCode} - {examEntryDetail.courseClassName}
                </p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900">Học kỳ</label>
                <p className="text-sm text-gray-900 mt-1">{examEntryDetail.semesterName}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900">Loại đề thi</label>
                <p className="text-sm text-gray-900 mt-1">
                  {EXAM_TYPE_LABELS[examEntryDetail.examType] || examEntryDetail.examType}
                </p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900">Thời lượng</label>
                <p className="text-sm text-gray-900 mt-1">{examEntryDetail.durationMinutes} phút</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900">Trạng thái</label>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ENTRY_STATUS_COLORS[examEntryDetail.entryStatus] || "bg-gray-100 text-gray-700"
                  }`}>
                    {ENTRY_STATUS_LABELS[examEntryDetail.entryStatus] || examEntryDetail.entryStatus}
                  </span>
                </p>
              </div>
              {examEntryDetail.entryCode && (
                <div>
                  <label className="text-sm font-bold text-gray-900">Mã đề thi</label>
                  <p className="text-sm text-gray-900 mt-1">{examEntryDetail.entryCode}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {examEntryDetail.description && (
              <div>
                <label className="text-sm font-bold text-gray-900">Mô tả</label>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                  {examEntryDetail.description}
                </p>
              </div>
            )}

            {/* Files */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">File đề thi</label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {examEntryDetail.questionFilePath?.split('/').pop() || 'File đề thi'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {examEntryDetail.questionFilePath ? 'Đã tải lên' : 'Chưa có file'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('question')}
                    className="ml-3 flex-shrink-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải xuống
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">File đáp án</label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {examEntryDetail.answerFilePath?.split('/').pop() || 'File đáp án'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {examEntryDetail.answerFilePath ? 'Đã tải lên' : 'Chưa có file'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('answer')}
                    className="ml-3 flex-shrink-0"
                    disabled={!examEntryDetail.answerFilePath}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải xuống
                  </Button>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-bold text-gray-900">Ngày tạo</label>
                <p className="text-sm text-gray-900 mt-1">{examEntryDetail.createdAt ? formatDate(examEntryDetail.createdAt) : 'N/A'}</p>
              </div>
              {examEntryDetail.reviewedAt && (
                <div>
                  <label className="text-sm font-bold text-gray-900">Ngày duyệt</label>
                  <p className="text-sm text-gray-900 mt-1">{examEntryDetail.reviewedAt ? formatDate(examEntryDetail.reviewedAt) : 'N/A'}</p>
                </div>
              )}
              {examEntryDetail.reviewerName && (
                <div>
                  <label className="text-sm font-bold text-gray-900">Người duyệt</label>
                  <p className="text-sm text-gray-900 mt-1">{examEntryDetail.reviewerName}</p>
                </div>
              )}
            </div>

            {/* Rejection Reason */}
            {examEntryDetail.entryStatus === "rejected" && examEntryDetail.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</p>
                <p className="text-sm text-red-700">{examEntryDetail.rejectionReason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Đóng
              </Button>
              {(examEntryDetail.entryStatus === "pending" || examEntryDetail.entryStatus === "rejected") && (
                <Button
                  onClick={() => {
                    if (onEdit && examEntryId) {
                      onEdit(examEntryId);
                      onClose();
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

