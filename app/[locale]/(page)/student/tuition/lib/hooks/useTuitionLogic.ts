import { useState, useMemo, useCallback } from "react";
import { payCourses, getTuitionExcel } from "../api/financeApi";
import { useToast } from "@/app/components/ui/toast";
import type { TuitionFeeResponse } from "../types/types";
import { extractPaymentIdFromQrUrl } from "../utils/paymentUtils";
import { useTranslations } from "next-intl";

export const useTuitionLogic = (
  tuitionData: TuitionFeeResponse['data'] | null,
  setIsLoading: (loading: boolean) => void,
  setQrUrl: (url: string | null) => void,
  setPaymentId: (id: string | null) => void,
  setIsQrOpen: (open: boolean) => void,
  setQrIframeLoading: (loading: boolean) => void,
) => {
  const toast = useToast();
  const t = useTranslations('student.tuition');
  const [selectedTuitionIds, setSelectedTuitionIds] = useState<string[]>([]);
  
  const availableCourses = useMemo(() => {
    if (!tuitionData?.courses) return [];
    return tuitionData.courses.filter(
      course => course.status === "pending" || course.status === "failed"
    );
  }, [tuitionData?.courses]);

  const selectedTuitionItems = useMemo(
    () => availableCourses.filter(course => selectedTuitionIds.includes(course.courseId)),
    [availableCourses, selectedTuitionIds]
  );

  const handleSelectAllTuition = useCallback((checked: boolean) => {
    setSelectedTuitionIds(checked ? availableCourses.map(course => course.courseId) : []);
  }, [availableCourses]);

  const handleSelectTuition = useCallback((id: string, checked: boolean) => {
    const courseToSelect = availableCourses.find(c => c.courseId === id);
    if (!courseToSelect) return;
    
    setSelectedTuitionIds(prev =>
      checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );
  }, [availableCourses]);

  const handleExportTuition = useCallback(async () => {
    try {
      setIsLoading(true);
      await getTuitionExcel(tuitionData?.semesterId || null);
      toast.success(t('toasts.tuitionExportSuccess'));
    } catch {
      toast.error(t('toasts.tuitionExportError'));
    } finally {
      setIsLoading(false);
    }
  }, [tuitionData?.semesterId, setIsLoading, toast, t]);

  const handlePayment = useCallback(async () => {
    if (selectedTuitionIds.length === 0) {
      toast.error(t('toasts.tuitionSelectionRequired'));
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await payCourses(selectedTuitionIds);
      if (res.success && res.data) {
        const extractedPaymentId = extractPaymentIdFromQrUrl(res.data);
        setQrUrl(res.data);
        setPaymentId(extractedPaymentId);
        setQrIframeLoading(true);
        setIsQrOpen(true);
        toast.success(t('toasts.tuitionQrSuccess'));
      } else {
        toast.error(res.message || t('toasts.tuitionQrError'));
      }
    } catch {
      toast.error(t('toasts.tuitionPaymentError'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedTuitionIds, setIsLoading, setQrUrl, setPaymentId, setQrIframeLoading, setIsQrOpen, toast, t]);

  return {
    selectedTuitionIds,
    selectedTuitionItems,
    handleSelectAllTuition,
    handleSelectTuition,
    handleExportTuition,
    handlePayment,
    availableCourses,
  };
};