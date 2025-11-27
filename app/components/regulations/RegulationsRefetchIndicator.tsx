'use client';

export const RegulationsRefetchIndicator = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>Đang làm mới dữ liệu...</span>
    </div>
  );
};
