export const PAYMENT_METHODS = [
  { value: "Chuyển khoản", label: "Chuyển khoản", icon: "🏦" },
  { value: "Tiền mặt", label: "Tiền mặt", icon: "💵" },
  { value: "Thẻ tín dụng", label: "Thẻ tín dụng", icon: "💳" },
  { value: "Ví điện tử", label: "Ví điện tử", icon: "📱" }
] as const

export const PAYMENT_STATUS = [
  { value: "Đã thanh toán", label: "Đã thanh toán", color: "green" },
  { value: "Đang xử lý", label: "Đang xử lý", color: "yellow" },
  { value: "Thất bại", label: "Thất bại", color: "red" },
  { value: "Hoàn tiền", label: "Hoàn tiền", color: "blue" }
] as const

export const TUITION_STATUS = {
  PAID: "Đã đóng",
  PARTIAL: "Đóng một phần", 
  OVERDUE: "Quá hạn",
  PENDING: "Chưa đóng"
} as const

export const PAYMENT_DEADLINE_WARNING = {
  OVERDUE: "Quá hạn đóng học phí",
  WARNING: "Sắp đến hạn đóng học phí",
  NORMAL: "Trong thời gian đóng học phí"
} as const
