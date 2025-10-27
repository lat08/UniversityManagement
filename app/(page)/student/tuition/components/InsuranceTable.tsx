"use client";

import { Insurance } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";

import { formatCurrency } from "@/lib/utils/format";
import { Spinner } from "@/app/components/ui/spinner";

interface InsuranceTableProps {
  data: Insurance[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  isLoading?: boolean;
}

export default function InsuranceTable({ data, selectedId, onSelectItem, isLoading }: InsuranceTableProps) {
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-[var(--primary)] text-[var(--primary-foreground)]">
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">Tên bảo hiểm y tế</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">Hiệu lực</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">Phải thu</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">Còn nợ</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">Trạng thái</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">Chọn</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.studentHealthInsuranceId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">Bảo hiểm Y tế sinh viên</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">{item.academicYear}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.healthInsuranceFee)}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{item.status === 'completed' ? formatCurrency(0) : formatCurrency(item.healthInsuranceFee)}</td>
              <td className={cn("px-4 py-3 text-xs lg:text-sm text-center font-medium", getStatusColor(item.status))}>
                {getStatusText(item.status)}
              </td>
              <td className="px-4 py-3 text-center">
                <input
                  type="radio"
                  name="insurance-select"
                  checked={selectedId === item.studentHealthInsuranceId}
                  onChange={() => onSelectItem(item.studentHealthInsuranceId)}
                  disabled={item.status === 'completed'}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

