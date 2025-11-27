"use client";

import { memo, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, ExternalLink, AlertTriangle, ChevronDown, FileText } from "lucide-react";
import { downloadFile } from "@/lib/utils/fileDownload";
import { formatDate } from "@/lib/utils/format";
import { Regulation } from "./lib/api/regulationsApi";
import toast from 'react-hot-toast';

interface ExtendedRegulation extends Regulation {
  category?: string;
  issueDate?: string;
  effectiveDate?: string;
}

interface RegulationCardProps {
  readonly regulation: Regulation;
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
  readonly noticeText?: string;
  readonly animationDelay?: number;
}

const RegulationCardComponent = ({ 
  regulation, 
  isExpanded, 
  onToggle, 
  noticeText, 
  animationDelay = 0 
}: RegulationCardProps) => {
  const t = useTranslations('common.regulations');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    // Block spam download
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    const loadingToast = toast.loading(t('download.loading'));

    try {
      await downloadFile(regulation.fileUrl, regulation.fileName);
      toast.success(t('download.success'), { id: loadingToast });
    } catch {
      toast.error(t('download.error'), { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  }, [regulation.fileUrl, regulation.fileName, isDownloading, t]);

  const formattedDate = formatDate(regulation.updatedAt || regulation.createdAt);

  return (
    <div 
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both',
      }}
    >
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-4 px-6 py-4 transition-colors hover:bg-blue-50"
        type="button"
        aria-expanded={isExpanded}
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="flex-1 text-left">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{regulation.title}</h3>
            {(() => {
              const extendedReg = regulation as ExtendedRegulation;
              const categoryMap: Record<string, string> = {
                admission: t('categories.admission'),
                academic: t('categories.academic'),
                finance: t('categories.finance'),
                student_affairs: t('categories.studentAffairs'),
                general: t('categories.general'),
              };
              const categoryColors: Record<string, string> = {
                admission: 'bg-blue-100 text-blue-700 ring-blue-200',
                academic: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
                finance: 'bg-amber-100 text-amber-700 ring-amber-200',
                student_affairs: 'bg-purple-100 text-purple-700 ring-purple-200',
                general: 'bg-gray-100 text-gray-700 ring-gray-200',
              };
              return extendedReg.category ? (
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${categoryColors[extendedReg.category] || 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                  {categoryMap[extendedReg.category] || extendedReg.category}
                </span>
              ) : null;
            })()}
          </div>
          <p className="text-sm text-gray-500">{t('updated')}: {formattedDate}</p>
        </div>

        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4 border-t border-gray-100 px-6 pb-6 pt-2">
          {/* Thông tin bổ sung */}
          {(() => {
            const extendedReg = regulation as ExtendedRegulation;
            if (extendedReg.issueDate || extendedReg.effectiveDate) {
              return (
                <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm sm:grid-cols-2">
                  {extendedReg.issueDate && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">{t('issueDate')}</p>
                      <p className="mt-1 font-medium text-gray-900">{formatDate(extendedReg.issueDate)}</p>
                    </div>
                  )}
                  {extendedReg.effectiveDate && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">{t('effectiveDate')}</p>
                      <p className="mt-1 font-medium text-gray-900">{formatDate(extendedReg.effectiveDate)}</p>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-900">{t('content')}:</p>
            <p className="text-sm leading-relaxed text-gray-700">{regulation.description}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">{t('viewDocument')}:</h4>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? t('download.loading') : t('download.button')}
              </button>

              <a
                href={regulation.fileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                {t('viewOnline')}
              </a>
            </div>

            {regulation.fileName && (
              <p className="mt-2 text-xs text-gray-500">{t('fileName')}: {regulation.fileName}</p>
            )}
          </div>

          {noticeText && (
            <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="flex-1">
                <p className="mb-1 text-sm font-semibold text-yellow-900">{t('notice')}</p>
                <p className="text-sm leading-relaxed text-yellow-800">{noticeText}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RegulationCard = memo(RegulationCardComponent);

