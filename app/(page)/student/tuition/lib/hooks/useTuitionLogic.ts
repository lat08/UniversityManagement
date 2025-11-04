// lib/hooks/useTuitionLogic.ts
import { useState, useMemo } from "react";
import { payCourses, getTuitionExcel } from "../api/financeApi";
import { useToast } from "@/app/components/ui/toast";
import { TuitionFeeResponse } from "../types/types";

export const useTuitionLogic = (
  tuitionData: TuitionFeeResponse['data'] | null,
  setIsLoading: (loading: boolean) => void,
  setQrUrl: (url: string | null) => void,
  setIsQrOpen: (open: boolean) => void,
  setQrIframeLoading: (loading: boolean) => void,
) => {
  const toast = useToast();
  const [selectedTuitionIds, setSelectedTuitionIds] = useState<string[]>([]);
  
  const availableCourses = useMemo(() => {
    if (!tuitionData) return [];
    // GIẢ ĐỊNH: Course object có thuộc tính 'isPaid: boolean'
    return tuitionData.courses.filter(course => course.status == "pending" || course.status == "failed"); 
    // Nếu không có isPaid, bạn cần dựa vào trường khác, ví dụ: status/isSelectable
  }, [tuitionData]);

  const selectedTuitionItems = useMemo(() => {
      return availableCourses.filter(
        course => selectedTuitionIds.includes(course.courseId)
      ) || [];
    }, [availableCourses, selectedTuitionIds]);

  const handleSelectAllTuition = (checked: boolean) => {
    // CHỈ CHỌN/BỎ CHỌN CÁC KHÓA HỌC CÓ THỂ THANH TOÁN
    if (checked) {
      setSelectedTuitionIds(availableCourses.map(course => course.courseId));
    } else {
      setSelectedTuitionIds([]);
    }
  };

  const handleSelectTuition = (id: string, checked: boolean) => {
    const courseToSelect = availableCourses.find(c => c.courseId === id);
    if (!courseToSelect) return; // Ngăn chặn chọn khóa học đã bị vô hiệu hóa
    
    if (checked) {
      setSelectedTuitionIds([...selectedTuitionIds, id]);
    } else {
      setSelectedTuitionIds(selectedTuitionIds.filter(itemId => itemId !== id));
    }
  };

  const handleExportTuition = async () => {
    try {
      setIsLoading(true);
      await getTuitionExcel(tuitionData?.semesterId || null);
      toast.success('Đang tải xuống danh sách học phí');
    } catch (error) {
      console.error('Error exporting tuition:', error);
      toast.error('Không thể tải xuống file. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (selectedTuitionIds.length === 0) {
      toast.error('Vui lòng chọn môn học để thanh toán.');
      return;
    }
    const res = await payCourses(selectedTuitionIds);
    if (res.success && res.data) {
      setQrUrl(res.data);
      setQrIframeLoading(true);
      setIsQrOpen(true);
      toast.success("Tạo QR thành công!");
    } else {
      toast.error(res.message || "Không thể tạo QR");
    }
  };


  return {
    selectedTuitionIds,
    selectedTuitionItems,
    handleSelectAllTuition, // SỬA ĐỔI NÀY
    handleSelectTuition,     // SỬA ĐỔI NÀY
    handleExportTuition,
    handlePayment,
    availableCourses,
  };
};