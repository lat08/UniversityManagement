'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button, Dropdown, DropdownSearch } from '@/app/components/ui'
import { X, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'react-hot-toast'
import { commonApi } from '@/lib/api/common'
import type { Subject as CommonSubject } from '@/lib/types/common'
import type { CurriculumDetail } from '../lib/types/types'
import { curriculumsApi } from '../lib/api/curriculumsApi'

interface AddSubjectToCurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  curriculumDetail: CurriculumDetail | null
  onSuccess?: () => void
}

export const AddSubjectToCurriculumModal = ({
  isOpen,
  onClose,
  curriculumDetail,
  onSuccess,
}: AddSubjectToCurriculumModalProps) => {
  const t = useTranslations('admin.curriculumManagement.subjects')
  const tActions = useTranslations('common.actions')
  const DEBUG_ADD_SUBJECT_MODAL = true
  const debugAddSubjectModal = (...args: unknown[]) => {
    if (!DEBUG_ADD_SUBJECT_MODAL) return
    console.log('[AddSubjectToCurriculumModal]', ...args)
  }
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  /**
   * Dùng kiểu subject đơn giản giống các trang khác (commonApi.getSubjects)
   * nhưng vẫn giữ được một số field quan trọng cho preview.
   */
  const [subjects, setSubjects] = useState<
    Array<
      Pick<
        CommonSubject,
        'subjectId' | 'subjectName' | 'subjectCode' | 'credits' | 'theoryHours' | 'practiceHours' | 'departmentName'
      > & {
        isGeneral?: boolean
      }
    >
  >([])
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedYearIndex, setSelectedYearIndex] = useState<number | ''>('')
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState<number | ''>('')

  // Danh sách năm học cố định (1-4)
  // Note: Backend có thể yêu cầu index bắt đầu từ 1, không phải 0
  const academicYearOptions = useMemo(
    () => [
      { value: '1', label: t('year1') },
      { value: '2', label: t('year2') },
      { value: '3', label: t('year3') },
      { value: '4', label: t('year4') },
    ],
    [t],
  )

  // Danh sách học kỳ cố định (1-3)
  // Note: Backend có thể yêu cầu index bắt đầu từ 1, không phải 0
  const semesterOptions = useMemo(
    () => [
      { value: '1', label: t('semester1') },
      { value: '2', label: t('semester2') },
      { value: '3', label: t('semester3') },
    ],
    [t],
  )

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.subjectId === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId],
  )

  const resetState = () => {
    setIsLoadingSubjects(false)
    setIsSubmitting(false)
    setSubjects([])
    setSelectedSubjectId('')
    setSelectedYearIndex('')
    setSelectedSemesterIndex('')
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetState()
    onClose()
  }

  useEffect(() => {
    if (!isOpen || !curriculumDetail) return

    const loadSubjects = async () => {
      setIsLoadingSubjects(true)
      try {
        /**
         * Dùng commonApi.getSubjects giống các trang FE khác (course-management, subject-management).
         */
        const res = await commonApi.getSubjects()
        if (res.success && res.data) {
          // Map về cấu trúc đơn giản dùng cho modal này
          setSubjects(
            res.data.map((s) => ({
              subjectId: s.subjectId,
              subjectName: s.subjectName,
              subjectCode: s.subjectCode,
              credits: s.credits,
              theoryHours: s.theoryHours,
              practiceHours: s.practiceHours,
              departmentName: s.departmentName,
              // Một số API common có thể trả thêm isGeneral, nếu không có thì để undefined
              isGeneral: (s as unknown as { isGeneral?: boolean }).isGeneral,
            })),
          )
        } else {
          toast.error(res.message || t('loadSubjectsError'))
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string }
        toast.error(err.response?.data?.message || err.message || t('loadSubjectsError'))
      } finally {
        setIsLoadingSubjects(false)
      }
    }

    loadSubjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, curriculumDetail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!curriculumDetail) return
    debugAddSubjectModal('handleSubmit: start', {
      curriculumId: curriculumDetail.curriculumId,
      selectedSubjectId,
      selectedYearIndex,
      selectedSemesterIndex,
    })

    if (!selectedSubjectId || selectedYearIndex === '' || selectedSemesterIndex === '') {
      toast.error(t('addRequired'))
      return
    }

    // Avoid duplicate subject in curriculum
      const alreadyExists =
      curriculumDetail.academicYears
        .flatMap((y) => y.semesters.flatMap((s) => s.subjects))
        .some((s) => s.subjectId === selectedSubjectId) ?? false

    if (alreadyExists) {
      debugAddSubjectModal('handleSubmit: subject already exists in curriculum', {
        curriculumId: curriculumDetail.curriculumId,
        selectedSubjectId,
      })
      toast.error(t('alreadyInCurriculum'))
      return
    }

    setIsSubmitting(true)
    try {
      // Build overwrite list: all existing + new subject (đảm bảo không trùng subjectId)
      const merged = new Map<string, { subjectId: string; academicYearIndex: number; semesterIndex: number }>()

      curriculumDetail.academicYears.forEach((year) => {
        year.semesters.forEach((semester) => {
          semester.subjects.forEach((subject) => {
            const key = subject.subjectId
            if (!merged.has(key)) {
              merged.set(key, {
                subjectId: subject.subjectId,
                academicYearIndex: year.academicYearIndex,
                semesterIndex: semester.semesterIndex,
              })
            }
          })
        })
      })

      const newKey = selectedSubjectId
      const yearIndex = typeof selectedYearIndex === 'number' ? selectedYearIndex : Number(selectedYearIndex)
      const semIndex = typeof selectedSemesterIndex === 'number' ? selectedSemesterIndex : Number(selectedSemesterIndex)
      
      // Validate indexes
      if (isNaN(yearIndex) || yearIndex < 1 || yearIndex > 4) {
        debugAddSubjectModal('handleSubmit: invalid yearIndex', { yearIndex, selectedYearIndex })
        toast.error('Năm học không hợp lệ (phải từ 1-4)')
        setIsSubmitting(false)
        return
      }
      
      if (isNaN(semIndex) || semIndex < 1 || semIndex > 3) {
        debugAddSubjectModal('handleSubmit: invalid semesterIndex', { semIndex, selectedSemesterIndex })
        toast.error('Học kỳ không hợp lệ (phải từ 1-3)')
        setIsSubmitting(false)
        return
      }
      
      if (!merged.has(newKey)) {
        merged.set(newKey, {
          subjectId: selectedSubjectId,
          academicYearIndex: yearIndex,
          semesterIndex: semIndex,
        })
      }

      const payload = {
        subjects: Array.from(merged.values()),
      }

      debugAddSubjectModal('handleSubmit: calling setSubjects', {
        curriculumId: curriculumDetail.curriculumId,
        payload,
        newSubject: {
          subjectId: selectedSubjectId,
          academicYearIndex: yearIndex,
          semesterIndex: semIndex,
        },
      })

      const res = await curriculumsApi.setSubjects(curriculumDetail.curriculumId, payload)
      debugAddSubjectModal('handleSubmit: setSubjects response', res)
      if (res.success) {
        toast.success(res.message || t('addSuccess'))
        onSuccess?.()
        handleClose()
      } else {
        toast.error(res.message || t('addError'))
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: string[] } }; message?: string }
      debugAddSubjectModal('handleSubmit: error', {
        error: err,
        responseData: err.response?.data,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors,
      })
      const errorMessage = err.response?.data?.message || err.message || t('addGeneralError')
      const errors = err.response?.data?.errors
      if (errors && errors.length > 0) {
        toast.error(`${errorMessage}\n${errors.join('\n')}`)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !curriculumDetail) return null

  const subjectOptions = subjects.map((s) => ({
    value: s.subjectId,
    label: `${s.subjectName} (${s.subjectCode})`,
  }))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('addTitle')}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('addSubtitle', {
                code: curriculumDetail.curriculumCode,
                name: curriculumDetail.curriculumName,
              })}
            </p>
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  {t('yearLabel')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={academicYearOptions}
                  value={selectedYearIndex === '' ? '' : String(selectedYearIndex)}
                  placeholder={t('yearPlaceholder')}
                  onChange={(value) => {
                    setSelectedYearIndex(value ? Number(value) : '')
                    setSelectedSemesterIndex('')
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  {t('semesterLabel')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={semesterOptions}
                  value={selectedSemesterIndex === '' ? '' : String(selectedSemesterIndex)}
                  placeholder={t('semesterPlaceholder')}
                  onChange={(value) => setSelectedSemesterIndex(value ? Number(value) : '')}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                {t('subjectLabel')} <span className="text-red-500">*</span>
              </label>

              <div className="relative z-20">
                <DropdownSearch
                  options={subjectOptions}
                  value={selectedSubjectId}
                  placeholder={t('subjectPlaceholder')}
                  searchPlaceholder={t('subjectSearchPlaceholder')}
                  onChange={setSelectedSubjectId}
                  buttonClassName={isLoadingSubjects ? 'opacity-70 cursor-wait' : ''}
                />
              </div>

              {selectedSubject && (
                <div className="mt-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                  <div className="font-semibold">
                    {selectedSubject.subjectName} ({selectedSubject.subjectCode}) •{' '}
                    {selectedSubject.credits} {t('creditsShort')}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      {selectedSubject.theoryHours}/{selectedSubject.practiceHours} {t('hoursShort')}
                    </span>
                    <span>
                      {selectedSubject.isGeneral ? t('type.general') : t('type.specialized')}
                    </span>
                    <span>{selectedSubject.departmentName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 p-5 border-t">
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
              <Plus className="w-4 h-4 mr-1" />
              {isSubmitting ? t('addSubmitting') : t('addSubmit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


