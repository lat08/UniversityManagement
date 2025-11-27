export interface TuitionDebtItem {
  studentCode: string;
  fullName: string;
  major: string;
  className: string;
  totalFee: number;
  paid: number;
  debt: number;
  status: string;
  deadline: string | null;
}

export interface TuitionDebtStatistics {
  totalFee: number;
  totalPaid: number;
  totalDebt: number;
  overdue: number;
}

export interface RegisteredSubject {
  subjectCode: string;
  subjectName: string;
  credits: number;
  fee: number;
}

export interface PaymentHistory {
  paidAt: string;
  amount: number;
  method: string;
  transactionCode: string;
  confirmedBy: string;
}

export interface TuitionDebtDetail {
  studentCode: string;
  fullName: string;
  className: string;
  major: string;
  semesterId: string;
  totalCredits: number;
  feePerCredit: number;
  totalFee: number;
  paid: number;
  debt: number;
  status: string;
  registeredSubjects: RegisteredSubject[];
  paymentHistory: PaymentHistory[];
}

export interface StudentDebtBySemester {
  semesterId: string;
  semesterName: string;
  academicYear: string;
  totalCredits: number;
  feePerCredit: number;
  totalFee: number;
  paid: number;
  debt: number;
  status: string;
  registeredSubjects: RegisteredSubject[];
  paymentHistory: PaymentHistory[];
}

export interface StudentDebtByCode {
  studentCode: string;
  fullName: string;
  className: string;
  major: string;
  totalFee: number;
  totalPaid: number;
  totalDebt: number;
  semesters: StudentDebtBySemester[];
}

export interface TuitionDebtFilter {
  semesterId: string;
  search?: string;
  classId?: string;
  departmentId?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface TuitionDebtResponse {
  statistics: TuitionDebtStatistics;
  data: PaginatedResult<TuitionDebtItem>;
}






