"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Upload } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog"
import { DropdownSearch, Dropdown } from "@/app/components/ui"
import { handleFileClick, handleFileDrop, handleDragOver, handleFileInputChange } from "../lib/utils/modalHandlers"

interface UploadDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: UploadFormData) => Promise<void>
  courseClasses?: { id: string; name: string }[]
  documentTypes?: { id: string; name: string }[]
  isUploading?: boolean
  isLoadingCourseClasses?: boolean
}

export interface UploadFormData {
  subjectClass: string
  documentType: string
  documentName: string
  description: string
  file: File | null
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  onSubmit,
  courseClasses = [],
  documentTypes = [],
  isUploading = false,
  isLoadingCourseClasses = false,
}: UploadDocumentModalProps) {
  const t = useTranslations('instructor.materials.modals.uploadDocument')
  const tCommon = useTranslations('common.actions')
  
  const [formData, setFormData] = useState<UploadFormData>({
    subjectClass: "",
    documentType: "",
    documentName: "",
    description: "",
    file: null,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof UploadFormData, string>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof UploadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileInputChange(e, setFormData, setErrors, false)
  }

  const onFileClick = () => handleFileClick(fileInputRef)

  const onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleFileDrop(e, setFormData, setErrors, false)
  }

  const onDragOver = handleDragOver

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UploadFormData, string>> = {}

    if (!formData.subjectClass) {
      newErrors.subjectClass = t('subjectClassRequired')
    }
    if (!formData.documentType) {
      newErrors.documentType = t('documentTypeRequired')
    }
    if (!formData.documentName.trim()) {
      newErrors.documentName = t('documentNameRequired')
    }
    if (!formData.file) {
      newErrors.file = t('fileRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm() && onSubmit) {
      await onSubmit(formData)
    }
  }

  const handleClose = () => {
    if (isUploading) return
    
    setFormData({
      subjectClass: "",
      documentType: "",
      documentName: "",
      description: "",
      file: null,
    })
    setErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              {t('subjectClass')}
              <span className="text-red-500">*</span>
            </label>
            {isLoadingCourseClasses ? (
              <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 flex items-center justify-center">
                <span className="text-sm text-gray-500">{tCommon('loading')}</span>
              </div>
            ) : (
              <DropdownSearch
                options={courseClasses.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={formData.subjectClass}
                onChange={(value) => handleInputChange("subjectClass", value)}
                placeholder={t('selectSubjectClass')}
                buttonClassName="border-gray-300"
                disabled={isUploading}
              />
            )}
            {errors.subjectClass && (
              <p className="text-sm text-red-500">{errors.subjectClass}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              {t('documentType')}
              <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={documentTypes.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              value={formData.documentType}
              onChange={(value) => handleInputChange("documentType", value)}
              placeholder={t('selectDocumentType')}
              buttonClassName="border-gray-300"
              disabled={isUploading}
            />
            {errors.documentType && (
              <p className="text-sm text-red-500">{errors.documentType}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              {t('documentName')}
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder={t('documentNamePlaceholder')}
              value={formData.documentName}
              onChange={(e) => handleInputChange("documentName", e.target.value)}
              className="border-gray-300"
              disabled={isUploading}
            />
            {errors.documentName && (
              <p className="text-sm text-red-500">{errors.documentName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              {t('description')}
            </label>
            <textarea
              placeholder={t('descriptionPlaceholder')}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              rows={3}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              disabled={isUploading}
            />
            <div
              onClick={isUploading ? undefined : onFileClick}
              onDrop={isUploading ? undefined : onFileDrop}
              onDragOver={isUploading ? undefined : onDragOver}
              className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${
                isUploading 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {t('dragDrop')} <span className="text-blue-600 underline">{t('clickToUpload')}</span>
                  </p>
                  {formData.file && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.file.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {t('supportedFormats')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('maxSize')}
                  </p>
                </div>
              </div>
            </div>
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={isUploading}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isUploading}
            >
              {isUploading ? t('uploading') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

