"use client"

import { memo } from "react";
import { FileText, Download, Upload as UploadIcon, Eye } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { ExamEntry } from "../lib/types";
import { EXAM_TYPE_LABELS, ENTRY_STATUS_LABELS, ENTRY_STATUS_COLORS } from "../lib/constants";
import { formatDate } from "@/lib/utils/format";

interface ExamCardProps {
  exam: ExamEntry;
  onDownload?: (id: string, fileType: 'question' | 'answer') => void;
  onResubmit?: (id: string) => void;
  onView?: (id: string) => void;
  animationDelay?: number;
  onClick?: () => void;
}

const ExamCardComponent = ({
  exam,
  onDownload,
  onResubmit,
  onView,
  animationDelay = 0,
  onClick,
}: ExamCardProps) => {
  const statusLabel = ENTRY_STATUS_LABELS[exam.entryStatus] || exam.entryStatus;
  const statusClassName = ENTRY_STATUS_COLORS[exam.entryStatus] || "bg-gray-100 text-gray-700";
  const examTypeLabel = EXAM_TYPE_LABELS[exam.examType] || exam.examType;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onClick?.();
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01] cursor-pointer animate-fade-up"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both'
      }}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {exam.displayName || `${exam.courseClassCode} - ${exam.subjectName}`}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusClassName}`}>
                {statusLabel}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                {examTypeLabel}
              </span>
              {exam.entryCode && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                  Mã: {exam.entryCode}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>{exam.subjectName} - {exam.courseClassCode}</p>
            <p>Thời lượng: {exam.durationMinutes} phút</p>
            <p>Ngày tạo: {exam.createdAt ? formatDate(exam.createdAt) : 'N/A'}</p>
            {exam.reviewerName && (
              <p>Người duyệt: {exam.reviewerName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {exam.entryStatus === "approved" && (
            <>
              <Button
                variant="outline"
                onClick={() => onDownload?.(exam.examEntryId, 'question')}
                className="flex items-center gap-2 border-gray-300"
                size="sm"
              >
                <Download className="w-4 h-4" />
                <span>Tải đề</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onDownload?.(exam.examEntryId, 'answer')}
                className="flex items-center gap-2 border-gray-300"
                size="sm"
              >
                <Download className="w-4 h-4" />
                <span>Tải đáp án</span>
              </Button>
            </>
          )}
          {exam.entryStatus === "rejected" && (
            <Button
              variant="outline"
              onClick={() => onResubmit?.(exam.examEntryId)}
              className="flex items-center gap-2 border-gray-300"
              size="sm"
            >
              <UploadIcon className="w-4 h-4" />
              <span>Gửi lại</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onView?.(exam.examEntryId)}
            className="flex items-center gap-2 border-gray-300"
            size="sm"
          >
            <Eye className="w-4 h-4" />
            <span>Xem</span>
          </Button>
        </div>
      </div>
      
      {exam.entryStatus === "rejected" && exam.rejectionReason && (
        <div className="mt-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <span className="font-semibold">Lý do từ chối:</span> {exam.rejectionReason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const ExamCard = memo(ExamCardComponent);


