// components/PaymentHistoryTab.tsx
import { ChevronDown, Filter, FileDown } from "lucide-react";
import { Spinner } from "@/app/components/ui/spinner";
import PaymentHistoryTable from "../PaymentHistoryTable";
import { Payment } from "../../lib/types/types";
import { usePaymentHistoryLogic } from "../../lib/hooks/usePaymentHistoryLogic";

type PaymentHistoryTabProps = {
  isLoading: boolean;
  payments: Payment[]; // Nhận dữ liệu thô
  setIsLoading: (loading: boolean) => void;
};

export default function PaymentHistoryTab({
  isLoading,
  payments,
  setIsLoading,
}: PaymentHistoryTabProps) {
  const {
    searchTerm,
    setSearchTerm,
    handleExportPayment,
    filteredPayments,
  } = usePaymentHistoryLogic(payments, setIsLoading);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base lg:text-lg font-bold text-gray-900">Lịch sử thanh toán</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        {/* Search Input */}
        <div className="sm:flex-[1]">
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung/mã giao dịch..." // Cập nhật placeholder
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm"
          />
        </div>

        {/* Filter and Export Buttons */}
        <div className="flex gap-3 sm:flex-initial">
          
          <button
            onClick={handleExportPayment}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : <FileDown className="w-4 h-4" />}
            <span className="text-xs lg:text-sm font-medium">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <PaymentHistoryTable data={filteredPayments} isLoading={isLoading} /> {/* SỬ DỤNG filteredPayments */}
      </div>
    </div>
  );
}