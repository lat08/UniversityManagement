"use client"

import { useTranslations } from "next-intl"
import { ConfirmDialog } from "@/app/components/ui/confirm-dialog"
import type { Document } from "./DocumentCard"

interface DeleteDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  document: Document | null
  isLoading?: boolean
}

export function DeleteDocumentModal({
  isOpen,
  onClose,
  onConfirm,
  document,
  isLoading = false,
}: DeleteDocumentModalProps) {
  const t = useTranslations('admin.modals.deleteDocument')
  const tCommon = useTranslations('common.actions')
  
  if (!document) return null

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('title')}
      description={`${t('confirm')} ${document.title}? ${t('description')}`}
      confirmText={t('delete')}
      cancelText={tCommon('cancel')}
      variant="danger"
      isLoading={isLoading}
    />
  )
}

