"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface BulkDeleteFacultyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedCount: number
  isLoading?: boolean
}

export function BulkDeleteFacultyModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading,
}: BulkDeleteFacultyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Xác nhận xóa ngành học</DialogTitle>
              <DialogDescription className="mt-1">
                Bạn có chắc chắn muốn xóa{" "}
                <span className="font-semibold text-foreground">
                  {selectedCount}
                </span>{" "}
                ngành học đã chọn?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">
            <span className="font-medium">Cảnh báo:</span> Hành động này không
            thể hoàn tác. Tất cả dữ liệu liên quan đến {selectedCount} ngành học
            sẽ bị xóa vĩnh viễn.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
