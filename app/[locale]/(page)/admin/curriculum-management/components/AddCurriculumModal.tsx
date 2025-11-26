'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button, Input, Dropdown, DropdownSearch } from '@/app/components/ui'
import { X } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { ObjectSchema } from 'yup'
import { toast } from 'react-hot-toast'
import { curriculumsApi } from '../lib/api/curriculumsApi'
import type { DepartmentOption, FacultyOption } from '../lib/types/types'
import { useTranslations } from 'next-intl'

interface AddCurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type FormData = {
  curriculumCode: string
  curriculumName: string
  departmentId: string
  appliedYear: number
  versionNumber: number
}

export const AddCurriculumModal = ({ isOpen, onClose, onSuccess }: AddCurriculumModalProps) => {
  const t = useTranslations('admin.curriculumManagement')
  const tActions = useTranslations('actions')
  const validationSchema = useMemo<ObjectSchema<FormData>>(
    () =>
      yup.object({
        curriculumCode: yup
          .string()
          .required(t('fields.code.required'))
          .max(50, t('fields.code.max')),
        curriculumName: yup
          .string()
          .required(t('fields.name.required'))
          .max(500, t('fields.name.max')),
        departmentId: yup.string().required(t('fields.department.required')),
        appliedYear: yup
          .number()
          .typeError(t('fields.appliedYear.typeError'))
          .required(t('fields.appliedYear.required'))
          .min(1900, t('fields.appliedYear.min'))
          .max(2100, t('fields.appliedYear.max')),
        versionNumber: yup
          .number()
          .typeError(t('fields.version.typeError'))
          .required(t('fields.version.required'))
          .min(1, t('fields.version.min')),
      }),
    [t],
  )
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
        toast.success(response.message || t('modals.add.success'))
        reset()
        onSuccess?.()
        handleClose()
      } else {
        toast.error(response.message || t('modals.add.error'))
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || t('modals.add.generalError'))
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-[#0053AD]/5 via-white to-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0053AD]">
                {t('modals.add.title')}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900 truncate">
                {t('modals.add.description')}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {t('modals.add.helperIntro')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 shrink-0"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
            <div className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3 text-xs text-gray-600">
              <p className="font-medium text-gray-800 mb-1">
                {t('modals.add.summaryTitle')}
              </p>
              <p className="mb-1">
                {t('modals.add.summaryLine1')}
              </p>
              <p>{t('modals.add.summaryLine2')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('fields.code.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('fields.code.placeholder')}
                  {...register('curriculumCode')}
                  className={errors.curriculumCode ? 'border-red-500' : ''}
                />
                {errors.curriculumCode && (
                  <p className="mt-1 text-xs text-red-500">{errors.curriculumCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('fields.name.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('fields.name.placeholder')}
                  {...register('curriculumName')}
                  className={errors.curriculumName ? 'border-red-500' : ''}
                />
                {errors.curriculumName && (
                  <p className="mt-1 text-xs text-red-500">{errors.curriculumName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('fields.faculty.label')}
                </label>
                <DropdownSearch
                  options={facultyOptions}
                  value={selectedFacultyId}
                  placeholder={t('fields.faculty.placeholder')}
                  searchPlaceholder={t('fields.faculty.searchPlaceholder')}
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
                  {t('fields.department.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={departmentOptions}
                  value={formValues.departmentId || ''}
                  placeholder={t('fields.department.placeholder')}
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
                  {t('fields.appliedYear.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder={t('fields.appliedYear.placeholder')}
                  {...register('appliedYear')}
                  className={errors.appliedYear ? 'border-red-500' : ''}
                />
                {errors.appliedYear && (
                  <p className="mt-1 text-xs text-red-500">{errors.appliedYear.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('fields.version.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder={t('fields.version.placeholder')}
                  {...register('versionNumber')}
                  className={errors.versionNumber ? 'border-red-500' : ''}
                />
                {errors.versionNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.versionNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              {tActions('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('modals.add.submitting') : t('modals.add.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
