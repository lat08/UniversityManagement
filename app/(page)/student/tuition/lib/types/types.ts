export type TabType = 'tuition' | 'insurance' | 'history';

export interface TuitionFee {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  courseFee: number;
  status: string;
}

export interface Insurance {
  academicYear: string;
  studentHealthInsuranceId: string;
  healthInsuranceFee: number;
  status: string;
}

export interface Payment {
  paymentDate: string;
  amountPaid: number;
  note: string;
  paymentMethod: string;
  status: string;
}

export interface TuitionFeeResponse {
  success: boolean;
  message: string;
  data: {
    semesterId: string;
    semesterName: string;
    courses: TuitionFee[];
  };
  errors: string[];
}

export interface InsuranceResponse {
  success: boolean;
  message: string;
  data: Insurance[];
  errors: string[];
}

export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: Payment[];
  errors: string[];
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: string;
  errors: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface PaymentHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Semester {
  semesterId: string;
  semesterName: string;
  courses?: TuitionFee[];
}
