'use client';

import { useState, useRef, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { DayPicker, type Matcher } from 'react-day-picker';
import { Calendar } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string; // Format: YYYY-MM-DD
  maxDate?: string; // Format: YYYY-MM-DD
  locale?: string;
  disabled?: boolean;
  label?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  minDate,
  maxDate,
  locale = 'vi',
  disabled = false,
  label,
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('');
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const dateLocale = locale === 'vi' ? vi : enUS;

  // Convert YYYY-MM-DD to Date object
  const selectedDate = value ? new Date(value) : undefined;

  // Convert Date to display format (dd/mm/yyyy)
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (isValid(date)) {
        setDateInputValue(format(date, 'dd/MM/yyyy'));
      }
    } else {
      setDateInputValue('');
    }
  }, [value]);

  // Calculate calendar position when opened
  useEffect(() => {
    if (showCalendar && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const calendarWidth = 320; // Approximate width of calendar
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calculate left position
      let left = rect.left;
      
      // If calendar would overflow right edge, align to right
      if (left + calendarWidth > windowWidth - 20) {
        left = rect.right - calendarWidth;
      }
      
      // Ensure it doesn't overflow left edge
      if (left < 20) {
        left = 20;
      }
      
      // Calculate top position
      let top = rect.bottom + 8;
      
      // If calendar would overflow bottom, show above input
      if (top + 350 > windowHeight) {
        top = rect.top - 350 - 8;
      }
      
      setCalendarPosition({ top, left });
    }
  }, [showCalendar]);

  // Handle click outside calendar and scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current && 
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    const handleScroll = () => {
      if (showCalendar && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const calendarWidth = 320;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = rect.left;
        if (left + calendarWidth > windowWidth - 20) {
          left = rect.right - calendarWidth;
        }
        if (left < 20) {
          left = 20;
        }
        
        let top = rect.bottom + 8;
        if (top + 350 > windowHeight) {
          top = rect.top - 350 - 8;
        }
        
        setCalendarPosition({ top, left });
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showCalendar]);

  // Handle manual date input
  const handleDateInputChange = (input: string) => {
    // Allow only numbers and slashes
    const cleaned = input.replace(/[^\d/]/g, '');
    
    // Auto-insert slashes
    let formatted = cleaned;
    if (cleaned.length >= 2 && !cleaned.includes('/')) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5 && cleaned.split('/').length === 2) {
      const parts = cleaned.split('/');
      formatted = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2);
    }
    
    setDateInputValue(formatted);

    // Try to parse the date when it's complete
    if (formatted.length === 10) {
      try {
        const parsedDate = parse(formatted, 'dd/MM/yyyy', new Date());
        if (isValid(parsedDate)) {
          // Convert to YYYY-MM-DD format
          const isoDate = format(parsedDate, 'yyyy-MM-dd');
          onChange(isoDate);
        }
      } catch {
        console.error('Invalid date format');
      }
    }
  };

  // Handle calendar selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      // Convert to YYYY-MM-DD format
      const isoDate = format(date, 'yyyy-MM-dd');
      onChange(isoDate);
      setDateInputValue(format(date, 'dd/MM/yyyy'));
      setShowCalendar(false);
    }
  };

  // Build disabled matcher
  const getDisabledMatcher = (): Matcher | Matcher[] | undefined => {
    const matchers: Matcher[] = [];

    if (minDate) {
      matchers.push({ before: new Date(minDate) });
    }

    if (maxDate) {
      matchers.push({ after: new Date(maxDate) });
    }

    if (matchers.length === 0) return undefined;
    if (matchers.length === 1) return matchers[0];
    return matchers;
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Calendar className="w-4 h-4 inline mr-1.5" />
          {label}
        </label>
      )}
      <div className="relative" ref={inputRef}>
        <input
          type="text"
          value={dateInputValue}
          onChange={(e) => handleDateInputChange(e.target.value)}
          onFocus={() => !disabled && setShowCalendar(true)}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          onKeyDown={(e) => {
            if (!/[0-9/]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
              e.preventDefault();
            }
          }}
        />
        <button
          type="button"
          onClick={() => !disabled && setShowCalendar(!showCalendar)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calendar className="h-5 w-5" />
        </button>
      </div>

      {showCalendar && (
        <div 
          ref={calendarRef}
          className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-3"
          style={{
            top: `${calendarPosition.top}px`,
            left: `${calendarPosition.left}px`,
          }}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            disabled={getDisabledMatcher()}
            locale={dateLocale}
            classNames={{
              day_selected: 'bg-[#0053AD] text-white hover:bg-[#003d82]',
              day_today: 'bg-[#0053AD]/20 text-[#0053AD] font-semibold',
              day_disabled: 'text-gray-300 cursor-not-allowed',
              day: 'hover:bg-gray-100 rounded cursor-pointer',
            }}
          />
        </div>
      )}
    </div>
  );
}

