export const getEmploymentStatusDisplay = (status: string) => {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: 'Đang công tác', color: 'bg-green-100 text-green-700' },
    on_leave: { label: 'Nghỉ phép', color: 'bg-yellow-100 text-yellow-700' },
    retired: { label: 'Nghỉ hưu', color: 'bg-gray-100 text-gray-700' },
    inactive: { label: 'Ngưng công tác', color: 'bg-red-100 text-red-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
};