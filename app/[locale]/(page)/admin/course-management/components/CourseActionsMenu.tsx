'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Eye, Trash2, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { useTranslations } from 'next-intl';

interface CourseActionsMenuProps {
  courseId: string;
  courseName: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateCourseClass?: () => void;
  compact?: boolean;
}

export const CourseActionsMenu = ({
  onView,
  onEdit,
  onDelete,
  onCreateCourseClass,
  compact = false,
}: CourseActionsMenuProps) => {
  const t = useTranslations('admin.courseManagement');
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

  if (compact) {
    return (
      <div className="relative flex justify-center" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-gray-900"
          title={t('actions.openMenu')}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {isOpen && (
          <div
            className="fixed mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[100]"
            style={{
              top: dropdownRef.current
                ? dropdownRef.current.getBoundingClientRect().bottom + 4
                : 0,
              left: dropdownRef.current
                ? Math.min(
                    dropdownRef.current.getBoundingClientRect().right - 192,
                    window.innerWidth - 200
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
                {t('actions.viewDetails')}
              </button>
              <button
                onClick={() => {
                  onEdit();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 text-green-600" />
                {t('actions.editCourse')}
              </button>
              {onCreateCourseClass && (
              <button
                onClick={() => {
                    onCreateCourseClass();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                  <Plus className="w-4 h-4 text-blue-600" />
                  {t('actions.createCourseClass')}
              </button>
              )}
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                {t('actions.deleteCourse')}
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
        title={t('actions.viewDetails')}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="text-gray-600 hover:text-green-600 hover:bg-green-50"
        title={t('actions.editCourse')}
      >
        <Edit className="w-4 h-4" />
      </Button>
      {onCreateCourseClass && (
      <Button
        variant="ghost"
        size="icon"
          onClick={onCreateCourseClass}
        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          title={t('actions.createCourseClass')}
      >
          <Plus className="w-4 h-4" />
      </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-gray-600 hover:text-red-600 hover:bg-red-50"
        title={t('actions.deleteCourse')}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
