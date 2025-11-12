"use client";

import { memo, useCallback } from 'react';
import { Download, ExternalLink, AlertTriangle, ChevronDown, FileText } from "lucide-react";
import { downloadFile } from "@/lib/utils/fileDownload";
import { formatDate } from "@/lib/utils/format";
import { Regulation } from "./lib/api/regulationsApi";

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
  const handleDownload = useCallback(() => {
    downloadFile(regulation.fileUrl, regulation.fileName);
  }, [regulation.fileUrl, regulation.fileName]);

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
        className="flex w-full items-center gap-4 px-6 py-4 transition-colors hover:bg-blue-50"
        type="button"
        aria-expanded={isExpanded}
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="mb-1 font-semibold text-gray-900">{regulation.title}</h3>
          <p className="text-sm text-gray-500">Cập nhật: {formattedDate}</p>
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
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-900">Nội dung:</p>
            <p className="text-sm leading-relaxed text-gray-700">{regulation.description}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Xem tài liệu chi tiết:</h4>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                type="button"
              >
                <Download className="h-4 w-4" />
                Tải file PDF
              </button>

              <a
                href={regulation.fileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                Xem trực tuyến
              </a>
            </div>

            {regulation.fileName && (
              <p className="mt-2 text-xs text-gray-500">Tên file: {regulation.fileName}</p>
            )}
          </div>

          {noticeText && (
            <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="flex-1">
                <p className="mb-1 text-sm font-semibold text-yellow-900">Lưu ý</p>
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

