"use client";

import { TuitionFee } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";

import { Spinner } from "@/app/components/ui/spinner";
import { formatCurrency } from "@/lib/utils/format";

interface TuitionTableProps {
  data: TuitionFee[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  isLoading?: boolean;
}

export default function TuitionTable({ data, selectedIds, onSelectAll, onSelectItem, isLoading }: TuitionTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Đã thanh toán';
      case 'pending':
        return 'Đang xử lý';
      default:
        return 'Chưa thanh toán';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-[var(--primary)] text-[var(--primary-foreground)]">
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">Mã môn</th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">Tên môn học</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">Tín chỉ</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">Phải thu</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">Còn nợ</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">Trạng thái</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someSelected;
                  }
                }}
                disabled={data.every(item => item.status === 'completed')}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.courseId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.courseCode}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.courseName}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">{item.credits}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.courseFee)}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{item.status === 'completed' ? formatCurrency(0) : formatCurrency(item.courseFee)}</td>
              <td className={cn("px-4 py-3 text-xs lg:text-sm text-center font-medium", getStatusColor(item.status))}>
                {getStatusText(item.status)}
              </td>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.courseId)}
                  onChange={(e) => onSelectItem(item.courseId, e.target.checked)}
                  disabled={item.status === 'completed'}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

