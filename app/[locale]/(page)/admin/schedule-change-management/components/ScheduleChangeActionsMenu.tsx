'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, CheckCircle2, XCircle, RotateCcw, Edit2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';

interface ScheduleChangeActionsMenuProps {
  requestId: string;
  requestCode: string;
  status: string;
  onView: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onRevert?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

export const ScheduleChangeActionsMenu = ({
  onView,
  onApprove,
  onReject,
  onRevert,
  onEdit,
  status,
  compact = false,
}: ScheduleChangeActionsMenuProps) => {
  const t = useTranslations('admin.scheduleChangeManagement.actions');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isPending = status?.toLowerCase() === 'pending';
  const isApproved = status?.toLowerCase() === 'approved';
  const canRevert = status?.toLowerCase() === 'approved' || status?.toLowerCase() === 'rejected';
  const canEdit = isPending || isApproved;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true); // true để capture scroll events trong tất cả containers
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  if (compact) {
    return (
      <div className="relative flex justify-center">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-gray-900"
          title={t('actions')}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {isOpen && buttonRef.current && (
          <div 
            ref={dropdownRef}
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[100]"
            style={{
              top: buttonRef.current.getBoundingClientRect().bottom + 4,
              left: Math.min(
                buttonRef.current.getBoundingClientRect().right - 192,
                window.innerWidth - 200
              ),
            }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onView();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                {t('view')}
              </button>
              {canEdit && onEdit && (
                <button
                  onClick={() => {
                    onEdit();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4 text-purple-600" />
                  {t('edit')}
                </button>
              )}
              {isPending && onApprove && (
                <button
                  onClick={() => {
                    onApprove();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {t('approve')}
                </button>
              )}
              {isPending && onReject && (
                <button
                  onClick={() => {
                    onReject();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  {t('reject')}
                </button>
              )}
              {canRevert && onRevert && (
                <button
                  onClick={() => {
                    onRevert();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4 text-yellow-600" />
                  {t('revert')}
                </button>
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
        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        title={t('view')}
      >
        <Eye className="w-4 h-4" />
      </Button>
      {canEdit && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
          title={t('edit')}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      )}
      {isPending && onApprove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onApprove}
          className="text-gray-600 hover:text-green-600 hover:bg-green-50"
          title={t('approve')}
        >
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      )}
      {isPending && onReject && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onReject}
          className="text-gray-600 hover:text-red-600 hover:bg-red-50"
          title={t('reject')}
        >
          <XCircle className="w-4 h-4" />
        </Button>
      )}
      {canRevert && onRevert && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRevert}
          className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
          title={t('revert')}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

