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
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4 transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01] cursor-pointer animate-fade-up"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both'
      }}
      onClick={handleCardClick}
    >
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
              {exam.displayName || `${exam.courseClassCode} - ${exam.subjectName}`}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${statusClassName}`}>
                {statusLabel}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-gray-200 text-gray-700">
                {examTypeLabel}
              </span>
              {exam.entryCode && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-green-100 text-green-700">
                  Mã: {exam.entryCode}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-600">
            <p>{exam.subjectName} - {exam.courseClassCode}</p>
            <p>Thời lượng: {exam.durationMinutes} phút</p>
            <p>Ngày tạo: {exam.createdAt ? formatDate(exam.createdAt) : 'N/A'}</p>
            {exam.reviewerName && (
              <p>Người duyệt: {exam.reviewerName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto sm:flex-shrink-0">
          {exam.entryStatus === "approved" && (
            <>
              <Button
                variant="outline"
                onClick={() => onDownload?.(exam.examEntryId, 'question')}
                className="flex items-center gap-1.5 sm:gap-2 border-gray-300 flex-1 sm:flex-none text-xs sm:text-sm"
                size="sm"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Tải đề</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onDownload?.(exam.examEntryId, 'answer')}
                className="flex items-center gap-1.5 sm:gap-2 border-gray-300 flex-1 sm:flex-none text-xs sm:text-sm"
                size="sm"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Tải đáp án</span>
              </Button>
            </>
          )}
          {exam.entryStatus === "rejected" && (
            <Button
              variant="outline"
              onClick={() => onResubmit?.(exam.examEntryId)}
              className="flex items-center gap-1.5 sm:gap-2 border-gray-300 flex-1 sm:flex-none text-xs sm:text-sm"
              size="sm"
            >
              <UploadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Gửi lại</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onView?.(exam.examEntryId)}
            className="flex items-center gap-1.5 sm:gap-2 border-gray-300 flex-1 sm:flex-none text-xs sm:text-sm"
            size="sm"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Xem</span>
          </Button>
        </div>
      </div>
      
      {exam.entryStatus === "rejected" && exam.rejectionReason && (
        <div className="mt-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
            <p className="text-xs sm:text-sm text-red-800">
              <span className="font-semibold">Lý do từ chối:</span> {exam.rejectionReason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const ExamCard = memo(ExamCardComponent);


