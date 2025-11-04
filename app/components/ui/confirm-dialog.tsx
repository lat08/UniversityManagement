"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: () => void
  readonly title: string
  readonly description: string
  readonly confirmText?: string
  readonly cancelText?: string
  readonly variant?: 'danger' | 'warning' | 'info'
  readonly isLoading?: boolean
}

const variantStyles = {
  danger: {
    icon: 'text-red-600',
    iconBg: 'bg-red-50',
    confirmButton: 'bg-red-600 hover:bg-red-700'
  },
  warning: {
    icon: 'text-yellow-600',
    iconBg: 'bg-yellow-50',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700'
  },
  info: {
    icon: 'text-blue-600',
    iconBg: 'bg-blue-50',
    confirmButton: 'bg-blue-600 hover:bg-blue-700'
  }
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  isLoading = false
}: ConfirmDialogProps) {
  const styles = variantStyles[variant]

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
            </div>
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${styles.confirmButton} text-white cursor-pointer`}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

