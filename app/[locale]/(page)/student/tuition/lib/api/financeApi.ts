import { api } from '@/lib/api/client';
import type { TuitionFeeResponse, InsuranceResponse, PaymentHistoryResponse, PaymentResponse, PaymentStatusResponse } from '../types/types';

export const getTuitionFees = async (semesterId: string | null): Promise<TuitionFeeResponse> => {
  const response = await api.get<TuitionFeeResponse>('/v1/tuition-fees', {
    params: { semesterId },
  });
  return response.data;
};

export const getInsurances = async (): Promise<InsuranceResponse> => {
  const response = await api.get<{ data: InsuranceResponse }>('/v1/insurances');
  return {
    success: true,
    message: response.data?.data?.message || 'Success',
    data: response.data?.data?.data || [],
  };
};

export const getPayments = async (): Promise<PaymentHistoryResponse> => {
  const response = await api.get<PaymentHistoryResponse>('/v1/payments');
  return response.data;
};

export const payCourses = async (studentCoursesId: string[]): Promise<PaymentResponse> => {
  const response = await api.post<PaymentResponse>('/v1/payment/student-courses', { studentCoursesId });
  return response.data;
};

export const payInsurance = async (insuranceId: string): Promise<PaymentResponse> => {
  const response = await api.post<PaymentResponse>('/v1/payment/insurance', { insuranceId });
  return response.data;
};

const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getPaymentExcel = async (): Promise<void> => {
  const response = await api.get('/v1/payment/xlxs', {
    responseType: 'blob',
    headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  });
  const blob = new Blob([response.data], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  downloadFile(blob, 'LichSuThanhToan.xlsx');
};

export const getTuitionExcel = async (semesterId: string | null): Promise<void> => {
  const response = await api.get('/v1/tuition-fees/excel', {
    responseType: 'blob',
    headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    params: { semesterId },
  });
  const blob = new Blob([response.data], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  downloadFile(blob, 'DanhSachHocPhi.xlsx');
};

export const getInsuranceExcel = async (): Promise<void> => {
  const response = await api.get('/v1/insurances/excel', {
    responseType: 'blob',
    headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  });
  const blob = new Blob([response.data], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  downloadFile(blob, 'DanhSachBaoHiem.xlsx');
};

export const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
  const response = await api.get<PaymentStatusResponse>(`/v1/payment/status/${paymentId}`);
  return response.data;
};