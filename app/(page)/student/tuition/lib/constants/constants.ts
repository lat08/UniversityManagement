import { TuitionFee, Insurance, PaymentHistory, Semester } from '../types/types';

// Mock semesters data
export const MOCK_SEMESTERS: Semester[] = [
  {
    semesterId: '1',
    semesterName: 'Học kỳ II - Năm học 2024 - 2025',
  },
  {
    semesterId: '2',
    semesterName: 'Học kỳ I - Năm học 2024 - 2025',
  },
  {
    semesterId: '3',
    semesterName: 'Học kỳ III - Năm học 2023 - 2024',
  },
];

// Mock tuition fees data
export const MOCK_TUITION_FEES: TuitionFee[] = [
  {
    id: '1',
    courseCode: 'CS101',
    courseName: 'Lập trình cơ bản',
    credits: 3,
    amount: 1700000,
    outstanding: 1700000,
    status: 'unpaid',
  },
  {
    id: '2',
    courseCode: 'CS102',
    courseName: 'Cơ sở dữ liệu',
    credits: 3,
    amount: 1700000,
    outstanding: 1700000,
    status: 'unpaid',
  },
  {
    id: '3',
    courseCode: 'CS103',
    courseName: 'Cấu trúc dữ liệu và GT',
    credits: 3,
    amount: 1700000,
    outstanding: 1700000,
    status: 'unpaid',
  },
  {
    id: '4',
    courseCode: 'CS104',
    courseName: 'Học máy',
    credits: 3,
    amount: 1700000,
    outstanding: 1700000,
    status: 'unpaid',
  },
  {
    id: '5',
    courseCode: 'CS105',
    courseName: 'Lập trình hướng đối tượng',
    credits: 3,
    amount: 1700000,
    outstanding: 1700000,
    status: 'unpaid',
  },
];

// Mock insurance data
export const MOCK_INSURANCE: Insurance[] = [
  {
    id: '1',
    insuranceCode: 'BHYT_15 THÁNG',
    insuranceName: 'BHYT 15 tháng',
    validPeriod: '01/10/2023 đến 31/12/2024',
    amount: 600000,
    outstanding: 600000,
    status: 'unpaid',
  },
  {
    id: '2',
    insuranceCode: 'BHYT_12 THÁNG',
    insuranceName: 'BHYT 12 tháng',
    validPeriod: '01/01/2025 đến 31/12/2025',
    amount: 884000,
    outstanding: 884000,
    status: 'unpaid',
  },
  {
    id: '3',
    insuranceCode: 'BHYT_12 THÁNG',
    insuranceName: 'BHYT 12 tháng',
    validPeriod: '01/01/2026 đến 31/12/2026',
    amount: 850000,
    outstanding: 850000,
    status: 'unpaid',
  },
];

// Mock payment history data
export const MOCK_PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: '1',
    date: '15/01/2025',
    description: 'Toán rời rạc',
    amount: 1700000,
    method: 'Chuyển khoản',
    status: 'completed',
  },
  {
    id: '2',
    date: '10/09/2024',
    description: 'Xác xuất thống kê',
    amount: 1700000,
    method: 'Chuyển khoản',
    status: 'completed',
  },
  {
    id: '3',
    date: '15/02/2024',
    description: 'Mạng máy tính',
    amount: 1700000,
    method: 'Tiền mặt',
    status: 'completed',
  },
];

