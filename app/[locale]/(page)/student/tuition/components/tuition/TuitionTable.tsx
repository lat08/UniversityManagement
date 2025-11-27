"use client";

import { TuitionFee } from "../../lib/types/types";
import { cn } from "@/lib/utils/utils";
import { useTranslations } from "next-intl";

import { Spinner } from "@/app/components/ui/spinner";
import { formatCurrency } from "@/lib/utils/format";
import { getStatusText, getStatusColor } from "@/lib/utils/statusDisplay";

interface TuitionTableProps {
  data: TuitionFee[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  isLoading?: boolean;
  canSelectAll?: boolean;
}

export default function TuitionTable({ data, selectedIds, onSelectAll, onSelectItem, isLoading, canSelectAll }: TuitionTableProps) {
  const t = useTranslations('student.tuition');

  if (!data || data.length === 0) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Spinner />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="text-gray-500 text-lg">{t('tuitionTable.empty')}</p>
      </div>
    );
  }

  const selectableData = data.filter(item => item.status.toLowerCase() !== 'completed');
  const someSelected = selectedIds.length > 0 && selectedIds.length < selectableData.length;
  const isAllSelected = selectedIds.length > 0 && selectedIds.length === selectableData.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-[var(--primary)] text-[var(--primary-foreground)]">
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">{t('tuitionTable.headers.code')}</th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">{t('tuitionTable.headers.name')}</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">{t('tuitionTable.headers.credits')}</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">{t('tuitionTable.headers.amountDue')}</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">{t('tuitionTable.headers.outstanding')}</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">{t('tuitionTable.headers.status')}</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">
              <input
                type="checkbox"
                disabled={!canSelectAll || selectableData.length === 0}
                checked={isAllSelected && selectableData.length > 0}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someSelected;
                  }
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={t('tuitionTable.headers.select')}
              />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr 
                key={item.courseId} 
                className={cn(
                  "hover:bg-gray-50 transition-colors",
                  selectedIds.includes(item.courseId) && "bg-blue-50/50"
                )}
            >
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.courseCode}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.courseName}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">{item.credits}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.courseFee)}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{item.status.toLowerCase() !== 'completed' ? formatCurrency(item.courseFee) : formatCurrency(0)}</td>
              <td className={cn("px-4 py-3 text-xs lg:text-sm text-center font-medium", getStatusColor(item.status))}>
                {getStatusText(item.status)}
              </td>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.courseId)}
                  onChange={(e) => onSelectItem(item.courseId, e.target.checked)}
                  disabled={item.status.toLowerCase() === 'completed'}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={t('tuitionTable.headers.select')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}