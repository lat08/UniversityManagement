export const formatDate = (date: string | Date | null): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date | null): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatGender = (gender: string): string => {
  switch (gender?.toLowerCase()) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Khác";
    default:
      return "";
  }
};

export const formatEnrollmentStatus = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "active":
      return "Đang học";
    case "suspended":
      return "Tạm ngưng";
    case "graduated":
      return "Đã tốt nghiệp";
    case "withdrawn":
      return "Thôi học";
    default:
      return status || "";
  }
};