'use client';

import { ConfirmDialog } from '@/app/components/ui/confirm-dialog';
import { useState } from 'react';

interface ConfirmDeleteStudentModalProps {
  isOpen: boolean;
  studentName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmDeleteStudentModal({ isOpen, studentName, onClose, onConfirm }: ConfirmDeleteStudentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Xác nhận xoá sinh viên"
      description={`Bạn có chắc chắn muốn xoá sinh viên ${studentName || ''}? Hành động này là xoá mềm và có thể khôi phục sau.`}
      confirmText="Xoá"
      cancelText="Huỷ"
      variant="danger"
      isLoading={isProcessing}
    />
  );
}


