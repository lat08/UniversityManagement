'use client'

import { Button } from '@/app/components/ui'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('admin.curriculumManagement')
  const tActions = useTranslations('actions')
  if (!isOpen) return null

  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }
  const safeName = curriculumName ?? tActions('noName')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-red-50 via-white to-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
              {t('modals.confirmDelete.title')}
            </p>
            <h2 className="mt-1 text-base font-semibold text-gray-900">
              {t('modals.confirmDelete.description', { name: safeName })}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-red-700">{t('modals.confirmDelete.note')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {tActions('cancel')}
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            {t('modals.confirmDelete.submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}
