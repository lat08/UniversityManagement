'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import { ApprovalStatus } from '../lib/types/types';

interface GradeApprovalActionsMenuProps {
  gradeApprovalId: string;
  versionStatus: ApprovalStatus;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  compact?: boolean;
  disabled?: boolean;
}

export default function GradeApprovalActionsMenu({
  versionStatus,
  onView,
  onApprove,
  onReject,
  compact = false,
  disabled = false,
}: GradeApprovalActionsMenuProps) {
  const t = useTranslations('admin.gradeApproval');
  const canApproveOrReject = versionStatus === 'pending';
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
    return (
      <div className="relative flex justify-center" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:hover:bg-transparent"
          title={t('actionsMenu.title')}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {isOpen && (
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
              <button
                onClick={() => {
                  onView();
                  setIsOpen(false);
                }}
                disabled={disabled}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                {t('actionsMenu.view')}
              </button>
              {canApproveOrReject && (
                <>
                  <button
                    onClick={() => {
                      onApprove();
                      setIsOpen(false);
                    }}
                    disabled={disabled}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {t('actionsMenu.approve')}
                  </button>
                  <button
                    onClick={() => {
                      onReject();
                      setIsOpen(false);
                    }}
                    disabled={disabled}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    {t('actionsMenu.reject')}
                  </button>
                </>
              )}
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
        title={t('actionsMenu.view')}
      >
        <Eye className="w-4 h-4" />
      </Button>
      {canApproveOrReject && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onApprove}
            disabled={disabled}
            className="text-gray-600 hover:text-green-600 hover:bg-green-50 disabled:text-gray-400 disabled:hover:bg-transparent"
            title={t('actionsMenu.approve')}
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReject}
            disabled={disabled}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:hover:bg-transparent"
            title={t('actionsMenu.reject')}
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}

