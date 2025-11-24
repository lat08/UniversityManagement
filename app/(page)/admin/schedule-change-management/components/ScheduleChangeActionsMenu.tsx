'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/app/components/ui';

interface ScheduleChangeActionsMenuProps {
  requestId: string;
  requestCode: string;
  status: string;
  onView: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onRevert?: () => void;
  compact?: boolean;
}

export const ScheduleChangeActionsMenu = ({
  onView,
  onApprove,
  onReject,
  onRevert,
  status,
  compact = false,
}: ScheduleChangeActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isPending = status?.toLowerCase() === 'pending';
  const canRevert = status?.toLowerCase() === 'approved' || status?.toLowerCase() === 'rejected';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      // Đóng dropdown khi scroll
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
          title="Thao tác"
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
                Xem chi tiết
              </button>
              {isPending && onApprove && (
                <button
                  onClick={() => {
                    onApprove();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Duyệt yêu cầu
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
                  Từ chối
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
                  Hoàn tác
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
        title="Xem chi tiết"
      >
        <Eye className="w-4 h-4" />
      </Button>
      {isPending && onApprove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onApprove}
          className="text-gray-600 hover:text-green-600 hover:bg-green-50"
          title="Duyệt yêu cầu"
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
          title="Từ chối"
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
          title="Hoàn tác"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

