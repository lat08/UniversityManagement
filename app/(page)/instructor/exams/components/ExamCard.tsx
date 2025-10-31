"use client"

import { FileText, Download, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: string;
  date: string;
  status: "approved" | "rejected" | "pending";
  examType: "midterm" | "final" | "quiz";
  rejectionReason?: string;
}

interface ExamCardProps {
  exam: Exam;
  onDownload?: (id: string) => void;
  onResubmit?: (id: string) => void;
}

const statusConfig = {
  approved: {
    label: "Đã duyệt",
    className: "bg-blue-100 text-blue-700",
  },
  rejected: {
    label: "Từ chối",
    className: "bg-red-100 text-red-700",
  },
  pending: {
    label: "Chờ duyệt",
    className: "bg-yellow-100 text-yellow-700",
  },
};

const examTypeConfig = {
  midterm: {
    label: "Giữa kỳ",
    className: "bg-gray-200 text-gray-700",
  },
  final: {
    label: "Cuối kỳ",
    className: "bg-gray-200 text-gray-700",
  },
  quiz: {
    label: "15 phút",
    className: "bg-gray-200 text-gray-700",
  },
};

export function ExamCard({
  exam,
  onDownload,
  onResubmit,
}: ExamCardProps) {
  const status = statusConfig[exam.status];
  const examType = examTypeConfig[exam.examType];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {exam.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2 py-1 rounded text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${examType.className}`}>
                {examType.label}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {exam.subject} - Thời lượng: {exam.duration} - {exam.date}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {exam.status === "approved" && (
            <Button
              variant="outline"
              onClick={() => onDownload?.(exam.id)}
              className="flex items-center gap-2 border-gray-300"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống</span>
            </Button>
          )}
          {exam.status === "rejected" && (
            <Button
              variant="outline"
              onClick={() => onResubmit?.(exam.id)}
              className="flex items-center gap-2 border-gray-300"
            >
              <UploadIcon className="w-4 h-4" />
              <span>Gửi lại</span>
            </Button>
          )}
        </div>
      </div>
      
      {exam.status === "rejected" && exam.rejectionReason && (
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
}

