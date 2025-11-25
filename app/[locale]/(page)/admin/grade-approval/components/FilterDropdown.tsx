'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Filter, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';

interface FilterDropdownProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

const FILTER_OPTIONS_DEFINITION = [
  { value: 'status', translationKey: 'filterDropdown.options.status', required: false },
  { value: 'semester', translationKey: 'filterDropdown.options.semester', required: false },
  { value: 'subject', translationKey: 'filterDropdown.options.subject', required: false },
  { value: 'courseClass', translationKey: 'filterDropdown.options.courseClass', required: false },
  { value: 'faculty', translationKey: 'filterDropdown.options.faculty', required: false },
  { value: 'department', translationKey: 'filterDropdown.options.department', required: false },
  { value: 'instructor', translationKey: 'filterDropdown.options.instructor', required: false },
];

export default function FilterDropdown({ selectedTypes, onTypesChange }: FilterDropdownProps) {
  const t = useTranslations('admin.gradeApproval');
  const filterOptions = useMemo(
    () =>
      FILTER_OPTIONS_DEFINITION.map((option) => ({
        ...option,
        label: t(option.translationKey),
      })),
    [t],
  );
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

  const handleToggle = (value: string, required: boolean) => {
    if (required) return;

    if (selectedTypes.includes(value)) {
      onTypesChange(selectedTypes.filter((t) => t !== value));
    } else {
      onTypesChange([...selectedTypes, value]);
    }
  };

  const selectedCount = selectedTypes.length;
  const selectedLabels = filterOptions
    .filter((opt) => selectedTypes.includes(opt.value))
    .map((opt) => opt.label)
    .join(', ');

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        title={t('filterDropdown.buttonTitle', { count: selectedCount })}
        className="h-10 whitespace-nowrap"
      >
        <Filter className="w-4 h-4 mr-2" />
        {t('filterDropdown.buttonLabel', { count: selectedCount })}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              {t('filterDropdown.title', { selected: selectedCount, total: filterOptions.length })}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{selectedLabels || t('filterDropdown.empty')}</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filterOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer ${
                  option.required ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(option.value)}
                    onChange={() => handleToggle(option.value, option.required)}
                    disabled={option.required}
                    className="w-4 h-4 text-[#0053AD] border-gray-300 rounded focus:ring-[#0053AD] disabled:cursor-not-allowed"
                  />
                  {selectedTypes.includes(option.value) && (
                    <Check className="w-3 h-3 text-white absolute left-0.5 top-0.5 pointer-events-none" />
                  )}
                </div>
                <span className="text-sm text-gray-700 flex-1">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
