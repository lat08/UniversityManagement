"use client"

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
  if (!document) return null

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Xác nhận xóa tài liệu"
      description={`Bạn có chắc chắn muốn xóa tài liệu ${document.title}? Hành động này không thể hoàn tác.`}
      confirmText="Xóa"
      cancelText="Hủy"
      variant="danger"
      isLoading={isLoading}
    />
  )
}

