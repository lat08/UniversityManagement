'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { RegulationRecord } from '@/lib/types/regulation';
import {
  REGULATION_AUDIENCE_LABEL_KEY,
  REGULATION_CATEGORY_LABEL_KEY,
  REGULATION_ISSUING_UNIT_LABEL_KEY,
} from '@/lib/constants/regulations';
import { RegulationStatusBadge } from './regulation-status-badge';
import { Download, Eye, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

interface RegulationDetailModalProps {
  readonly open: boolean;
  readonly regulation: RegulationRecord | null;
  readonly onClose: () => void;
  readonly onDownload: (regulation: RegulationRecord) => void;
}

const getFileNameFromUrl = (url: string | null | undefined, fileName?: string | null): string => {
  if (fileName) return fileName;
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    // Remove timestamp prefix if exists (format: timestamp-filename)
    const parts = fileName.split('-');
    if (parts.length > 1 && /^\d+$/.test(parts[0])) {
      return parts.slice(1).join('-');
    }
    return fileName;
  } catch {
    return url;
  }
};

export const RegulationDetailModal = ({ open, regulation, onClose, onDownload }: RegulationDetailModalProps) => {
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

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!open || !regulation) {
    return null;
  }

  const issuingUnitLabelKey = REGULATION_ISSUING_UNIT_LABEL_KEY[regulation.issuingUnit];
  const categoryLabelKey = REGULATION_CATEGORY_LABEL_KEY[regulation.category];
  const audienceLabelKey = REGULATION_AUDIENCE_LABEL_KEY[regulation.targetAudience];
  const issuingUnitLabel = issuingUnitLabelKey ? t(issuingUnitLabelKey) : regulation.issuingUnit;
  const categoryLabel = categoryLabelKey ? t(categoryLabelKey) : regulation.category;
  const audienceLabel = audienceLabelKey ? t(audienceLabelKey) : regulation.targetAudience;
  const fileName = getFileNameFromUrl(regulation.fileUrl, regulation.fileName);
  
  // Determine file type and matching icon style
  const getFileTypeInfo = () => {
    const fileType = regulation.fileType?.toLowerCase() || fileName.split('.').pop()?.toLowerCase() || '';
    if (fileType === 'pdf') {
      return {
        type: t('detail.attachments.typeLabels.pdf'),
        icon: FileText,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        borderColor: 'border-red-200',
      };
    }
    if (fileType === 'doc' || fileType === 'docx') {
      return {
        type: t('detail.attachments.typeLabels.doc'),
        icon: FileText,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200',
      };
    }
    return {
      type: t('detail.attachments.typeLabels.generic'),
      icon: FileText,
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      borderColor: 'border-gray-200',
    };
  };

  const fileTypeInfo = getFileTypeInfo();
  const FileIcon = fileTypeInfo.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={handleBackdropClick}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex-1">
            <p className="text-xs uppercase text-gray-400">{t('detail.subtitle')}</p>
            <h2 className="text-xl font-semibold text-gray-900">{regulation.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RegulationStatusBadge status={regulation.status} />
              <span className="text-sm font-medium text-gray-600">
                {t('detail.code', { code: regulation.code })}
              </span>
              <span className="text-sm font-medium text-gray-500">
                {t('detail.category', { category: categoryLabel })}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            type="button"
            aria-label={t('detail.actions.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-gray-400">{t('detail.issueDate')}</p>
              <p className="text-base font-semibold text-gray-900">{formatDateValue(regulation.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">{t('detail.effectiveDate')}</p>
              <p className="text-base font-semibold text-gray-900">{formatDateValue(regulation.effectiveDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">{t('detail.expireDate')}</p>
              <p className="text-base font-semibold text-gray-900">{formatDateValue(regulation.expireDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">{t('detail.issuingUnit')}</p>
              <p className="text-base font-semibold text-gray-900">{issuingUnitLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">{t('detail.audience')}</p>
              <p className="text-base font-semibold text-gray-900">{audienceLabel}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">{t('detail.descriptionTitle')}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{regulation.description}</p>
          </div>

          {regulation.fileUrl && (
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-900">{t('detail.attachments.title')}</p>
              <Card className={`border-2 ${fileTypeInfo.borderColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${fileTypeInfo.bgColor}`}>
                      <FileIcon className={`h-6 w-6 ${fileTypeInfo.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {fileName || t('detail.attachments.fallbackName')}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${fileTypeInfo.bgColor} ${fileTypeInfo.iconColor}`}>
                          {fileTypeInfo.type}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => window.open(regulation.fileUrl ?? '#', '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          {t('detail.attachments.view')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => onDownload(regulation)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          {t('detail.attachments.download')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} type="button">
            {t('detail.actions.close')}
          </Button>
        </div>
      </div>
    </div>
  );
};


