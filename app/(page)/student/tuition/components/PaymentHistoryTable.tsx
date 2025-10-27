"use client";

import { PaymentHistory } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";

interface PaymentHistoryTableProps {
  data: PaymentHistory[];
}

export default function PaymentHistoryTable({ data }: PaymentHistoryTableProps) {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  const getStatusText = (status: PaymentHistory['status']) => {
    switch (status) {
      case 'completed':
        return 'Đã thanh toán';
      case 'pending':
        return 'Đang xử lý';
      case 'failed':
        return 'Thất bại';
      default:
        return '';
    }
  };

  const getStatusColor = (status: PaymentHistory['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-orange-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.date}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{item.description}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.amount)}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">{item.method}</td>
              <td className={cn("px-4 py-3 text-xs lg:text-sm text-center font-medium", getStatusColor(item.status))}>
                {getStatusText(item.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

