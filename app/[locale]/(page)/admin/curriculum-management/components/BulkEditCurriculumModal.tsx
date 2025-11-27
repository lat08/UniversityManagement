'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'react-hot-toast'
import { Button, Dropdown } from '@/app/components/ui'
import { curriculumsApi } from '../lib/api/curriculumsApi'

interface BulkEditCurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  selectedCurriculumIds: string[]
}

export const BulkEditCurriculumModal = ({
  isOpen,
  onClose,
  onSuccess,
  selectedCurriculumIds,
}: BulkEditCurriculumModalProps) => {
  const t = useTranslations('admin.curriculumManagement')
  const tActions = useTranslations('actions')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<string>('')

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setStatus('')
      onClose()
    }
  }, [isSubmitting, onClose])

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

  const statusOptions = useMemo(
    () => [
      { value: '', label: t('modals.bulkEdit.statusNoChange') },
      { value: 'active', label: t('table.status.active') },
      { value: 'inactive', label: t('table.status.inactive') },
    ],
    [t],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!status) {
      toast.error(t('modals.bulkEdit.validation'))
      return
    }

    setIsSubmitting(true)
    try {
      const isActive = status === 'active'
      const res = await curriculumsApi.bulkUpdateCurriculumStatus(selectedCurriculumIds, isActive)

      if (res.success) {
        toast.success(
          (res.message as string | undefined) ??
            t('modals.bulkEdit.success', { count: selectedCurriculumIds.length }),
        )
        setStatus('')
        onSuccess?.()
        handleClose()
      } else {
        toast.error(
          (res.message as string | undefined) ?? t('modals.bulkEdit.error'),
        )
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(
        err.response?.data?.message ||
          err.message ||
          t('modals.bulkEdit.generalError'),
      )
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

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-[#0053AD]/5 via-white to-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0053AD]">
              {t('modals.bulkEdit.title')}
            </p>
            <h2 className="mt-1 text-base font-semibold text-gray-900">
              {t('modals.bulkEdit.description', { count: selectedCurriculumIds.length })}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {t('modals.bulkEdit.helperIntro')}
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('modals.bulkEdit.statusLabel')}
              </label>
              <Dropdown
                options={statusOptions}
                value={status}
                placeholder={t('modals.bulkEdit.statusPlaceholder')}
                onChange={setStatus}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('modals.bulkEdit.statusNote')}
              </p>
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
              {isSubmitting ? t('modals.bulkEdit.submitting') : t('modals.bulkEdit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


