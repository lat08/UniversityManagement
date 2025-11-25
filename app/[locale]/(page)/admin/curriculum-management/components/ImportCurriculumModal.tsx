'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Dropdown, DropdownSearch } from '@/app/components/ui'
import { X, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { curriculumsApi } from '../lib/api/curriculumsApi'
import type { DepartmentOption, FacultyOption } from '../lib/types/types'
import { useTranslations } from 'next-intl'

interface ImportCurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const ImportCurriculumModal = ({ isOpen, onClose, onSuccess }: ImportCurriculumModalProps) => {
  const t = useTranslations('admin.curriculumManagement')
  const tActions = useTranslations('actions')
  const [file, setFile] = useState<File | null>(null)
  const [curriculumCode, setCurriculumCode] = useState('')
  const [curriculumName, setCurriculumName] = useState('')
  const [appliedYear, setAppliedYear] = useState<number | ''>('')
  const [faculties, setFaculties] = useState<FacultyOption[]>([])
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      setSelectedDepartmentId('')
      return
    }

    curriculumsApi.getDepartments(selectedFacultyId).then((res) => {
      if (res.success && res.data) setDepartments(res.data)
    })
  }, [selectedFacultyId])

  const resetState = () => {
    setFile(null)
    setCurriculumCode('')
    setCurriculumName('')
    setAppliedYear('')
    setSelectedFacultyId('')
    setSelectedDepartmentId('')
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetState()
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    if (!validTypes.includes(f.type)) {
      toast.error(t('modals.import.fileTypeError'))
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error(t('modals.import.fileSizeError'))
      return
    }

    setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error(t('modals.import.fileRequired'))
      return
    }
    if (!curriculumCode || !curriculumName || !selectedDepartmentId || !appliedYear) {
      toast.error(t('modals.import.infoRequired'))
      return
    }

    setIsSubmitting(true)
    try {
      const res = await curriculumsApi.importCurriculum({
        file,
        curriculumCode,
        curriculumName,
        departmentId: selectedDepartmentId,
        appliedYear: Number(appliedYear),
      })

      if (res.success) {
        toast.success(res.message || t('modals.import.success'))
        onSuccess?.()
        handleClose()
      } else {
        toast.error(res.message || t('modals.import.error'))
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || t('modals.import.generalError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const facultyOptions = faculties.map((f) => ({ value: f.facultyId, label: f.facultyName }))
  const departmentOptions = departments.map((d) => ({ value: d.departmentId, label: d.departmentName }))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('modals.import.title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('modals.import.description')}</p>
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">{t('modals.import.fileLabel')}</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="text-sm"
                />
                {file && <span className="text-xs text-gray-600 truncate max-w-[200px]">{file.name}</span>}
              </div>
              <p className="mt-1 text-xs text-gray-500">{t('modals.import.fileHelper')}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('fields.code.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={curriculumCode}
                  onChange={(e) => setCurriculumCode(e.target.value.toUpperCase())}
                  placeholder={t('fields.code.placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('fields.name.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={curriculumName}
                  onChange={(e) => setCurriculumName(e.target.value)}
                  placeholder={t('fields.name.placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t('fields.faculty.label')}</label>
                <DropdownSearch
                  options={facultyOptions}
                  value={selectedFacultyId}
                  placeholder={t('fields.faculty.placeholder')}
                  searchPlaceholder={t('fields.faculty.searchPlaceholder')}
                  onChange={(value) => {
                    setSelectedFacultyId(value)
                    setSelectedDepartmentId('')
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('fields.department.label')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={departmentOptions}
                  value={selectedDepartmentId}
                  placeholder={t('fields.department.placeholder')}
                  onChange={(value) => setSelectedDepartmentId(value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('fields.appliedYear.label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={appliedYear}
                  onChange={(e) => setAppliedYear(e.target.value ? Number(e.target.value) : '')}
                  placeholder={t('fields.appliedYear.placeholder')}
                />
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
              {tActions('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-1" />
              {isSubmitting ? t('modals.import.submitting') : t('modals.import.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
