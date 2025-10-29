"use client";

import { TuitionFee } from "../../lib/types/types";
import { cn } from "@/lib/utils/utils";

import { Spinner } from "@/app/components/ui/spinner";
import { formatCurrency } from "@/lib/utils/format";

interface TuitionTableProps {
  data: TuitionFee[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  isLoading?: boolean;
  canSelectAll?: boolean;
}

export default function TuitionTable({ data, selectedIds, onSelectAll, onSelectItem, isLoading, canSelectAll }: TuitionTableProps) {
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

  // Lọc ra các mục có thể chọn (trạng thái không phải 'completed')
  const selectableData = data.filter(item => item.status.toLowerCase() !== 'completed');
  
  // Tính toán trạng thái chọn dựa trên selectableData
  const someSelected = selectedIds.length > 0 && selectedIds.length < selectableData.length;
  const isAllSelected = selectedIds.length > 0 && selectedIds.length === selectableData.length;

  // Thêm giao diện khi không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="text-gray-500 text-lg">Không có dữ liệu học phí.</p>
      </div>
    );
  }

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
                disabled={!canSelectAll || selectableData.length === 0} // Disable nếu không thể chọn tất cả hoặc không có mục nào có thể chọn
                checked={isAllSelected && selectableData.length > 0} // Chỉ checked khi có mục có thể chọn và tất cả đã được chọn
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someSelected;
                  }
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
                  selectedIds.includes(item.courseId) && "bg-blue-50/50" // Thêm highlight cho dòng được chọn
                )}
            >
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.courseCode}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.courseName}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">{item.credits}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.courseFee)}</td>
              {/* Cập nhật: Chỉ còn nợ nếu trạng thái KHÔNG phải là 'completed' */}
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{item.status.toLowerCase() !== 'completed' ? formatCurrency(item.courseFee) : formatCurrency(0)}</td>
              <td className={cn("px-4 py-3 text-xs lg:text-sm text-center font-medium", getStatusColor(item.status))}>
                {getStatusText(item.status)}
              </td>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.courseId)}
                  onChange={(e) => onSelectItem(item.courseId, e.target.checked)}
                  disabled={item.status.toLowerCase() === 'completed'} // Disable nếu đã hoàn thành
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}