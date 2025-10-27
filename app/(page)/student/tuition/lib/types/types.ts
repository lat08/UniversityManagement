export interface TuitionFee {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  amount: number;
  outstanding: number;
  status: 'paid' | 'unpaid' | 'partial';
}

export interface Insurance {
  id: string;
  insuranceCode: string;
  insuranceName: string;
  validPeriod: string;
  amount: number;
  outstanding: number;
  status: 'paid' | 'unpaid';
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
}

export type TabType = 'tuition' | 'insurance' | 'history';
