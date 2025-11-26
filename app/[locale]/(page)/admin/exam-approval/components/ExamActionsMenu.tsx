'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, CheckCircle2, XCircle, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import { ExamStatus } from '@/lib/types/adminExam';

interface ExamActionsMenuProps {
  readonly status: ExamStatus;
  readonly onView: () => void;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly onDownloadPdf?: (type: 'exam' | 'answer') => void;
  readonly compact?: boolean;
  readonly disabled?: boolean;
}

export const ExamActionsMenu = ({
  status,
  onView,
  onApprove,
  onReject,
  onDownloadPdf,
  compact = true,
  disabled = false,
}: ExamActionsMenuProps) => {
  const t = useTranslations('admin.examApproval.actionsMenu');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (compact) {
    const menuItems = [
      { label: t('view'), value: 'view', icon: Eye, color: 'text-blue-600' },
      ...(status === 'pending' && onApprove
        ? [{ label: t('approve'), value: 'approve', icon: CheckCircle2, color: 'text-green-600' }]
        : []),
      ...(status === 'pending' && onReject
        ? [{ label: t('reject'), value: 'reject', icon: XCircle, color: 'text-red-600' }]
        : []),
      ...(onDownloadPdf
        ? [
            { label: `${t('downloadPdf')} (Đề)`, value: 'downloadPdfExam', icon: Download, color: 'text-purple-600' },
            { label: `${t('downloadPdf')} (Đáp án)`, value: 'downloadPdfAnswer', icon: Download, color: 'text-purple-600' },
          ]
        : []),
    ];

    return (
      <div className="relative flex justify-center" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:hover:bg-transparent"
          title={t('view')}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {isOpen && menuItems.length > 0 && (
          <div
            className="fixed mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[100]"
            style={{
              top: dropdownRef.current
                ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 4
                : 0,
              left: dropdownRef.current
                ? Math.min(
                    dropdownRef.current.getBoundingClientRect().right - 192,
                    window.innerWidth - 200,
                  )
                : 0,
            }}
          >
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    if (item.value === 'view') {
                      onView();
                    } else if (item.value === 'approve' && onApprove) {
                      onApprove();
                    } else if (item.value === 'reject' && onReject) {
                      onReject();
                    } else if (item.value === 'downloadPdfExam' && onDownloadPdf) {
                      onDownloadPdf('exam');
                    } else if (item.value === 'downloadPdfAnswer' && onDownloadPdf) {
                      onDownloadPdf('answer');
                    }
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onView}
        disabled={disabled}
        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent"
        title={t('view')}
      >
        <Eye className="w-4 h-4" />
      </Button>
      {status === 'pending' && onApprove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onApprove}
          disabled={disabled}
          className="text-gray-600 hover:text-green-600 hover:bg-green-50 disabled:text-gray-400 disabled:hover:bg-transparent"
          title={t('approve')}
        >
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      )}
      {status === 'pending' && onReject && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onReject}
          disabled={disabled}
          className="text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:hover:bg-transparent"
          title={t('reject')}
        >
          <XCircle className="w-4 h-4" />
        </Button>
      )}
      {onDownloadPdf && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownloadPdf('exam')}
            disabled={disabled}
            className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 disabled:text-gray-400 disabled:hover:bg-transparent"
            title={`${t('downloadPdf')} (Đề)`}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownloadPdf('answer')}
            disabled={disabled}
            className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 disabled:text-gray-400 disabled:hover:bg-transparent"
            title={`${t('downloadPdf')} (Đáp án)`}
          >
            <Download className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
};



