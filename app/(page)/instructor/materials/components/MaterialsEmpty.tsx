'use client';

import { memo } from 'react';
import { FileX } from 'lucide-react';

interface MaterialsEmptyProps {
  hasFilters: boolean;
}

const MaterialsEmptyComponent = ({ hasFilters }: MaterialsEmptyProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <FileX className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {hasFilters ? 'Không tìm thấy tài liệu' : 'Chưa có tài liệu'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {hasFilters
              ? 'Thử điều chỉnh bộ lọc để tìm thấy tài liệu phù hợp'
              : 'Hiện tại chưa có tài liệu nào được tải lên'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const MaterialsEmpty = memo(MaterialsEmptyComponent);

