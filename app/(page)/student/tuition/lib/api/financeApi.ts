import { api } from '@/lib/api/client';
import { TuitionFee, Insurance, PaymentHistory, Semester } from '../types/types';

/**
 * Fetch list of semesters
 */
export async function getSemesters(): Promise<Semester[]> {
  try {
    const response = await api.get('/v1/finance/semesters');
    return response.data;
  } catch (error) {
    console.error('Error fetching semesters:', error);
    throw error;
  }
}

/**
 * Fetch tuition fees for a specific semester
 * @param semesterId - The ID of the semester
 */
export async function getTuitionFees(semesterId: string): Promise<TuitionFee[]> {
  try {
    const response = await api.get(`/v1/finance/tuition-fees`, {
      params: { semesterId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tuition fees:', error);
    throw error;
  }
}

/**
 * Fetch insurance data
 */
export async function getInsurance(): Promise<Insurance[]> {
  try {
    const response = await api.get('/v1/finance/insurance');
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance:', error);
    throw error;
  }
}

/**
 * Fetch payment history
 * @param semesterId - Optional semester ID to filter
 */
export async function getPaymentHistory(semesterId?: string): Promise<PaymentHistory[]> {
  try {
    const response = await api.get('/v1/finance/payment-history', {
      params: semesterId ? { semesterId } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
}

/**
 * Export tuition fees to Excel
 * @param semesterId - The ID of the semester
 */
export async function exportTuitionFees(semesterId: string): Promise<Blob> {
  try {
    const response = await api.get(`/v1/finance/export/tuition-fees`, {
      params: { semesterId },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting tuition fees:', error);
    throw error;
  }
}

/**
 * Export insurance to Excel
 */
export async function exportInsurance(): Promise<Blob> {
  try {
    const response = await api.get(`/v1/finance/export/insurance`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting insurance:', error);
    throw error;
  }
}

/**
 * Export payment history to Excel
 */
export async function exportPaymentHistory(semesterId?: string): Promise<Blob> {
  try {
    const response = await api.get(`/v1/finance/export/payment-history`, {
      params: semesterId ? { semesterId } : {},
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting payment history:', error);
    throw error;
  }
}

