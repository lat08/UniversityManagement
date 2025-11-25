import { FileDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Dropdown } from "@/app/components/ui/dropdown";
import TuitionTable from "../tuition/TuitionTable";
import PaymentSummary from "../tuition/PaymentSummary";
import { useTuitionLogic } from "../../lib/hooks/useTuitionLogic";
import type { TuitionFeeResponse, Semester } from "../../lib/types/types";

type TuitionTabProps = {
  tuitionData: TuitionFeeResponse['data'] | null;
  semesters: Semester[];
  selectedSemesterId: string | null;
  onSemesterChange: (semesterId: string | null) => void;
  setQrUrl: (url: string | null) => void;
  setPaymentId: (id: string | null) => void;
  setIsQrOpen: (open: boolean) => void;
  setQrIframeLoading: (loading: boolean) => void;
};

export default function TuitionTab({
  tuitionData,
  semesters,
  selectedSemesterId,
  onSemesterChange,
  setQrUrl,
  setPaymentId,
  setIsQrOpen,
  setQrIframeLoading,
}: TuitionTabProps) {
  const t = useTranslations('student.tuition');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const {
    selectedTuitionIds,
    selectedTuitionItems,
    handleSelectAllTuition,
    handleSelectTuition,
    handleExportTuition,
    handlePayment,
    availableCourses,
  } = useTuitionLogic(
    tuitionData,
    setIsActionLoading,
    setQrUrl,
    setPaymentId,
    setIsQrOpen,
    setQrIframeLoading
  );

  const semesterOptions = useMemo(() => semesters.map(s => ({
    value: s.semesterId,
    label: s.semesterName,
  })), [semesters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-gray-900">
            {t('tuitionSection.title')}
          </h2>
          <p className="text-xs lg:text-sm text-gray-600">
            {t('tuitionSection.subtitle', { semester: tuitionData?.semesterName ?? '' })}
          </p>
        </div>
        {tuitionData && (
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs lg:text-sm font-medium">
            {t('tuitionSection.coursesBadge', { count: tuitionData.courses.length })}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        <div className="sm:flex-[1]">
          <Dropdown
            options={semesterOptions}
            value={selectedSemesterId || ''}
            placeholder={t('tuitionSection.semesterPlaceholder')}
            onChange={(value) => onSemesterChange(value || null)}
            disabled={isActionLoading}
          />
        </div>

        <div className="flex gap-3 sm:flex-initial">
          <button
            onClick={handleExportTuition}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isActionLoading}
          >
            <FileDown className="w-4 h-4" />
            <span className="text-xs lg:text-sm font-medium">{t('tuitionSection.exportButton')}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <TuitionTable
          data={tuitionData?.courses || []}
          selectedIds={selectedTuitionIds}
          onSelectAll={handleSelectAllTuition}
          onSelectItem={handleSelectTuition}
          isLoading={isActionLoading}
          canSelectAll={availableCourses.length > 0}
        />
      </div>

      <PaymentSummary
        selectedItems={selectedTuitionItems}
        onPayment={handlePayment}
      />
    </div>
  );
}