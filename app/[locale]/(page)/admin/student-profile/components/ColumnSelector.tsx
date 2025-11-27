'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings2, Check } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { useTranslations } from 'next-intl';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean;
}

interface ColumnSelectorProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export default function ColumnSelector({ columns, onColumnsChange }: ColumnSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.studentProfile.columnSelector');

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

  const handleToggleColumn = (key: string) => {
    const updatedColumns = columns.map(col =>
      col.key === key && !col.required ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updatedColumns);
  };

  const visibleCount = columns.filter(col => col.visible).length;

  return (
    <div className="relative h-full" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        title={t('tooltip', { visible: visibleCount, total: columns.length })}
        className="h-full flex items-center justify-center px-3"
      >
        <Settings2 className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              {t('title', { visible: visibleCount, total: columns.length })}
            </h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {columns.map((column) => (
              <label
                key={column.key}
                className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer ${
                  column.required ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => handleToggleColumn(column.key)}
                    disabled={column.required}
                    className="w-4 h-4 text-[#0053AD] border-gray-300 rounded focus:ring-[#0053AD] disabled:cursor-not-allowed"
                  />
                  {column.visible && (
                    <Check className="w-3 h-3 text-white absolute left-0.5 top-0.5 pointer-events-none" />
                  )}
                </div>
                <span className="text-sm text-gray-700 flex-1">
                  {column.label}
                  {column.required && (
                    <span className="text-xs text-gray-500 ml-1">
                      {t('required')}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
