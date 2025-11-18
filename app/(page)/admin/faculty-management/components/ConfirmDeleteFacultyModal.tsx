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
import { Faculty } from "../lib/types/types"
import { AlertTriangle } from "lucide-react"

interface ConfirmDeleteFacultyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  faculty: Faculty | null
  isLoading?: boolean
}

export function ConfirmDeleteFacultyModal({
  isOpen,
  onClose,
  onConfirm,
  faculty,
  isLoading,
}: ConfirmDeleteFacultyModalProps) {
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
                Bạn có chắc chắn muốn xóa ngành học{" "}
                <span className="font-semibold text-foreground">
                  {faculty?.facultyName}
                </span>{" "}
                ({faculty?.facultyCode})?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">
            <span className="font-medium">Cảnh báo:</span> Hành động này không
            thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
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
