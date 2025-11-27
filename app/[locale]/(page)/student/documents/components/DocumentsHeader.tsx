'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';

interface DocumentsHeaderProps {
  title?: string;
  subtitle?: string;
}

const DocumentsHeaderComponent = ({
  title,
  subtitle,
}: DocumentsHeaderProps) => {
  const t = useTranslations('student.documents.header');

  return (
    <header className="space-y-2">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
        {title ?? t('title')}
      </h1>
      <p className="text-xs lg:text-sm text-gray-600 mt-1">
        {subtitle ?? t('subtitle')}
      </p>
    </header>
  );
};

export const DocumentsHeader = memo(DocumentsHeaderComponent);

