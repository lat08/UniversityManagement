'use client';

import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DocumentsErrorProps {
  error: string;
  onRetry: () => void;
}

const DocumentsErrorComponent = ({ error, onRetry }: DocumentsErrorProps) => {
  const t = useTranslations('student.documents.error');

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900">{t('title')}</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <button 
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DocumentsError = memo(DocumentsErrorComponent);

