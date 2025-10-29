// components/TuitionTab.tsx
import { ChevronDown, Filter, FileDown } from "lucide-react";
import { Spinner } from "@/app/components/ui/spinner";
import TuitionTable from "../tuition/TuitionTable";
import PaymentSummary from "../tuition/PaymentSummary";
import { TuitionFeeResponse } from "../../lib/types/types";
import { useTuitionLogic } from "../../lib/hooks/useTuitionLogic";
import { useEffect, useState } from "react";
import { Semester } from "../../../dashboard/libs/types/types";
import { useFinanceData } from "../../lib/hooks/useFinanceData";

type TuitionTabProps = {
  isLoading: boolean;
  tuitionData: TuitionFeeResponse['data'] | null;
  semesters : Semester[];
  setIsLoading: (loading: boolean) => void;
  setQrUrl: (url: string | null) => void;
  setIsQrOpen: (open: boolean) => void;
  setQrIframeLoading: (loading: boolean) => void;
  refreshData: (semesterId: string | null) => void;
};

export default function TuitionTab({
  isLoading,
  tuitionData,
  semesters,
  setIsLoading,
  setQrUrl,
  setIsQrOpen,
  setQrIframeLoading,
  refreshData,
}: TuitionTabProps) {
  const {
    selectedTuitionIds,
    selectedTuitionItems,
    handleSelectAllTuition,
    handleSelectTuition,
    handleExportTuition,
    handlePayment,
    availableCourses,
    // handleSemesterPayment // Not used in this version but available in hook
  } = useTuitionLogic(
    tuitionData,
    setIsLoading,
    setQrUrl,
    setIsQrOpen,
    setQrIframeLoading
    
  );

  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  useEffect(() => {
    if (tuitionData?.semesterId) {
      setSelectedSemesterId(tuitionData.semesterId);
    }
  }, [tuitionData]);

  useEffect(() => {
        if (selectedSemesterId) refreshData(selectedSemesterId);
      }, [selectedSemesterId, refreshData]);

  return (
    <div className="space-y-4">
      {/* Header and Loading State */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-gray-900">Danh sách học phí</h2>
          <p className="text-xs lg:text-sm text-gray-600">
            {isLoading ? 'Đang tải...' : `Thông tin học phí - ${tuitionData?.semesterName || ''}`}
          </p>
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          tuitionData && (
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs lg:text-sm font-medium">
              {tuitionData.courses.length} môn học
            </div>
          )
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        {/* Semester Info (Fixed/Disabled) */}
        <div className="relative sm:flex-[1]">
          <select
            value={selectedSemesterId || ""}
              onChange={(e) => {
                setSelectedSemesterId(e.target.value);
              }}
            className="max-h-60 overflow-y-auto w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none cursor-default transition-colors"
          >
            {semesters?.map((option) => (
              <option key={option.semesterId} value={option.semesterId}>
                {option.semesterName}
              </option>
            ))}
          </select>
          
        </div>

        {/* Filter and Export Buttons */}
        <div className="flex gap-3 sm:flex-initial">
          <button
            onClick={handleExportTuition}
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
        <TuitionTable 
          data={tuitionData?.courses || []}
          selectedIds={selectedTuitionIds}
          onSelectAll={handleSelectAllTuition}
          onSelectItem={handleSelectTuition}
          isLoading={isLoading}
          canSelectAll={availableCourses.length > 0}
        />
      </div>
            
      {/* Payment Summary */}
      <PaymentSummary 
        selectedItems={selectedTuitionItems}
        onPayment={handlePayment}
      />
    </div>
  );
}