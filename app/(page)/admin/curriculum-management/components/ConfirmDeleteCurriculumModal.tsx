'use client'

import { Button } from '@/app/components/ui'
import { X } from 'lucide-react'

interface ConfirmDeleteCurriculumModalProps {
  isOpen: boolean
  curriculumName?: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export const ConfirmDeleteCurriculumModal = ({
  isOpen,
  curriculumName,
  onClose,
  onConfirm,
}: ConfirmDeleteCurriculumModalProps) => {
  if (!isOpen) return null

  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa Chương trình đào tạo</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa chương trình đào tạo{' '}
            <span className="font-semibold text-gray-900">{curriculumName}</span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Lưu ý: Đây là xóa mềm, CTĐT sẽ không bị xóa vĩnh viễn nhưng không thể sử dụng cho lớp học mới.
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            Xóa
          </Button>
        </div>
      </div>
    </div>
  )
}
