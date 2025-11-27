'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, Edit, Bell, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';

interface TuitionDebtActionsMenuProps {
  readonly onView: () => void;
  readonly onEdit: () => void;
  readonly onCreateReminder: () => void;
}

export const TuitionDebtActionsMenu = ({
  onView,
  onEdit,
  onCreateReminder,
}: TuitionDebtActionsMenuProps) => {
  const t = useTranslations('admin.tuition');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div className="relative flex justify-center" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-gray-600 hover:text-gray-900"
        title={t('actions.menu')}
        type="button"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          className="fixed z-[100] mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg"
          style={{
            top: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().bottom + 4
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
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              type="button"
            >
              <Eye className="h-4 w-4 text-blue-600" />
              {t('actions.viewDetail')}
            </button>
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              type="button"
            >
              <Edit className="h-4 w-4 text-green-600" />
              {t('actions.edit')}
            </button>
            <button
              onClick={() => {
                onCreateReminder();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              type="button"
            >
              <Bell className="h-4 w-4 text-orange-600" />
              {t('actions.createReminder')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};




