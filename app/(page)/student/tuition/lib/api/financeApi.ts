import { api } from '@/lib/api/client';
import type { TuitionFeeResponse, InsuranceResponse, PaymentHistoryResponse, PaymentResponse } from '../types/types';

export const getTuitionFees = async (semesterId: string | null): Promise<TuitionFeeResponse> => {
  const response = await api.get('/v1/tuition-fees', {
    params: {
      studentId: null,
      userId: null,
      semesterId: semesterId,
    },
  });
  return response.data;
};

export const getInsurances = async (): Promise<InsuranceResponse> => {
  const response = await api.get('/v1/insurances');
  return response.data?.data;
};

export const getPayments = async (): Promise<PaymentHistoryResponse> => {
  const response = await api.get('/v1/payments');
  return response.data;
};

export const payCourses = async (studentCoursesId: string[]): Promise<PaymentResponse> => {
  const response = await api.post('/v1/payment/student-courses', { studentCoursesId });
  return response.data;
};

export const payInsurance = async (insuranceId: string): Promise<PaymentResponse> => {
  const response = await api.post('/v1/payment/insurance', { insuranceId });
  return response.data;
};

export const getPaymentExcel = async (): Promise<void> => {
  const response = await api.get('/v1/payment/xlxs', {
    responseType: 'blob',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
  });
  
  // Create a download link
  const blob = new Blob([response.data], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'LichSuThanhToan.xlsx';
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getTuitionExcel = async (semesterId: string | null): Promise<void> => {
  const response = await api.get('/v1/tuition-fees/excel', {
    responseType: 'blob',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    params: {
      studentId: null,
      userId: null,
      semesterId: semesterId,
    },
  });
  
  const blob = new Blob([response.data], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'DanhSachHocPhi.xlsx';
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getInsuranceExcel = async (): Promise<void> => {
  const response = await api.get('/v1/insurances/excel', {
    responseType: 'blob',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  });
  
  const blob = new Blob([response.data], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'DanhSachBaoHiem.xlsx';
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};