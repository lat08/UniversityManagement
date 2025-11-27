import { useState, useMemo, useCallback } from "react";
import { payInsurance, getInsuranceExcel } from "../api/financeApi";
import { useToast } from "@/app/components/ui/toast";
import type { Insurance } from "../types/types";
import { extractPaymentIdFromQrUrl } from "../utils/paymentUtils";
import { useTranslations } from "next-intl";

export const useInsuranceLogic = (
  insurances: Insurance[],
  setIsLoading: (loading: boolean) => void,
  setQrUrl: (url: string | null) => void,
  setPaymentId: (id: string | null) => void,
  setIsQrOpen: (open: boolean) => void,
  setQrIframeLoading: (loading: boolean) => void,
) => {
  const toast = useToast();
  const t = useTranslations('student.tuition');
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
      toast.success(t('toasts.insuranceExportSuccess'));
    } catch {
      toast.error(t('toasts.insuranceExportError'));
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, toast, t]);

  const handleInsurancePayment = useCallback(async () => {
    if (!selectedInsuranceId) {
      toast.error(t('toasts.insuranceSelectionRequired'));
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
          toast.success(t('toasts.insuranceQrSuccess')); 
        } else {
          toast.error(t('toasts.insuranceQrMissing'));
        }
      } else {
        toast.error(res.message || t('toasts.insuranceQrError'));
      }
    } catch {
      toast.error(t('toasts.insurancePaymentError'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedInsuranceId, setIsLoading, setQrUrl, setPaymentId, setQrIframeLoading, setIsQrOpen, toast, t]);

  return {
    selectedInsuranceId,
    selectedInsuranceItems,
    handleSelectInsurance,
    handleExportInsurance,
    handleInsurancePayment,
  };
};