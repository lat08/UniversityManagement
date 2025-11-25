'use client';

import { CircleCheck, CheckCircle, XCircle, X, Download, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';

interface BulkActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onExport: () => void;
  onClear: () => void;
  isProcessing?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onExport,
  onClear,
  isProcessing,
}: BulkActionBarProps) {
  const t = useTranslations('admin.gradeApproval');

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
      <div className="flex items-center gap-2">
        <CircleCheck className="w-5 h-5 text-[#0053AD]" />
        <span className="text-sm font-medium text-[#0053AD]">
          {t('bulkBar.selected', { count: selectedCount })}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isProcessing}
          className="border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          title={t('bulkBar.exportTooltip')}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('bulkBar.exporting')}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {t('bulkBar.export')}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onApprove}
          disabled={isProcessing}
          className="border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          {t('bulkBar.approveAll')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReject}
          disabled={isProcessing}
          className="border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          {t('bulkBar.rejectAll')}
        </Button>
        <Button
          size="sm"
          onClick={onClear}
          disabled={isProcessing}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
          {t('bulkBar.clear')}
        </Button>
      </div>
    </div>
  );
}
