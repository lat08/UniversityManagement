export interface BankInfo {
  bank: string
  accountNumber: string
  accountHolder: string
  content: string
}

export interface DirectPaymentInfo {
  address: string
}

export interface TuitionData {
  semester: string
  originalFee: number
  discount: number
  payableFee: number
  paid: number
  outstanding: number
  dueDate: string
}

export interface PaymentHistoryItem {
  date: string
  content: string
  amount: number
  method: string
  status: string
}
