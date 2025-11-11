// lib/hooks/useInsuranceLogic.ts
import { useState, useMemo } from "react";
import { payInsurance, getInsuranceExcel } from "../api/financeApi";
import { useToast } from "@/app/components/ui/toast";
import { Insurance } from "../types/types";
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

  const selectedInsuranceItems = useMemo(() => {
    return selectedInsuranceId 
      ? insurances.filter(insurance => insurance.studentHealthInsuranceId === selectedInsuranceId)
      : [];
  }, [insurances, selectedInsuranceId]);

  const handleSelectInsurance = (id: string) => {
    setSelectedInsuranceId(selectedInsuranceId === id ? null : id);
  };

  const handleExportInsurance = async () => {
    try {
      setIsLoading(true);
      await getInsuranceExcel();
      toast.success('Đang tải xuống danh sách bảo hiểm');
    } catch (error) {
      console.error('Error exporting insurance:', error);
      toast.error('Không thể tải xuống file. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsurancePayment = async () => {
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
    } catch (error) {
      console.error('Error processing insurance payment:', error);
      toast.error('Không thể xử lý thanh toán bảo hiểm');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedInsuranceId,
    selectedInsuranceItems,
    handleSelectInsurance,
    handleExportInsurance,
    handleInsurancePayment,
  };
};