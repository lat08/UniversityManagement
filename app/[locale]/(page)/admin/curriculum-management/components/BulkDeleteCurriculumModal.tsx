"use client"

import { Button } from "@/app/components/ui"
import { X } from "lucide-react"

interface BulkDeleteCurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedCount: number
  isLoading?: boolean
}

export const BulkDeleteCurriculumModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading,
}: BulkDeleteCurriculumModalProps) => {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Xác nhận xóa chương trình đào tạo</h2>
            <p className="text-sm text-gray-600 mt-1">
              Bạn có chắc chắn muốn xóa toàn bộ <strong>{selectedCount}</strong> chương trình đào tạo được chọn?
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            <p className="font-semibold mb-1">Cảnh báo:</p>
            <p>Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa.</p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang xóa..." : "Xác nhận"}
          </Button>
        </div>
      </div>
    </div>
  )
}
