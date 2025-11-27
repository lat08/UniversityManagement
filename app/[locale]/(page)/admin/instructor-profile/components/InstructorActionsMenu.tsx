"use client";

import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';

interface InstructorActionsMenuProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function InstructorActionsMenu({ onView, onEdit, onDelete }: InstructorActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.instructorProfile.actionsMenu');

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
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div className="relative flex justify-center" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-gray-900"
        title={t('title')}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div
          className="fixed mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-[100]"
          style={{
            top: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().bottom + 4
              : 0,
            left: dropdownRef.current
              ? Math.min(
                  dropdownRef.current.getBoundingClientRect().right - 160,
                  window.innerWidth - 180
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
              {t('view')}
            </button>
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 text-green-600" />
              {t('edit')}
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              {t('delete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}