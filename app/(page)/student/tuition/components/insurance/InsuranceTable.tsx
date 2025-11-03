"use client";

import { Insurance } from "../../lib/types/types";
import { cn } from "@/lib/utils/utils";

import { formatCurrency } from "@/lib/utils/format";
import { Spinner } from "@/app/components/ui/spinner";
import { getStatusText, getStatusColor } from "@/lib/utils/statusDisplay";

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


  // Thêm giao diện khi không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="text-gray-500 text-lg">Không có dữ liệu bảo hiểm y tế.</p>
      </div>
    );
  }

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
            <tr
              key={item.studentHealthInsuranceId}
              className={cn(
                "hover:bg-gray-50 transition-colors",
                selectedId === item.studentHealthInsuranceId && "bg-blue-50/50" // Thêm highlight cho dòng được chọn
              )}
            >
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">Bảo hiểm Y tế sinh viên</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">{item.academicYear}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.healthInsuranceFee)}</td>
              {/* Cập nhật: Chỉ còn nợ nếu trạng thái KHÔNG phải là 'completed' */}
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{item.status.toLowerCase() !== 'completed' ? formatCurrency(item.healthInsuranceFee) : formatCurrency(0)}</td>
              <td className={cn("px-4 py-3 text-xs lg:text-sm text-center font-medium", getStatusColor(item.status))}>
                {getStatusText(item.status)}
              </td>
              <td className="px-4 py-3 text-center">
                <input
                  type="radio"
                  name="insurance-select"
                  checked={selectedId === item.studentHealthInsuranceId}
                  onChange={() => onSelectItem(item.studentHealthInsuranceId)}
                  disabled={item.status.toLowerCase() === 'completed'} // Disable nếu đã hoàn thành
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}