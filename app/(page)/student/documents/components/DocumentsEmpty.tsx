'use client';

interface DocumentsEmptyProps {
  hasFilters: boolean;
}

export const DocumentsEmpty = ({ hasFilters }: DocumentsEmptyProps) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <p className="text-gray-600">
        {hasFilters 
          ? 'Không tìm thấy tài liệu phù hợp.' 
          : 'Chưa có tài liệu nào được chia sẻ.'}
      </p>
    </div>
  );
};

