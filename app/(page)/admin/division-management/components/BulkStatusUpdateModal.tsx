'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button, Dropdown } from '@/app/components/ui'

interface BulkStatusUpdateModalProps {
  isOpen: boolean
  selectedCount: number
  isLoading: boolean
  onClose: () => void
  onConfirm: (status: 'active' | 'inactive') => void
}

export function BulkStatusUpdateModal({
  isOpen,
  selectedCount,
  isLoading,
  onClose,
  onConfirm,
}: BulkStatusUpdateModalProps) {
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  if (!isOpen) return null

  const statusOptions = [
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Ngừng hoạt động' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cập nhật trạng thái</h3>
              <p className="text-sm text-gray-600 mt-1">
                Cập nhật trạng thái cho {selectedCount} khoa đã chọn
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái mới <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={statusOptions}
              value={status}
              placeholder="Chọn trạng thái"
              onChange={(value) => setStatus(value as 'active' | 'inactive')}
              disabled={isLoading}
            />
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
              onClick={() => onConfirm(status)}
              disabled={isLoading}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
