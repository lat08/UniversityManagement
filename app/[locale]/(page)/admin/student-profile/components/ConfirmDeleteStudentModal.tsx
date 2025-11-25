'use client';

import { ConfirmDialog } from '@/app/components/ui/confirm-dialog';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ConfirmDeleteStudentModalProps {
  isOpen: boolean;
  studentName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmDeleteStudentModal({ isOpen, studentName, onClose, onConfirm }: ConfirmDeleteStudentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const t = useTranslations('admin.studentProfile.modals.confirmDelete');
  const tCommon = useTranslations('common.actions');

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
      title={t('title')}
      description={t('description', { name: studentName ?? '' })}
      confirmText={tCommon('delete')}
      cancelText={tCommon('cancel')}
      variant="danger"
      isLoading={isProcessing}
    />
  );
}


