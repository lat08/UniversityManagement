"use client";

import { Payment } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Spinner } from "@/app/components/ui/spinner";

interface PaymentHistoryTableProps {
  data: Payment[];
  isLoading?: boolean;
}

export default function PaymentHistoryTable({ data, isLoading }: PaymentHistoryTableProps) {
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
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">Ngày</th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">Nội dung</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">Số tiền</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">Phương thức</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.paymentDate} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{formatDate(item.paymentDate)}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.note}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.amountPaid)}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">{item.paymentMethod}</td>
              <td className={cn("px-4 py-3 text-xs lg:text-sm font-medium text-center", getStatusColor(item.status))}>
                {getStatusText(item.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

