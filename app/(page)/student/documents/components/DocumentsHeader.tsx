'use client';

import { memo } from 'react';

interface DocumentsHeaderProps {
  title?: string;
  subtitle?: string;
}

const DocumentsHeaderComponent = ({
  title = 'Tài liệu',
  subtitle = 'Tham khảo tài liệu cho sinh viên',
}: DocumentsHeaderProps) => {
  return (
    <header className="space-y-2">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-xs lg:text-sm text-gray-600 mt-1">{subtitle}</p>
    </header>
  );
};

export const DocumentsHeader = memo(DocumentsHeaderComponent);

