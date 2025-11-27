'use client';

import { CircleCheck, Edit, Bell, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';

interface BulkActionBarProps {
  readonly selectedCount: number;
  readonly onEdit: () => void;
  readonly onCreateReminder: () => void;
  readonly onDelete: () => void;
  readonly onClear: () => void;
  readonly isProcessing?: boolean;
}

export const BulkActionBar = ({
  selectedCount,
  onEdit,
  onCreateReminder,
  onDelete,
  onClear,
  isProcessing = false,
}: BulkActionBarProps) => {
  const t = useTranslations('admin.tuition');

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 p-3">
      <div className="flex items-center gap-2">
        <CircleCheck className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-600">
          {t('bulkBar.selected', { count: selectedCount })}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          disabled={isProcessing}
          className="border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-50"
          type="button"
        >
          <Edit className="h-4 w-4" />
          {t('bulkBar.edit')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateReminder}
          disabled={isProcessing}
          className="border-orange-600 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
          type="button"
        >
          <Bell className="h-4 w-4" />
          {t('bulkBar.createReminder')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={isProcessing}
          className="border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          {t('bulkBar.delete')}
        </Button>
        <Button
          size="sm"
          onClick={onClear}
          disabled={isProcessing}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          type="button"
        >
          <X className="h-4 w-4" />
          {t('bulkBar.clear')}
        </Button>
      </div>
    </div>
  );
};


