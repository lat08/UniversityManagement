// lib/hooks/useFinanceData.ts
import { useState, useEffect, useCallback } from "react";
import { getTuitionFees, getInsurances, getPayments } from "../api/financeApi";
import { TuitionFeeResponse, Insurance, Payment } from "../types/types";
import { useToast } from "@/app/components/ui/toast";
import {  Semester } from "../../../dashboard/libs/types/types";
import { dashboardApi } from "../../../dashboard/libs/api/dashboardApi";

export type FinanceDataState = {
  isLoading: boolean;
  tuitionData: TuitionFeeResponse['data'] | null;
  semesters: Semester[];
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

  
  const loadData = async (semesterId: string | null) => {
    setIsLoading(true);
    console.log(semesterId)
    try {
      const [tuitionRes, insuranceRes, paymentRes] = await Promise.all([
        getTuitionFees(semesterId),
        getInsurances(),
        getPayments(),
      ]);

      console.log(tuitionRes)

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
      toast.error('Failed to load data. Please try again later.');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
    const data = await dashboardApi.getDashBoard();
    setSemester(data.activeSemesters);
    };

    fetchData();
    loadData(null);
  }, []);
  
  const refreshData = useCallback((semesterId: string | null) => {
    loadData(semesterId);
  }, []);

  return { isLoading, tuitionData, semesters, insurances, payments, refreshData };
};