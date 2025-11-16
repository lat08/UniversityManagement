'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/app/components/ui';

interface GradeApprovalActionsMenuProps {
  gradeApprovalId: string;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  compact?: boolean;
}

export default function GradeApprovalActionsMenu({
  onView,
  onApprove,
  onReject,
  compact = false,
}: GradeApprovalActionsMenuProps) {
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
          className="text-gray-600 hover:text-gray-900"
          title="Thao tác"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {isOpen && (
          <div className="fixed mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[100]"
            style={{
              top: dropdownRef.current ? 
                dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
              left: dropdownRef.current ? 
                Math.min(
                  dropdownRef.current.getBoundingClientRect().right - 192,
                  window.innerWidth - 200
                ) : 0,
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
              <button
                onClick={() => {
                  onApprove();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                Duyệt
              </button>
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
      <Button
        variant="ghost"
        size="icon"
        onClick={onApprove}
        className="text-gray-600 hover:text-green-600 hover:bg-green-50"
        title="Duyệt"
      >
        <CheckCircle className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onReject}
        className="text-gray-600 hover:text-red-600 hover:bg-red-50"
        title="Từ chối"
      >
        <XCircle className="w-4 h-4" />
      </Button>
    </div>
  );
}

