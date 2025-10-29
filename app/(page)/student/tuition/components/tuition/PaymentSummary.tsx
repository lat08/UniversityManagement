"use client";

import { CreditCard } from "lucide-react";
import { TuitionFee } from "../../lib/types/types";

interface PaymentSummaryProps {
  selectedItems: TuitionFee[];
  onPayment: () => void;
}

export default function PaymentSummary({ selectedItems, onPayment }: PaymentSummaryProps) {
  if (selectedItems.length === 0) {
    return null;
  }

  const totalCredits = selectedItems.reduce((sum, item) => sum + item.credits, 0);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.courseFee, 0);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  return (
    <div className="space-y-4">
      {/* Summary Box */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-end">
          <div className="space-y-2 min-w-[250px]">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Số tín chỉ chọn:</span>
              <span className="font-semibold text-gray-800">{totalCredits}</span>
            </div>
            <div className="border-t border-gray-300"></div>
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
              <span className="text-base font-bold text-[var(--primary)]">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={onPayment}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors font-medium text-sm lg:text-base shadow-sm hover:shadow-md"
      >
        <CreditCard className="w-5 h-5" />
        <span>Thanh toán</span>
      </button>
    </div>
  );
}

