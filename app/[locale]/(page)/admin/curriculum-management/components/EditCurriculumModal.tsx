'use client'

import { useEffect, useState, useCallback, useMemo, type MouseEvent } from 'react'
import { Button, Input } from '@/app/components/ui'
import { X } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { ObjectSchema } from 'yup'
import { toast } from 'react-hot-toast'
import { curriculumsApi } from '../lib/api/curriculumsApi'
import type { CurriculumListItem } from '../lib/types/types'
import { useTranslations } from 'next-intl'

interface EditCurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  curriculum: CurriculumListItem | null
}

type FormData = {
  curriculumName: string
  appliedYear: number
}

export const EditCurriculumModal = ({ isOpen, onClose, onSuccess, curriculum }: EditCurriculumModalProps) => {
  const t = useTranslations('admin.curriculumManagement')
  const tActions = useTranslations('common.actions')
  const validationSchema = useMemo<ObjectSchema<FormData>>(
    () =>
      yup.object({
        curriculumName: yup
          .string()
          .required(t('fields.name.required'))
          .max(500, t('fields.name.max')),
        appliedYear: yup
          .number()
          .typeError(t('fields.appliedYear.typeError'))
          .required(t('fields.appliedYear.required'))
          .min(1900, t('fields.appliedYear.min'))
          .max(2100, t('fields.appliedYear.max')),
      }),
    [t],
  )
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
        toast.success(response.message || t('modals.edit.success'))
        reset()
        onSuccess?.()
        handleClose()
      } else {
        toast.error(response.message || t('modals.edit.error'))
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || t('modals.edit.generalError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !curriculum) return null

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-[#0053AD]/5 via-white to-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0053AD]">
                {t('modals.edit.title')}
              </p>
              <h2 className="mt-1 text-base font-semibold text-gray-900 truncate">
                {t('modals.edit.description')}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {t('modals.edit.helperIntro')}
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
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">{t('fields.code.label')}</label>
              <Input value={curriculum.curriculumCode} disabled className="bg-gray-50 cursor-not-allowed" />
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
              <label className="block text-sm font-medium text-gray-900 mb-2">{t('fields.faculty.label')}</label>
              <Input value={curriculum.facultyName || curriculum.departmentName} disabled className="bg-gray-50 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">{t('fields.credits.label')}</label>
              <Input value={curriculum.totalCredits} disabled className="bg-gray-50 cursor-not-allowed" />
              <p className="mt-1 text-xs text-gray-500">{t('fields.credits.note')}</p>
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
              {isSubmitting ? t('modals.edit.submitting') : t('modals.edit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
