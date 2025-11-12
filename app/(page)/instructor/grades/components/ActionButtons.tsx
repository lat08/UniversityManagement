'use client';

import { FileDown, Send, History } from 'lucide-react';

interface ActionButtonsProps {
  showHistory: boolean;
  onToggleHistory: () => void;
  showExportDropdown: boolean;
  onToggleExportDropdown: () => void;
  onExport: (type: 'draft' | 'official') => void;
  onSubmitForApproval: () => void;
  canEditGrades: boolean;
  isExporting: boolean;
  isSubmitting: boolean;
  hasSelectedClass: boolean;
}

export const ActionButtons = ({
  showHistory,
  onToggleHistory,
  showExportDropdown,
  onToggleExportDropdown,
  onExport,
  onSubmitForApproval,
  canEditGrades,
  isExporting,
  isSubmitting,
  hasSelectedClass,
}: ActionButtonsProps) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={onToggleHistory}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <History className="w-4 h-4" />
        {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
      </button>
      
      <div className="relative">
        <button
          onClick={onToggleExportDropdown}
          disabled={!hasSelectedClass || isExporting}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileDown className="w-4 h-4" />
          {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
        </button>
        
        {showExportDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={onToggleExportDropdown}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <button
                onClick={() => onExport('draft')}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors cursor-pointer"
              >
                Bản nháp
              </button>
              <button
                onClick={() => onExport('official')}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors cursor-pointer"
              >
                Bản chính thức
              </button>
            </div>
          </>
        )}
      </div>
      
      <button
        onClick={onSubmitForApproval}
        disabled={!canEditGrades || isSubmitting}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
          !canEditGrades || isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
        }`}
      >
        <Send className="w-4 h-4" />
        Gửi duyệt
      </button>
    </div>
  );
};
