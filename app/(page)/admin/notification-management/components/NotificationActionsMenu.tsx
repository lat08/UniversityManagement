'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Send, Archive, XCircle, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui';
import type { Notification, NotificationStatus } from '../lib/types/types';

interface NotificationActionsMenuProps {
  notification: Notification;
  onView?: () => void;
  onEdit?: () => void;
  onSend?: () => void;
  onArchive?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export const NotificationActionsMenu = ({
  notification,
  onView,
  onEdit,
  onSend,
  onArchive,
  onCancel,
  compact = false,
}: NotificationActionsMenuProps) => {
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

  const canEdit = notification.status === 'pending';
  const canSend = notification.status === 'pending';
  const canArchive = notification.status !== 'cancelled' && notification.isActive;
  const canCancel = notification.status === 'pending';

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
              {onView && (
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
              )}
              {canEdit && onEdit && (
                <button
                  onClick={() => {
                    onEdit();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 text-green-600" />
                  Chỉnh sửa
                </button>
              )}
              {canSend && onSend && (
                <button
                  onClick={() => {
                    onSend();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Send className="w-4 h-4 text-blue-600" />
                  Gửi
                </button>
              )}
              {canCancel && onCancel && (
                <button
                  onClick={() => {
                    onCancel();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  Hủy
                </button>
              )}
              {canArchive && onArchive && (
                <button
                  onClick={() => {
                    onArchive();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Archive className="w-4 h-4 text-gray-600" />
                  Lưu trữ
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
      {onView && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onView}
          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}
      {canEdit && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="text-gray-600 hover:text-green-600 hover:bg-green-50"
          title="Chỉnh sửa"
        >
          <Edit className="w-4 h-4" />
        </Button>
      )}
      {canSend && onSend && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSend}
          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          title="Gửi"
        >
          <Send className="w-4 h-4" />
        </Button>
      )}
      {canCancel && onCancel && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-gray-600 hover:text-red-600 hover:bg-red-50"
          title="Hủy"
        >
          <XCircle className="w-4 h-4" />
        </Button>
      )}
      {canArchive && onArchive && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onArchive}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          title="Lưu trữ"
        >
          <Archive className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

