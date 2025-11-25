'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { FileX } from 'lucide-react';

interface MaterialsEmptyProps {
  hasFilters: boolean;
}

const MaterialsEmptyComponent = ({ hasFilters }: MaterialsEmptyProps) => {
  const t = useTranslations('instructor.materials.empty');
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <FileX className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {hasFilters ? t('noResults') : t('noDocuments')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {hasFilters ? t('noResultsDescription') : t('noDocumentsDescription')}
          </p>
        </div>
      </div>
    </div>
  );
};

export const MaterialsEmpty = memo(MaterialsEmptyComponent);

