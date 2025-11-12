import { useState, useMemo, useCallback } from "react";
import { payCourses, getTuitionExcel } from "../api/financeApi";
import { useToast } from "@/app/components/ui/toast";
import type { TuitionFeeResponse } from "../types/types";
import { extractPaymentIdFromQrUrl } from "../utils/paymentUtils";

export const useTuitionLogic = (
  tuitionData: TuitionFeeResponse['data'] | null,
  setIsLoading: (loading: boolean) => void,
  setQrUrl: (url: string | null) => void,
  setPaymentId: (id: string | null) => void,
  setIsQrOpen: (open: boolean) => void,
  setQrIframeLoading: (loading: boolean) => void,
) => {
  const toast = useToast();
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
      toast.success('Đang tải xuống danh sách học phí');
    } catch {
      toast.error('Không thể tải xuống file. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [tuitionData?.semesterId, setIsLoading, toast]);

  const handlePayment = useCallback(async () => {
    if (selectedTuitionIds.length === 0) {
      toast.error('Vui lòng chọn môn học để thanh toán.');
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
        toast.success("Tạo QR thành công!");
      } else {
        toast.error(res.message || "Không thể tạo QR");
      }
    } catch {
      toast.error("Không thể xử lý thanh toán. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTuitionIds, setIsLoading, setQrUrl, setPaymentId, setQrIframeLoading, setIsQrOpen, toast]);

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