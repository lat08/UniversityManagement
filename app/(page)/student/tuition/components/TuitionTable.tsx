"use client";

import { TuitionFee } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";

interface TuitionTableProps {
  data: TuitionFee[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
}

export default function TuitionTable({ data, selectedIds, onSelectAll, onSelectItem }: TuitionTableProps) {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  const getStatusText = (status: TuitionFee['status']) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'unpaid':
        return 'Chưa thanh toán';
      case 'partial':
        return 'Thanh toán một phần';
      default:
        return '';
    }
  };

  const getStatusColor = (status: TuitionFee['status']) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'unpaid':
        return 'text-red-600';
      case 'partial':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
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
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.courseCode}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.courseName}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">{item.credits}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.amount)}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.outstanding)}</td>
              <td className={cn("px-4 py-3 text-xs lg:text-sm text-center font-medium", getStatusColor(item.status))}>
                {getStatusText(item.status)}
              </td>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={(e) => onSelectItem(item.id, e.target.checked)}
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

