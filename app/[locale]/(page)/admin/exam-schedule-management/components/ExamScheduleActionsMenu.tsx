'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/app/components/ui';
import type { ExamSchedule } from '../lib/types/types';

interface ExamScheduleActionsMenuProps {
  examSchedule: ExamSchedule;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onCancel: () => void;
  compact?: boolean;
}

export const ExamScheduleActionsMenu = ({
  examSchedule,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onCancel,
  compact = false,
}: ExamScheduleActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const canEdit = examSchedule.status === 'ready';
  const canCancel = examSchedule.status === 'ready' || examSchedule.status === 'published';
  const canPublish = examSchedule.status === 'ready';
  const canDelete = examSchedule.status !== 'published';

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
          <div
            className="fixed mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-[100]"
            style={{
              top: dropdownRef.current
                ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 4
                : 0,
              left: dropdownRef.current
                ? Math.min(
                    dropdownRef.current.getBoundingClientRect().right - 224,
                    window.innerWidth - 230
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
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                Xem chi tiết
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    onEdit();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 text-green-600" />
                  Cập nhật
                </button>
              )}
              {canPublish && (
                <button
                  onClick={() => {
                    onPublish();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Công bố lịch
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => {
                    onCancel();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <XCircle className="w-4 h-4 text-orange-600" />
                  Hủy lịch
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    onDelete();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  Xóa lịch
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
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="text-gray-600 hover:text-green-600 hover:bg-green-50"
          title="Cập nhật"
        >
          <Edit className="w-4 h-4" />
        </Button>
      )}
      {canPublish && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPublish}
          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          title="Công bố lịch"
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
      )}
      {canCancel && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-gray-600 hover:text-orange-600 hover:bg-orange-50"
          title="Hủy lịch"
        >
          <XCircle className="w-4 h-4" />
        </Button>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-gray-600 hover:text-red-600 hover:bg-red-50"
          title="Xóa lịch"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

