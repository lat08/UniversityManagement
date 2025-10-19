import { BankInfo, DirectPaymentInfo, TuitionData, PaymentHistoryItem } from '../types/types'

export const bankInfo: BankInfo = {
  bank: "Vietcombank - Chi nhánh TP.HCM",
  accountNumber: "1234567890",
  accountHolder: "Trường Đại học Quốc tế Sài Gòn",
  content: "HOCPHI - [MSSV] - [HỌ TÊN]"
}

export const directPaymentInfo: DirectPaymentInfo = {
  address: "Tầng 1, Tòa nhà A - Thứ 2 đến Thứ 6, 8:00 - 17:00"
}

export const tuitionData: TuitionData = {
  semester: "HK2 2024-2025",
  originalFee: 15000000,
  discount: -2000000,
  payableFee: 13000000,
  paid: 8000000,
  outstanding: 5000000,
  dueDate: "20/02/2025"
}

export const paymentHistory: PaymentHistoryItem[] = [
  {
    date: "15/01/2025",
    content: "Đóng học phí HK2 2024-2025 (Đợt 1)",
    amount: 8000000,
    method: "Chuyển khoản",
    status: "Đã thanh toán"
  },
  {
    date: "10/09/2024",
    content: "Đóng học phí HK1 2024-2025",
    amount: 13000000,
    method: "Tiền mặt",
    status: "Đã thanh toán"
  },
  {
    date: "15/02/2024",
    content: "Đóng học phí HK2 2023-2024",
    amount: 12500000,
    method: "Chuyển khoản",
    status: "Đã thanh toán"
  }
]
