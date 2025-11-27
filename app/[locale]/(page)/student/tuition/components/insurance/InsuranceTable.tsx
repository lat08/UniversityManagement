"use client";

import { Insurance } from "../../lib/types/types";
import { cn } from "@/lib/utils/utils";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('student.tuition');

  if (!data || data.length === 0) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Spinner />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="text-gray-500 text-lg">{t('insuranceTable.empty')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-[var(--primary)] text-[var(--primary-foreground)]">
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">{t('insuranceTable.headers.name')}</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">{t('insuranceTable.headers.validity')}</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">{t('insuranceTable.headers.amountDue')}</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">{t('insuranceTable.headers.outstanding')}</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">{t('insuranceTable.headers.status')}</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">{t('insuranceTable.headers.select')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr
              key={item.studentHealthInsuranceId}
              className={cn(
                "hover:bg-gray-50 transition-colors",
                selectedId === item.studentHealthInsuranceId && "bg-blue-50/50"
              )}
            >
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">{t('insuranceTable.rowTitle')}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">{item.academicYear}</td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">{formatCurrency(item.healthInsuranceFee)}</td>
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
                  disabled={item.status.toLowerCase() === 'completed'}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={t('insuranceTable.headers.select')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}