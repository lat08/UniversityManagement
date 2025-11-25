'use client';

import { Button } from '@/app/components/ui/button';
import { RegulationRecord } from '@/lib/types/regulation';
import { REGULATION_AUDIENCE_LABEL, REGULATION_CATEGORY_LABEL, REGULATION_ISSUING_UNIT_LABEL } from '@/lib/constants/regulations';
import { RegulationStatusBadge } from './regulation-status-badge';
import { Download, Eye, FileText, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';

interface RegulationListCardProps {
  readonly regulation: RegulationRecord;
  readonly onView: () => void;
  readonly onEdit: () => void;
  readonly onDownload: () => void;
  readonly onDelete: () => void;
}

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return format(parsed, 'dd/MM/yyyy', { locale: vi });
};

export const RegulationListCard = ({
  regulation,
  onView,
  onEdit,
  onDownload,
  onDelete,
}: RegulationListCardProps) => {
  const categoryLabel = REGULATION_CATEGORY_LABEL[regulation.category] ?? regulation.category;
  const issuingUnitLabel = REGULATION_ISSUING_UNIT_LABEL[regulation.issuingUnit] ?? regulation.issuingUnit;
  const audienceLabel = REGULATION_AUDIENCE_LABEL[regulation.targetAudience];

  const categoryColors: Record<string, string> = {
    admission: 'bg-blue-100 text-blue-700 ring-blue-200',
    academic: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    finance: 'bg-amber-100 text-amber-700 ring-amber-200',
    student_affairs: 'bg-purple-100 text-purple-700 ring-purple-200',
    general: 'bg-gray-100 text-gray-700 ring-gray-200',
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Chỉ mở detail khi click vào card, không phải vào các button
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    onView();
  };

  return (
    <div 
      onClick={handleCardClick}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:cursor-pointer hover:border-blue-200 hover:shadow-lg"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{regulation.title}</h3>
              <RegulationStatusBadge status={regulation.status} />
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${categoryColors[regulation.category] || 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                {categoryLabel}
              </span>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                {audienceLabel}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">Mã: {regulation.code}</p>
            <p className="text-sm text-gray-600">{regulation.description}</p>
          </div>
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-gray-500 md:justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                  type="button"
                  aria-label="Xem chi tiết"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xem chi tiết</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-emerald-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  type="button"
                  aria-label="Chỉnh sửa"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-indigo-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                  }}
                  type="button"
                  aria-label="Tải xuống"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tải xuống</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  type="button"
                  aria-label="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xóa</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-gray-400">Ngày ban hành</p>
          <p className="font-medium text-gray-900">{formatDate(regulation.issueDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">Ngày hiệu lực</p>
          <p className="font-medium text-gray-900">{formatDate(regulation.effectiveDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">Đơn vị ban hành</p>
          <p className="font-medium text-gray-900">{issuingUnitLabel}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">Đối tượng áp dụng</p>
          <p className="font-medium text-gray-900">{audienceLabel}</p>
        </div>
      </div>
    </div>
  );
};


