// lib/hooks/useFinanceData.ts
import { useState, useEffect, useCallback } from "react";
import { getTuitionFees, getInsurances, getPayments } from "../api/financeApi";
import { TuitionFeeResponse, Insurance, Payment, Semester } from "../types/types";
import { useToast } from "@/app/components/ui/toast";
import { commonApi } from "@/lib/api/common";
import { se } from "date-fns/locale";

export type FinanceDataState = {
  isLoading: boolean;
  tuitionData: TuitionFeeResponse['data'] | null;
  semesters: Semester[];
  defaultSemesterId: string | null;
  insurances: Insurance[];
  payments: Payment[];
  refreshData: (semesterId: string | null) => void;
};

export const useFinanceData = (): FinanceDataState => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tuitionData, setTuitionData] = useState<TuitionFeeResponse['data'] | null>(null);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [semesters, setSemester] = useState<Semester[]>([]);
  const [defaultSemesterId, setDefaultSemesterId] = useState<string | null>(null);

  
  const loadData = async (semesterId: string | null) => {
    setIsLoading(true);
    try {
      const [tuitionRes, insuranceRes, paymentRes] = await Promise.all([
        getTuitionFees(semesterId),
        getInsurances(),
        getPayments(),
      ]);


      if (tuitionRes.success) {
        setTuitionData(tuitionRes.data);
      } else {
        if (tuitionRes.message === "Không tìm thấy thông tin học phí.") 
          toast.error('Tải dữ liệu học phí thất bại: sinh viên chưa đăng ký môn học');
        else 
          toast.error('Tải dữ liệu học phí thất bại: ' + tuitionRes.message);
      }
      
      if (insuranceRes.success) {
        setInsurances(insuranceRes.data);
      } else {
        toast.error(insuranceRes.message || 'Tải dữ liệu bảo hiểm thất bại');
      }
      
      if (paymentRes.success) {
        setPayments(paymentRes.data);
      } else {
        toast.error(paymentRes.message || 'Tải dữ liệu lịch sử thanh toán thất bại');
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
      toast.error('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await commonApi.getSemesters();
      if (response.success && response.data) {
        const now = new Date();
        const allSemesters = response.data
          .filter(s => new Date(s.startDate) <= now)
          .map(s => ({
            semesterId: s.semesterId,
            semesterName: s.semesterName
          }));
        setSemester(allSemesters);

        
        const activeSemester = response.data.find(semester => {
          const startDate = new Date(semester.startDate);
          const endDate = new Date(semester.endDate);
          return now >= startDate && now <= endDate;
        });
        
        if (activeSemester) {
          setDefaultSemesterId(activeSemester.semesterId);
          loadData(activeSemester.semesterId);
        } else {
          console.log('No active semester found, defaulting to first semester if available', allSemesters[0]);
          setDefaultSemesterId(allSemesters[0]?.semesterId);
          loadData(allSemesters[0]?.semesterId || null);
        }
      }
    };

    fetchData();
  }, []);
  
  const refreshData = useCallback((semesterId: string | null) => {
    loadData(semesterId);
  }, []);

  return { isLoading, tuitionData, semesters, defaultSemesterId, insurances, payments, refreshData };
};