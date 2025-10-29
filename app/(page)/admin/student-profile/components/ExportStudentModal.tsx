'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';

interface ExportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportStudentModal({ isOpen, onClose }: ExportStudentModalProps) {
  const [exportOptions, setExportOptions] = useState({
    allStudents: false,
    activeStudents: false,
    byMajor: false,
  });
  const [fileFormat, setFileFormat] = useState('Excel (.xlsx)');
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownPositionRef = useRef<{ top: number; left: number; width: number } | null>(null);

  // Calculate dropdown position
  useEffect(() => {
    if (isFormatOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      dropdownPositionRef.current = {
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      };
    }
  }, [isFormatOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsFormatOpen(false);
      }
    };

    if (isFormatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFormatOpen]);

  const fileFormats = ['Excel (.xlsx)', 'CSV (.csv)', 'PDF (.pdf)'];

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle export
    console.log('Export options:', exportOptions, 'Format:', fileFormat);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Xuất danh sách sinh viên</h2>
            <p className="text-sm text-gray-600 mt-1">Chọn các tùy chọn xuất dữ liệu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleExport} className="p-6 flex-1 overflow-y-auto">
          {/* Export Options */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-900 mb-4">
              Chọn dữ liệu cần xuất
            </label>
            <div className="space-y-3">
              {/* Tất cả sinh viên */}
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportOptions.allStudents}
                  onChange={(e) =>
                    setExportOptions({ ...exportOptions, allStudents: e.target.checked })
                  }
                  className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#0053AD] checked:border-[#0053AD] focus:ring-2 focus:ring-[#0053AD] focus:ring-offset-2"
                />
                <span className="ml-3 text-base text-gray-900 group-hover:text-gray-700">
                  Tất cả sinh viên
                </span>
              </label>

              {/* Chỉ sinh viên đang học */}
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportOptions.activeStudents}
                  onChange={(e) =>
                    setExportOptions({ ...exportOptions, activeStudents: e.target.checked })
                  }
                  className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#0053AD] checked:border-[#0053AD] focus:ring-2 focus:ring-[#0053AD] focus:ring-offset-2"
                />
                <span className="ml-3 text-base text-gray-900 group-hover:text-gray-700">
                  Chỉ sinh viên đang học
                </span>
              </label>

              {/* Theo ngành học */}
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportOptions.byMajor}
                  onChange={(e) =>
                    setExportOptions({ ...exportOptions, byMajor: e.target.checked })
                  }
                  className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#0053AD] checked:border-[#0053AD] focus:ring-2 focus:ring-[#0053AD] focus:ring-offset-2"
                />
                <span className="ml-3 text-base text-gray-900 group-hover:text-gray-700">
                  Theo ngành học
                </span>
              </label>
            </div>
          </div>

          {/* File Format */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-900 mb-3">
              Định dạng file
            </label>
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                onClick={() => setIsFormatOpen(!isFormatOpen)}
              >
                <span className="text-base text-gray-900">{fileFormat}</span>
                <ChevronDown className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-8 py-3 text-base text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
            >
              Xuất file
            </button>
          </div>
        </form>
      </div>
      {/* Dropdown Portal */}
      {isFormatOpen &&
        dropdownPositionRef.current &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{
              top: `${dropdownPositionRef.current.top}px`,
              left: `${dropdownPositionRef.current.left}px`,
              width: `${dropdownPositionRef.current.width}px`,
            }}
          >
            {fileFormats.map((format) => (
              <button
                key={format}
                type="button"
                className="w-full text-left px-4 py-3 text-base text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                onClick={() => {
                  setFileFormat(format);
                  setIsFormatOpen(false);
                }}
              >
                {format}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

