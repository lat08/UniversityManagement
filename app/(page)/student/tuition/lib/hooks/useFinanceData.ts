// lib/hooks/useFinanceData.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { getTuitionFees, getInsurances, getPayments } from "../api/financeApi";
import { TuitionFeeResponse, Insurance, Payment, Semester } from "../types/types";
import { useToast } from "@/app/components/ui/toast";
import { commonApi } from "@/lib/api/common";

export type FinanceDataState = {
  isLoading: boolean;
  tuitionData: TuitionFeeResponse['data'] | null;
  semesters: Semester[];
  defaultSemesterId: string | null;
  insurances: Insurance[];
  payments: Payment[];
  isInsuranceLoaded: boolean;
  isPaymentsLoaded: boolean;
  loadTuitionData: (semesterId: string | null) => Promise<void>;
  loadInsuranceData: () => Promise<void>;
  loadPaymentsData: () => Promise<void>;
};

export const useFinanceData = (): FinanceDataState => {
  const toast = useToast();
  const toastRef = useRef(toast);
  const [isLoading, setIsLoading] = useState(true);
  const [tuitionData, setTuitionData] = useState<TuitionFeeResponse['data'] | null>(null);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [semesters, setSemester] = useState<Semester[]>([]);
  const [defaultSemesterId, setDefaultSemesterId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInsuranceLoaded, setIsInsuranceLoaded] = useState(false);
  const [isPaymentsLoaded, setIsPaymentsLoaded] = useState(false);

  // Keep toast ref updated
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Load tuition data only
  const loadTuitionData = useCallback(async (semesterId: string | null) => {
    setIsLoading(true);
    try {
      const tuitionRes = await getTuitionFees(semesterId);

      if (tuitionRes.success) {
        setTuitionData(tuitionRes.data);
      } else {
        if (tuitionRes.message === "Không tìm thấy thông tin học phí.") 
          toastRef.current.error('Tải dữ liệu học phí thất bại: sinh viên chưa đăng ký môn học');
        else 
          toastRef.current.error('Tải dữ liệu học phí thất bại: ' + tuitionRes.message);
      }
    } catch (error) {
      console.error('Error loading tuition data:', error);
      toastRef.current.error('Failed to load tuition data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load insurance data only
  const loadInsuranceDataRef = useRef<(() => Promise<void>) | undefined>(undefined);
  
  loadInsuranceDataRef.current = async () => {
    if (isInsuranceLoaded) return;
    
    setIsLoading(true);
    try {
      const insuranceRes = await getInsurances();
      
      if (insuranceRes.success) {
        setInsurances(insuranceRes.data);
        setIsInsuranceLoaded(true);
      } else {
        toastRef.current.error(insuranceRes.message || 'Tải dữ liệu bảo hiểm thất bại');
      }
    } catch (error) {
      console.error('Error loading insurance data:', error);
      toastRef.current.error('Failed to load insurance data.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsuranceData = useCallback(async () => {
    return loadInsuranceDataRef.current?.();
  }, []);

  // Load payments data only
  const loadPaymentsDataRef = useRef<(() => Promise<void>) | undefined>(undefined);
  
  loadPaymentsDataRef.current = async () => {
    if (isPaymentsLoaded) return;
    
    setIsLoading(true);
    try {
      const paymentRes = await getPayments();
      
      if (paymentRes.success) {
        setPayments(paymentRes.data);
        setIsPaymentsLoaded(true);
      } else {
        toastRef.current.error(paymentRes.message || 'Tải dữ liệu lịch sử thanh toán thất bại');
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      toastRef.current.error('Failed to load payment data.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentsData = useCallback(async () => {
    return loadPaymentsDataRef.current?.();
  }, []);

  useEffect(() => {
    if (isInitialized) return;

    const fetchData = async () => {
      try {
        const response = await commonApi.getSemesters();
        if (response.success && response.data) {
          const now = new Date();
          const allSemesters = response.data
            .filter(s => s.registrationStartDate && new Date(s.registrationStartDate) <= now)
            .map(s => ({
              semesterId: s.semesterId,
              semesterName: s.semesterName
            }));
          setSemester(allSemesters);

          const activeSemester = response.data.find(semester => {
            if (!semester.registrationStartDate || !semester.registrationEndDate) return false;
            const startDate = new Date(semester.registrationStartDate);
            const endDate = new Date(semester.registrationEndDate);
            return now >= startDate && now <= endDate;
          });
          
          const selectedSemesterId = activeSemester?.semesterId || allSemesters[0]?.semesterId || null;
          setDefaultSemesterId(selectedSemesterId);
          await loadTuitionData(selectedSemesterId);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
        setIsLoading(false);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchData();
  }, [isInitialized, loadTuitionData]);

  return { 
    isLoading, 
    tuitionData, 
    semesters, 
    defaultSemesterId, 
    insurances, 
    payments, 
    isInsuranceLoaded,
    isPaymentsLoaded,
    loadTuitionData,
    loadInsuranceData,
    loadPaymentsData
  };
};