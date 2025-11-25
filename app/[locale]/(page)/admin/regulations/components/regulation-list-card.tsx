'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import { RegulationRecord } from '@/lib/types/regulation';
import {
  REGULATION_AUDIENCE_LABEL_KEY,
  REGULATION_CATEGORY_LABEL_KEY,
  REGULATION_ISSUING_UNIT_LABEL_KEY,
} from '@/lib/constants/regulations';
import { RegulationStatusBadge } from './regulation-status-badge';
import { Download, Eye, FileText, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
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

export const RegulationListCard = ({
  regulation,
  onView,
  onEdit,
  onDownload,
  onDelete,
}: RegulationListCardProps) => {
  const t = useTranslations('admin.regulations');
  const locale = useLocale();
  const emptyValue = t('common.emptyValue');
  const localeConfig = locale === 'vi' ? vi : enUS;
  const dateFormat = locale === 'vi' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';
  const formatDateValue = (value: string | null | undefined): string => {
    if (!value) {
      return emptyValue;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return format(parsed, dateFormat, { locale: localeConfig });
  };

  const categoryLabelKey = REGULATION_CATEGORY_LABEL_KEY[regulation.category];
  const issuingUnitLabelKey = REGULATION_ISSUING_UNIT_LABEL_KEY[regulation.issuingUnit];
  const audienceLabelKey = REGULATION_AUDIENCE_LABEL_KEY[regulation.targetAudience];
  const categoryLabel = categoryLabelKey ? t(categoryLabelKey) : regulation.category;
  const issuingUnitLabel = issuingUnitLabelKey ? t(issuingUnitLabelKey) : regulation.issuingUnit;
  const audienceLabel = audienceLabelKey ? t(audienceLabelKey) : regulation.targetAudience;

  const categoryColors: Record<string, string> = {
    admission: 'bg-blue-100 text-blue-700 ring-blue-200',
    academic: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    finance: 'bg-amber-100 text-amber-700 ring-amber-200',
    student_affairs: 'bg-purple-100 text-purple-700 ring-purple-200',
    general: 'bg-gray-100 text-gray-700 ring-gray-200',
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Open detail only when clicking on the card, not the action buttons
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
            <p className="text-sm font-medium text-gray-500">
              {t('list.code')} {regulation.code}
            </p>
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
                  aria-label={t('list.actions.view')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('list.actions.view')}</TooltipContent>
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
                  aria-label={t('list.actions.edit')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('list.actions.edit')}</TooltipContent>
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
                  aria-label={t('list.actions.download')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('list.actions.download')}</TooltipContent>
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
                  aria-label={t('list.actions.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('list.actions.delete')}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-gray-400">{t('list.issueDate')}</p>
          <p className="font-medium text-gray-900">{formatDateValue(regulation.issueDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">{t('list.effectiveDate')}</p>
          <p className="font-medium text-gray-900">{formatDateValue(regulation.effectiveDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">{t('list.issuingUnit')}</p>
          <p className="font-medium text-gray-900">{issuingUnitLabel}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">{t('list.audience')}</p>
          <p className="font-medium text-gray-900">{audienceLabel}</p>
        </div>
      </div>
    </div>
  );
};


