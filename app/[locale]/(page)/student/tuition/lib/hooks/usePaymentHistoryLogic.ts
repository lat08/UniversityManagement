import { useState, useMemo } from "react";
import { getPaymentExcel } from "../api/financeApi";
import { useToast } from "@/app/components/ui/toast";
import { Payment } from "../types/types";
import { useTranslations } from "next-intl";

export const usePaymentHistoryLogic = (
  payments: Payment[], // THÊM: Nhận dữ liệu thanh toán thô
  setIsLoading: (loading: boolean) => void,
) => {
  const toast = useToast();
  const t = useTranslations('student.tuition');
  const [searchTerm, setSearchTerm] = useState(''); 

  // LOGIC MỚI: Lọc dữ liệu thanh toán
  const filteredPayments = useMemo(() => {
    // Note: Logic lọc hiện tại chỉ dựa vào searchTerm. Cần thêm logic lọc theo selectedSemester nếu cần.
    if (!searchTerm) {
      // Có thể thêm logic lọc theo semester ở đây nếu cần
      return payments; 
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return payments.filter(payment => {
      // Giả định kiểu Payment có thuộc tính 'content' hoặc 'description'
      // và 'transactionId' để tìm kiếm
      const contentMatch = payment.note?.toLowerCase().includes(lowerSearchTerm); 

      return contentMatch;
    });
  }, [payments, searchTerm]);

  const handleExportPayment = async () => {
    try {
      setIsLoading(true);
      await getPaymentExcel();
      toast.success(t('toasts.paymentExportSuccess'));
    } catch (error) {
      console.error('Error exporting payment history:', error);
      toast.error(t('toasts.paymentExportError'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    handleExportPayment,
    filteredPayments,
  };
};