'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/app/components/ui'

interface BulkDeleteDivisionModalProps {
  isOpen: boolean
  selectedCount: number
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function BulkDeleteDivisionModal({
  isOpen,
  selectedCount,
  isLoading,
  onClose,
  onConfirm,
}: BulkDeleteDivisionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
              <p className="text-sm text-gray-600 mt-1">
                Bạn có chắc chắn muốn xóa {selectedCount} khoa đã chọn?
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              Hành động này không thể hoàn tác. Các khoa sẽ bị xóa mềm khỏi hệ thống.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
