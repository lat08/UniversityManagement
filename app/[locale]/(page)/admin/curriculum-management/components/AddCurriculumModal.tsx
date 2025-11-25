'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Dropdown, DropdownSearch } from '@/app/components/ui'
import { X } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { InferType } from 'yup'
import { toast } from 'react-hot-toast'
import { curriculumsApi } from '../lib/api/curriculumsApi'
import type { DepartmentOption, FacultyOption } from '../lib/types/types'

interface AddCurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const validationSchema = yup.object({
  curriculumCode: yup
    .string()
    .required('Mã CTĐT là bắt buộc')
    .max(50, 'Mã CTĐT tối đa 50 ký tự'),
  curriculumName: yup
    .string()
    .required('Tên CTĐT là bắt buộc')
    .max(500, 'Tên CTĐT tối đa 500 ký tự'),
  departmentId: yup.string().required('Chuyên ngành là bắt buộc'),
  appliedYear: yup
    .number()
    .typeError('Năm áp dụng phải là số')
    .required('Năm áp dụng là bắt buộc')
    .min(1900, 'Năm áp dụng phải từ 1900 đến 2100')
    .max(2100, 'Năm áp dụng phải từ 1900 đến 2100'),
  versionNumber: yup
    .number()
    .typeError('Số phiên bản phải là số')
    .required('Số phiên bản là bắt buộc')
    .min(1, 'Số phiên bản phải lớn hơn 0'),
})

type FormData = InferType<typeof validationSchema>

export const AddCurriculumModal = ({ isOpen, onClose, onSuccess }: AddCurriculumModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    clearErrors,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      curriculumCode: '',
      curriculumName: '',
      departmentId: '',
      appliedYear: new Date().getFullYear(),
      versionNumber: 1,
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faculties, setFaculties] = useState<FacultyOption[]>([])
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [selectedFacultyId, setSelectedFacultyId] = useState('')

  const formValues = watch()

  useEffect(() => {
    if (isOpen) {
      curriculumsApi.getFaculties().then((res) => {
        if (res.success && res.data) setFaculties(res.data)
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (!selectedFacultyId) {
      setDepartments([])
      setValue('departmentId', '')
      return
    }

    curriculumsApi.getDepartments(selectedFacultyId).then((res) => {
      if (res.success && res.data) setDepartments(res.data)
    })
  }, [selectedFacultyId, setValue])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset()
      setSelectedFacultyId('')
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
    setIsSubmitting(true)
    try {
      const payload = {
        curriculumCode: data.curriculumCode.toUpperCase(),
        curriculumName: data.curriculumName,
        departmentId: data.departmentId,
        appliedYear: data.appliedYear,
        versionNumber: data.versionNumber,
      }

      const response = await curriculumsApi.createCurriculum(payload)

      if (response.success) {
        toast.success(response.message || 'Tạo chương trình đào tạo thành công!')
        reset()
        onSuccess?.()
        handleClose()
      } else {
        toast.error(response.message || 'Tạo chương trình đào tạo thất bại')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || 'Đã xảy ra lỗi')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose()
    }
  }

  const facultyOptions = faculties.map((f) => ({ value: f.facultyId, label: f.facultyName }))
  const departmentOptions = departments.map((d) => ({ value: d.departmentId, label: d.departmentName }))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thêm mới Chương trình đào tạo</h2>
              <p className="text-sm text-gray-600 mt-1">Nhập thông tin chương trình</p>
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
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mã CTĐT <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: CNTT2020"
                  {...register('curriculumCode')}
                  className={errors.curriculumCode ? 'border-red-500' : ''}
                />
                {errors.curriculumCode && (
                  <p className="mt-1 text-xs text-red-500">{errors.curriculumCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tên CTĐT <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: Chương trình đào tạo Công nghệ thông tin"
                  {...register('curriculumName')}
                  className={errors.curriculumName ? 'border-red-500' : ''}
                />
                {errors.curriculumName && (
                  <p className="mt-1 text-xs text-red-500">{errors.curriculumName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Khoa phụ trách
                </label>
                <DropdownSearch
                  options={facultyOptions}
                  value={selectedFacultyId}
                  placeholder="Chọn khoa"
                  searchPlaceholder="Tìm kiếm khoa..."
                  onChange={(value) => {
                    setSelectedFacultyId(value)
                    if (!value) {
                      setValue('departmentId', '')
                      clearErrors('departmentId')
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Chuyên ngành <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={departmentOptions}
                  value={formValues.departmentId || ''}
                  placeholder="Chọn chuyên ngành"
                  onChange={(value) => {
                    setValue('departmentId', value)
                    clearErrors('departmentId')
                  }}
                  buttonClassName={errors.departmentId ? 'border-red-500' : ''}
                />
                {errors.departmentId && (
                  <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Số tín chỉ
                </label>
                <Input value={0} disabled className="bg-gray-50 cursor-not-allowed" />
                <p className="mt-1 text-xs text-gray-500">Tự động tính sau khi thêm môn học</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phiên bản <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('versionNumber')}
                  className={errors.versionNumber ? 'border-red-500' : ''}
                />
                {errors.versionNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.versionNumber.message}</p>
                )}
              </div>
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
              {isSubmitting ? 'Đang lưu...' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
