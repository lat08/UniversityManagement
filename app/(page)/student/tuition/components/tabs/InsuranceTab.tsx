// components/InsuranceTab.tsx
import { FileDown } from "lucide-react";
import { Spinner } from "@/app/components/ui/spinner";
import InsuranceTable from "../insurance/InsuranceTable";
import InsuranceSummary from "../insurance/InsuranceSummary";
import { Insurance } from "../../lib/types/types";
import { useInsuranceLogic } from "../../lib/hooks/useInsuranceLogic";

type InsuranceTabProps = {
  isLoading: boolean;
  insurances: Insurance[];
  setIsLoading: (loading: boolean) => void;
  setQrUrl: (url: string | null) => void;
  setIsQrOpen: (open: boolean) => void;
  setQrIframeLoading: (loading: boolean) => void;
};

export default function InsuranceTab({
  isLoading,
  insurances,
  setIsLoading,
  setQrUrl,
  setIsQrOpen,
  setQrIframeLoading,
}: InsuranceTabProps) {
  const {
    selectedInsuranceId,
    selectedInsuranceItems,
    handleSelectInsurance,
    handleExportInsurance,
    handleInsurancePayment,
  } = useInsuranceLogic(
    insurances,
    setIsLoading,
    setQrUrl,
    setIsQrOpen,
    setQrIframeLoading
  );
  
  return (
    <div className="space-y-4">
      {/* Header and Deadline */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-gray-900">Danh sách bảo hiểm y tế</h2>
          <p className="text-xs lg:text-sm text-gray-600">Thông tin đóng bảo hiểm y tế theo học kỳ</p>
        </div>
     
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        
        {/* Filter and Export Buttons */}
        <div className="ml-auto flex gap-3 sm:flex-initial">
          <button
            onClick={handleExportInsurance}
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
        <InsuranceTable 
          data={insurances}
          selectedId={selectedInsuranceId}
          onSelectItem={handleSelectInsurance}
          isLoading={isLoading}
        />
      </div>

      {/* Insurance Summary */}
      <InsuranceSummary 
        selectedItems={selectedInsuranceItems}
        onPayment={handleInsurancePayment}
      />
    </div>
  );
}