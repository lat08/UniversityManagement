'use client';

import { CircleCheck, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/app/components/ui';

interface BulkActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onClear: () => void;
  isProcessing?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onClear,
  isProcessing,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
      <div className="flex items-center gap-2">
        <CircleCheck className="w-5 h-5 text-[#0053AD]" />
        <span className="text-sm font-medium text-[#0053AD]">
          Đã chọn {selectedCount} bảng điểm
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onApprove}
          disabled={isProcessing}
          className="border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          Duyệt toàn bộ
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReject}
          disabled={isProcessing}
          className="border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Từ chối toàn bộ
        </Button>
        <Button
          size="sm"
          onClick={onClear}
          disabled={isProcessing}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
          Bỏ chọn
        </Button>
      </div>
    </div>
  );
}
