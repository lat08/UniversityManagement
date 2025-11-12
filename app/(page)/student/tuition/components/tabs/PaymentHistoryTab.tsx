import { FileDown } from "lucide-react";
import { useState } from "react";
import PaymentHistoryTable from "../PaymentHistoryTable";
import { usePaymentHistoryLogic } from "../../lib/hooks/usePaymentHistoryLogic";
import type { Payment } from "../../lib/types/types";

type PaymentHistoryTabProps = {
  payments: Payment[];
};

export default function PaymentHistoryTab({ payments }: PaymentHistoryTabProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    handleExportPayment,
    filteredPayments,
  } = usePaymentHistoryLogic(payments, setIsActionLoading);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base lg:text-lg font-bold text-gray-900">Lịch sử thanh toán</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        <div className="sm:flex-[1]">
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung/mã giao dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm"
          />
        </div>

        <div className="flex gap-3 sm:flex-initial">
          <button
            onClick={handleExportPayment}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isActionLoading}
          >
            <FileDown className="w-4 h-4" />
            <span className="text-xs lg:text-sm font-medium">Xuất Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <PaymentHistoryTable data={filteredPayments} isLoading={isActionLoading} />
      </div>
    </div>
  );
}