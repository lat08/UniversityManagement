export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
}

export const formatDate = (dateString: string): string => {
  return dateString
}

export const formatPaymentMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    'Chuyển khoản': 'Chuyển khoản',
    'Tiền mặt': 'Tiền mặt',
    'Thẻ tín dụng': 'Thẻ tín dụng',
    'Ví điện tử': 'Ví điện tử'
  }
  return methodMap[method] || method
}

export const formatPaymentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'Đã thanh toán': 'Đã thanh toán',
    'Đang xử lý': 'Đang xử lý',
    'Thất bại': 'Thất bại',
    'Hoàn tiền': 'Hoàn tiền'
  }
  return statusMap[status] || status
}
