import { FileDown } from "lucide-react";
import { useState } from "react";
import InsuranceTable from "../insurance/InsuranceTable";
import InsuranceSummary from "../insurance/InsuranceSummary";
import { useInsuranceLogic } from "../../lib/hooks/useInsuranceLogic";
import type { Insurance } from "../../lib/types/types";

type InsuranceTabProps = {
  insurances: Insurance[];
  setQrUrl: (url: string | null) => void;
  setPaymentId: (id: string | null) => void;
  setIsQrOpen: (open: boolean) => void;
  setQrIframeLoading: (loading: boolean) => void;
};

export default function InsuranceTab({
  insurances,
  setQrUrl,
  setPaymentId,
  setIsQrOpen,
  setQrIframeLoading,
}: InsuranceTabProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    selectedInsuranceId,
    selectedInsuranceItems,
    handleSelectInsurance,
    handleExportInsurance,
    handleInsurancePayment,
  } = useInsuranceLogic(
    insurances,
    setIsActionLoading,
    setQrUrl,
    setPaymentId,
    setIsQrOpen,
    setQrIframeLoading
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-gray-900">Danh sách bảo hiểm y tế</h2>
          <p className="text-xs lg:text-sm text-gray-600">Thông tin đóng bảo hiểm y tế theo học kỳ</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        <div className="ml-auto flex gap-3 sm:flex-initial">
          <button
            onClick={handleExportInsurance}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isActionLoading}
          >
            <FileDown className="w-4 h-4" />
            <span className="text-xs lg:text-sm font-medium">Xuất Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <InsuranceTable
          data={insurances}
          selectedId={selectedInsuranceId}
          onSelectItem={handleSelectInsurance}
          isLoading={isActionLoading}
        />
      </div>

      <InsuranceSummary
        selectedItems={selectedInsuranceItems}
        onPayment={handleInsurancePayment}
      />
    </div>
  );
}