'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button, Dropdown } from '@/app/components/ui'
import { divisionsApi } from '../lib/api/divisionsApi'
import { toast } from 'react-hot-toast'
import type { DivisionListItem, InstructorOption } from '../lib/types/types'

interface EditDivisionModalProps {
  isOpen: boolean
  division: DivisionListItem | null
  onClose: () => void
  onSuccess: () => void
}

export function EditDivisionModal({ isOpen, division, onClose, onSuccess }: EditDivisionModalProps) {
  const [divisionName, setDivisionName] = useState('')
  const [deanId, setDeanId] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [instructors, setInstructors] = useState<InstructorOption[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && division) {
      setDivisionName(division.divisionName)
      setDeanId(division.deanId || '')
      setStatus(division.divisionStatus)

      divisionsApi.getInstructors().then((res) => {
        if (res.isSuccess && res.data) {
          setInstructors(res.data)
        }
      })
    }
  }, [isOpen, division])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!division) return

    if (!divisionName.trim()) {
      toast.error('Vui lòng nhập tên khoa')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        divisionName: divisionName.trim(),
        divisionStatus: status,
        ...(deanId && { deanId }),
      }

      const res = await divisionsApi.updateDivision(division.divisionId, payload)
      if (res.isSuccess) {
        toast.success(res.message || 'Cập nhật khoa thành công')
        onSuccess()
        onClose()
      } else {
        toast.error(res.message || 'Cập nhật khoa thất bại')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi cập nhật khoa')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  if (!isOpen || !division) return null

  const instructorOptions = [
    { value: '', label: 'Chọn trưởng khoa (tùy chọn)' },
    ...instructors.map((i) => ({ value: i.instructorId, label: i.instructorName })),
  ]

  const statusOptions = [
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Ngừng hoạt động' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa khoa</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên khoa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              placeholder="Nhập tên khoa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trưởng khoa</label>
            <Dropdown
              options={instructorOptions}
              value={deanId}
              placeholder="Chọn trưởng khoa (tùy chọn)"
              onChange={setDeanId}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={statusOptions}
              value={status}
              placeholder="Chọn trạng thái"
              onChange={(value) => setStatus(value as 'active' | 'inactive')}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
