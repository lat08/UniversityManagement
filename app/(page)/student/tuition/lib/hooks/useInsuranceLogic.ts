import { useState, useMemo, useCallback } from "react";
import { payInsurance, getInsuranceExcel } from "../api/financeApi";
import { useToast } from "@/app/components/ui/toast";
import type { Insurance } from "../types/types";
import { extractPaymentIdFromQrUrl } from "../utils/paymentUtils";

export const useInsuranceLogic = (
  insurances: Insurance[],
  setIsLoading: (loading: boolean) => void,
  setQrUrl: (url: string | null) => void,
  setPaymentId: (id: string | null) => void,
  setIsQrOpen: (open: boolean) => void,
  setQrIframeLoading: (loading: boolean) => void,
) => {
  const toast = useToast();
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string | null>(null);

  const selectedInsuranceItems = useMemo(
    () => selectedInsuranceId ? insurances.filter(insurance => insurance.studentHealthInsuranceId === selectedInsuranceId) : [],
    [insurances, selectedInsuranceId]
  );

  const handleSelectInsurance = useCallback((id: string) => {
    setSelectedInsuranceId(prev => prev === id ? null : id);
  }, []);

  const handleExportInsurance = useCallback(async () => {
    try {
      setIsLoading(true);
      await getInsuranceExcel();
      toast.success('Đang tải xuống danh sách bảo hiểm');
    } catch {
      toast.error('Không thể tải xuống file. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, toast]);

  const handleInsurancePayment = useCallback(async () => {
    if (!selectedInsuranceId) {
      toast.error('Vui lòng chọn bảo hiểm để thanh toán');
      return;
    }

    try {
      setIsLoading(true);
      const res = await payInsurance(selectedInsuranceId);
      
      if (res.success) {
        if (res.data) {
          const extractedPaymentId = extractPaymentIdFromQrUrl(res.data);
          setQrUrl(res.data);
          setPaymentId(extractedPaymentId);
          setQrIframeLoading(true);
          setIsQrOpen(true);
          toast.success('Tạo QR thành công'); 
        } else {
          toast.error('Không nhận được link thanh toán từ server');
        }
      } else {
        toast.error(res.message || 'Thanh toán thất bại');
      }
    } catch {
      toast.error('Không thể xử lý thanh toán bảo hiểm');
    } finally {
      setIsLoading(false);
    }
  }, [selectedInsuranceId, setIsLoading, setQrUrl, setPaymentId, setQrIframeLoading, setIsQrOpen, toast]);

  return {
    selectedInsuranceId,
    selectedInsuranceItems,
    handleSelectInsurance,
    handleExportInsurance,
    handleInsurancePayment,
  };
};