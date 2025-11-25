'use client';

import { useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { RegulationRecord } from '@/lib/types/regulation';
import { REGULATION_AUDIENCE_LABEL, REGULATION_CATEGORY_LABEL, REGULATION_ISSUING_UNIT_LABEL } from '@/lib/constants/regulations';
import { RegulationStatusBadge } from './regulation-status-badge';
import { Download, Eye, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RegulationDetailModalProps {
  readonly open: boolean;
  readonly regulation: RegulationRecord | null;
  readonly onClose: () => void;
  readonly onDownload: (regulation: RegulationRecord) => void;
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

  const issuingUnitLabel = REGULATION_ISSUING_UNIT_LABEL[regulation.issuingUnit] ?? regulation.issuingUnit;
  const categoryLabel = REGULATION_CATEGORY_LABEL[regulation.category] ?? regulation.category;
  const audienceLabel = REGULATION_AUDIENCE_LABEL[regulation.targetAudience];
  const fileName = getFileNameFromUrl(regulation.fileUrl, regulation.fileName);
  
  // Xác định loại file và icon tương ứng
  const getFileTypeInfo = () => {
    const fileType = regulation.fileType?.toLowerCase() || fileName.split('.').pop()?.toLowerCase() || '';
    if (fileType === 'pdf') {
      return {
        type: 'PDF',
        icon: FileText,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        borderColor: 'border-red-200',
      };
    }
    if (fileType === 'doc' || fileType === 'docx') {
      return {
        type: fileType.toUpperCase(),
        icon: FileText,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200',
      };
    }
    return {
      type: 'FILE',
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
            <p className="text-xs uppercase text-gray-400">Chi tiết quy chế</p>
            <h2 className="text-xl font-semibold text-gray-900">{regulation.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RegulationStatusBadge status={regulation.status} />
              <span className="text-sm font-medium text-gray-600">Mã: {regulation.code}</span>
              <span className="text-sm font-medium text-gray-500">Loại: {categoryLabel}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-gray-400">Ngày ban hành</p>
              <p className="text-base font-semibold text-gray-900">{formatDate(regulation.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Ngày hiệu lực</p>
              <p className="text-base font-semibold text-gray-900">{formatDate(regulation.effectiveDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Ngày hết hiệu lực</p>
              <p className="text-base font-semibold text-gray-900">{formatDate(regulation.expireDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Đơn vị ban hành</p>
              <p className="text-base font-semibold text-gray-900">{issuingUnitLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Đối tượng áp dụng</p>
              <p className="text-base font-semibold text-gray-900">{audienceLabel}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Mô tả</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{regulation.description}</p>
          </div>

          {regulation.fileUrl && (
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-900">Tài liệu đính kèm</p>
              <Card className={`border-2 ${fileTypeInfo.borderColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${fileTypeInfo.bgColor}`}>
                      <FileIcon className={`h-6 w-6 ${fileTypeInfo.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{fileName || 'Tài liệu đính kèm'}</p>
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
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => onDownload(regulation)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Tải xuống
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
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};


