"use client"

import { Button } from "@/app/components/ui"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"

interface BulkDeleteCurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedCount: number
  isLoading?: boolean
}

export const BulkDeleteCurriculumModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading,
}: BulkDeleteCurriculumModalProps) => {
  const t = useTranslations('admin.curriculumManagement')
  const tActions = useTranslations('actions')
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-red-100">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-red-50 via-white to-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
              {t('modals.bulkDelete.title')}
            </p>
            <h2 className="mt-1 text-base font-semibold text-gray-900">
              {t('modals.bulkDelete.description', { count: selectedCount })}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {t('modals.bulkDelete.helperIntro')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 shrink-0"
            type="button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 space-y-2">
            <p className="font-semibold">{t('modals.bulkDelete.warningTitle')}</p>
            <p>{t('modals.bulkDelete.warningDescription')}</p>
            <ul className="list-disc list-inside text-xs text-red-700 space-y-1 mt-1">
              <li>{t('modals.bulkDelete.warningPoint1')}</li>
              <li>{t('modals.bulkDelete.warningPoint2')}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-t bg-gray-50 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {tActions('cancel')}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('modals.bulkDelete.submitting') : t('modals.bulkDelete.submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}
