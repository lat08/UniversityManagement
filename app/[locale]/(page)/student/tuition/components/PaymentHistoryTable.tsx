"use client";

import { Payment } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Spinner } from "@/app/components/ui/spinner";
import { getStatusText, getStatusColor } from "@/lib/utils/statusDisplay";
import { useTranslations } from "next-intl";

interface PaymentHistoryTableProps {
  data: Payment[];
  isLoading?: boolean;
}

export default function PaymentHistoryTable({ data, isLoading }: PaymentHistoryTableProps) {
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
        <p className="text-gray-500 text-lg">{t('historyTable.empty')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
      <table className="min-w-full bg-white border-collapse">
        <thead className="sticky top-0 bg-[var(--primary)] text-[var(--primary-foreground)] z-10">
          <tr>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">{t('historyTable.headers.date')}</th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">{t('historyTable.headers.description')}</th>
            <th className="px-4 py-3 text-right text-xs lg:text-sm font-semibold">{t('historyTable.headers.amount')}</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">{t('historyTable.headers.method')}</th>
            <th className="px-4 py-3 text-center text-xs lg:text-sm font-semibold">{t('historyTable.headers.status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr
              key={`${item.paymentDate}-${item.paymentMethod}-${item.amountPaid}`}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">
                {formatDate(item.paymentDate)}
              </td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900">
                {item.note}
              </td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-right">
                {formatCurrency(item.amountPaid)}
              </td>
              <td className="px-4 py-3 text-xs lg:text-sm text-gray-900 text-center">
                {item.paymentMethod}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-xs lg:text-sm font-medium text-center",
                  getStatusColor(item.status)
                )}
              >
                {getStatusText(item.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}