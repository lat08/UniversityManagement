export interface StatusDisplay {
  label: string;
  color: string;
}

export const getPaymentStatusDisplay = (status: string): StatusDisplay => {
  const statusMap: Record<string, StatusDisplay> = {
    completed: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700' },
    paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700' },
    pending: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700' },
    failed: { label: 'Thất bại', color: 'bg-red-100 text-red-700' },
    partial: { label: 'Thanh toán một phần', color: 'bg-blue-100 text-blue-700' },
  };

  const normalizedStatus = status.toLowerCase();
  return statusMap[normalizedStatus] || { label: 'Chưa thanh toán', color: 'bg-red-100 text-red-700' };
};

export const getStatusText = (status: string): string => {
  return getPaymentStatusDisplay(status).label;
};

export const getStatusColor = (status: string): string => {
  return getPaymentStatusDisplay(status).color;
};

