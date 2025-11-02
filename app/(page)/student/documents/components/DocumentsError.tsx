'use client';

import { AlertTriangle } from 'lucide-react';
import { DocumentsHeader } from './DocumentsHeader';

interface DocumentsErrorProps {
  error: string;
  onRetry: () => void;
}

export const DocumentsError = ({ error, onRetry }: DocumentsErrorProps) => {
  return (
    <div className="space-y-4 lg:space-y-6">
      <DocumentsHeader />
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Không thể tải dữ liệu</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button 
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

