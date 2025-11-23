'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input } from '@/app/components/ui'
import { X } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { InferType } from 'yup'
import { toast } from 'react-hot-toast'
import { curriculumsApi } from '../lib/api/curriculumsApi'
import type { CurriculumListItem } from '../lib/types/types'

interface EditCurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  curriculum: CurriculumListItem | null
}

const validationSchema = yup.object({
  curriculumName: yup
    .string()
    .required('Tên CTĐT là bắt buộc')
    .max(500, 'Tên CTĐT tối đa 500 ký tự'),
  appliedYear: yup
    .number()
    .typeError('Năm áp dụng phải là số')
    .required('Năm áp dụng là bắt buộc')
    .min(1900, 'Năm áp dụng phải từ 1900 đến 2100')
    .max(2100, 'Năm áp dụng phải từ 1900 đến 2100'),
})

type FormData = InferType<typeof validationSchema>

export const EditCurriculumModal = ({ isOpen, onClose, onSuccess, curriculum }: EditCurriculumModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      curriculumName: '',
      appliedYear: new Date().getFullYear(),
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && curriculum) {
      setValue('curriculumName', curriculum.curriculumName)
      setValue('appliedYear', curriculum.appliedYear)
    }
  }, [isOpen, curriculum, setValue])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }, [isSubmitting, reset, onClose])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isSubmitting, handleClose])

  const onSubmit = async (data: FormData) => {
    if (!curriculum) return

    setIsSubmitting(true)
    try {
      const payload = {
        curriculumName: data.curriculumName,
        appliedYear: data.appliedYear,
      }

      const response = await curriculumsApi.updateCurriculum(curriculum.curriculumId, payload)

      if (response.success) {
        toast.success(response.message || 'Cập nhật chương trình đào tạo thành công!')
        reset()
        onSuccess?.()
        handleClose()
      } else {
        toast.error(response.message || 'Cập nhật chương trình đào tạo thất bại')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || 'Đã xảy ra lỗi')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !curriculum) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa Chương trình đào tạo</h2>
              <p className="text-sm text-gray-600 mt-1">Cập nhật tên và năm áp dụng của CTĐT</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Mã CTĐT
              </label>
              <Input value={curriculum.curriculumCode} disabled className="bg-gray-50 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tên CTĐT <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tên chương trình đào tạo"
                {...register('curriculumName')}
                className={errors.curriculumName ? 'border-red-500' : ''}
              />
              {errors.curriculumName && (
                <p className="mt-1 text-xs text-red-500">{errors.curriculumName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Khoa phụ trách</label>
              <Input
                value={curriculum.facultyName || curriculum.departmentName}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Số tín chỉ</label>
              <Input
                value={curriculum.totalCredits}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Giá trị này được tính tự động từ danh sách môn học.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Năm áp dụng <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('appliedYear')}
                className={errors.appliedYear ? 'border-red-500' : ''}
              />
              {errors.appliedYear && (
                <p className="mt-1 text-xs text-red-500">{errors.appliedYear.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
