'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, MoreVertical, Upload, Download, Trash2, Edit, X } from 'lucide-react'
import { Dropdown, DropdownSearch, SearchInput, Button } from '@/app/components/ui'
import { Pagination } from '@/app/components/ui/pagination'
import { useCurriculums } from './lib/hooks/useCurriculums'
import { curriculumsApi } from './lib/api/curriculumsApi'
import type {
  CurriculumAcademicYear,
  CurriculumDetail,
  CurriculumListItem,
  CurriculumSemester,
  DepartmentOption,
  FacultyOption,
} from './lib/types/types'
import { ResizableTable, ResizableColumn } from '../student-profile/components/ResizableTable'
import { TableSkeleton } from '../student-profile/components/LoadingSkeleton'
import { AddCurriculumModal } from './components/AddCurriculumModal'
import { ConfirmDeleteCurriculumModal } from './components/ConfirmDeleteCurriculumModal'
import { ImportCurriculumModal } from './components/ImportCurriculumModal'
import { EditCurriculumModal } from './components/EditCurriculumModal'
import { BulkDeleteCurriculumModal } from './components/BulkDeleteCurriculumModal'
import { BulkEditCurriculumModal } from './components/BulkEditCurriculumModal'
import { AddSubjectToCurriculumModal } from './components/AddSubjectToCurriculumModal'
import { toast } from 'react-hot-toast'

const PAGE_SIZE = 10

const DEBUG_CURRICULUM_PAGE = false

const debugCurriculumPage = (...args: unknown[]) => {
  if (!DEBUG_CURRICULUM_PAGE) return
  console.log('[CurriculumManagementPage]', ...args)
}

type CurriculumActionsMenuProps = {
  item: CurriculumListItem
  onExport: (item: CurriculumListItem) => void
  onEdit: (item: CurriculumListItem) => void
  onDelete: (item: CurriculumListItem) => void
}

function CurriculumActionsMenu({ item, onExport, onEdit, onDelete }: CurriculumActionsMenuProps) {
  const t = useTranslations('admin.curriculumManagement.actionsMenu')
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-1 w-44 rounded-md bg-white shadow-lg border border-gray-200 z-10">
          <div className="py-1 text-sm text-gray-700">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                onEdit(item)
                setOpen(false)
              }}
            >
              <Edit className="w-4 h-4 text-green-600" />
              <span>{t('edit')}</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                onExport(item)
                setOpen(false)
              }}
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>{t('export')}</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                onDelete(item)
                setOpen(false)
              }}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>{t('delete')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CurriculumManagementPage() {
  const t = useTranslations('admin.curriculumManagement')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [faculties, setFaculties] = useState<FacultyOption[]>([])
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<Set<string>>(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [deletingCurriculum, setDeletingCurriculum] = useState<CurriculumListItem | null>(null)
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumListItem | null>(null)
  const [addingSubjectsCurriculumId, setAddingSubjectsCurriculumId] = useState<string | null>(null)
  const [expandedCurriculumId, setExpandedCurriculumId] = useState<string | null>(null)
  const [curriculumDetails, setCurriculumDetails] = useState<Record<string, CurriculumDetail>>({})
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null)
  const [savingSubjectsId, setSavingSubjectsId] = useState<string | null>(null)
  const [removingSubjectsId, setRemovingSubjectsId] = useState<string | null>(null)
  const [removingDetailIdsByCurriculum, setRemovingDetailIdsByCurriculum] = useState<
    Record<string, Set<string>>
  >({})
  const [draggingSubject, setDraggingSubject] = useState<{
    curriculumId: string
    curriculumDetailId: string
  } | null>(null)

  const { curriculums, loading, currentPage, totalCount, totalPages, fetchCurriculums, setCurrentPage } =
    useCurriculums()

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>(() => [
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'code', label: t('table.columns.code'), width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    {
      key: 'name',
      label: t('table.columns.name'),
      width: 260,
      minWidth: 200,
      align: 'left',
      visible: true,
      required: true,
    },
    { key: 'faculty', label: t('table.columns.faculty'), width: 220, minWidth: 160, align: 'left', visible: true },
    { key: 'credits', label: t('table.columns.credits'), width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'year', label: t('table.columns.year'), width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'status', label: t('table.columns.status'), width: 150, minWidth: 130, align: 'center', visible: true },
    { key: 'actions', label: t('table.columns.actions'), width: 80, minWidth: 70, align: 'center', visible: true, required: true },
  ])

  useEffect(() => {
    curriculumsApi.getFaculties().then((res) => {
      if (res.success && res.data) {
        setFaculties(res.data)
      }
    })
  }, [])

  const handleDeleteClick = (item: CurriculumListItem) => {
    setDeletingCurriculum(item)
    setIsDeleteModalOpen(true)
  }

  const toggleExpandCurriculum = async (item: CurriculumListItem) => {
    debugCurriculumPage('toggleExpandCurriculum: clicked', {
      curriculumId: item.curriculumId,
      curriculumCode: item.curriculumCode,
    })

    const id = item.curriculumId
    if (expandedCurriculumId === id) {
      debugCurriculumPage('toggleExpandCurriculum: collapse', { curriculumId: id })
      setExpandedCurriculumId(null)
      return
    }

    setExpandedCurriculumId(id)
    if (curriculumDetails[id]) return

    try {
      setDetailLoadingId(id)
      debugCurriculumPage('toggleExpandCurriculum: loading detail', { curriculumId: id })
      const res = await curriculumsApi.getCurriculumDetail(id)
      if (res.success && res.data) {
        debugCurriculumPage('toggleExpandCurriculum: detail loaded', res.data)
        setCurriculumDetails((prev) => ({
          ...prev,
          [id]: res.data,
        }))
      } else {
        debugCurriculumPage('toggleExpandCurriculum: detail failed', res)
        toast.error(res.message || t('toast.detailError'))
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      debugCurriculumPage('toggleExpandCurriculum: exception', err)
      toast.error(err.response?.data?.message || err.message || t('toast.detailError'))
    } finally {
      setDetailLoadingId(null)
    }
  }

  const handleExport = async (item: CurriculumListItem) => {
    try {
      const blob = await curriculumsApi.exportCurriculum(item.curriculumId, false)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CTDT_${item.curriculumCode}_${new Date()
        .toISOString()
        .split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(t('toast.exportSuccess'))
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || t('toast.exportError'))
    }
  }

  const handleEdit = (item: CurriculumListItem) => {
    setEditingCurriculum(item)
    setIsEditModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCurriculum) return
    try {
      const res = await curriculumsApi.deleteCurriculum(deletingCurriculum.curriculumId)
      if (res.success) {
        toast.success(res.message || t('toast.deleteSuccess'))
        setSelectedCurriculumIds((prev) => {
          const next = new Set(prev)
          next.delete(deletingCurriculum.curriculumId)
          return next
        })
        await fetchCurriculums({
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
          searchKeyword: searchKeyword || undefined,
          facultyId: selectedFacultyId || undefined,
          departmentId: selectedDepartmentId || undefined,
        })
      } else {
        toast.error(res.message || t('toast.deleteError'))
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || t('toast.deleteGeneralError'))
    }
  }

  useEffect(() => {
    if (!selectedFacultyId) {
      setDepartments([])
      setSelectedDepartmentId('')
      return
    }

    curriculumsApi.getDepartments(selectedFacultyId).then((res) => {
      if (res.success && res.data) {
        setDepartments(res.data)
      }
    })
  }, [selectedFacultyId])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, setCurrentPage])

  useEffect(() => {
    fetchCurriculums({
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
      searchKeyword: searchKeyword || undefined,
      facultyId: selectedFacultyId || undefined,
      departmentId: selectedDepartmentId || undefined,
    })
  }, [currentPage, searchKeyword, selectedFacultyId, selectedDepartmentId, fetchCurriculums])

  const facultyOptions = useMemo(
    () => [
      { value: '', label: t('filters.allFaculties') },
      ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
    ],
    [faculties, t],
  )

  const departmentOptions = useMemo(
    () => [
      { value: '', label: t('filters.allDepartments') },
      ...departments.map((d) => ({ value: d.departmentId, label: d.departmentName })),
    ],
    [departments, t],
  )

  const filteredCurriculums = useMemo(
    () => {
      if (!selectedStatus) return curriculums
      const wantActive = selectedStatus === 'active'
      return curriculums.filter((c) => c.isActive === wantActive)
    },
    [curriculums, selectedStatus],
  )

  const handleSelectAll = () => {
    if (selectedCurriculumIds.size === filteredCurriculums.length) {
      setSelectedCurriculumIds(new Set())
    } else {
      setSelectedCurriculumIds(new Set(filteredCurriculums.map((c) => c.curriculumId)))
    }
  }

  const handleSelectOne = (curriculumId: string) => {
    setSelectedCurriculumIds((prev) => {
      const next = new Set(prev)
      if (next.has(curriculumId)) {
        next.delete(curriculumId)
      } else {
        next.add(curriculumId)
      }
      return next
    })
  }

  const handleBulkEditSelected = () => {
    if (selectedCurriculumIds.size === 0) return
    setIsBulkEditModalOpen(true)
  }

  const handleBulkDeleteSelected = () => {
    if (selectedCurriculumIds.size === 0) return
    setIsBulkDeleteModalOpen(true)
  }

  const handleToggleSubjectForRemove = (curriculumId: string, curriculumDetailId: string) => {
    setRemovingDetailIdsByCurriculum((prev) => {
      const currentSet = new Set(prev[curriculumId] ?? [])
      if (currentSet.has(curriculumDetailId)) {
        currentSet.delete(curriculumDetailId)
      } else {
        currentSet.add(curriculumDetailId)
      }
      return {
        ...prev,
        [curriculumId]: currentSet,
      }
    })
  }

  const handleRemoveSelectedSubjects = async (curriculumId: string) => {
    const selected = Array.from(removingDetailIdsByCurriculum[curriculumId] ?? [])
    if (selected.length === 0) {
      toast(t('subjects.noSelectedForRemove'))
      return
    }

    try {
      setRemovingSubjectsId(curriculumId)
      debugCurriculumPage('handleRemoveSelectedSubjects: request', {
        curriculumId,
        curriculumDetailIds: selected,
      })
      const res = await curriculumsApi.removeSubjects(curriculumId, {
        curriculumDetailIds: selected,
      })
      if (res.success) {
        debugCurriculumPage('handleRemoveSelectedSubjects: success', res)
        toast.success(res.message || t('subjects.removeSuccess'))
        // Reload detail
        const detailRes = await curriculumsApi.getCurriculumDetail(curriculumId)
        if (detailRes.success && detailRes.data) {
          debugCurriculumPage('handleRemoveSelectedSubjects: reload detail success', detailRes.data)
          setCurriculumDetails((prev) => ({
            ...prev,
            [curriculumId]: detailRes.data,
          }))
        }
        setRemovingDetailIdsByCurriculum((prev) => ({
          ...prev,
          [curriculumId]: new Set(),
        }))
      } else {
        debugCurriculumPage('handleRemoveSelectedSubjects: failed', res)
        toast.error(res.message || t('subjects.removeError'))
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      debugCurriculumPage('handleRemoveSelectedSubjects: exception', err)
      toast.error(err.response?.data?.message || err.message || t('subjects.removeGeneralError'))
    } finally {
      setRemovingSubjectsId(null)
    }
  }

  const collectSubjectPositions = (detail: CurriculumDetail) =>
    /**
     * Thu thập danh sách môn theo (subjectId, năm, học kỳ) và đảm bảo
     * không có subjectId trùng lặp trong payload gửi backend.
     *
     * Nếu vì lý do nào đó cùng một môn xuất hiện ở nhiều vị trí,
     * chúng ta chỉ giữ lại 1 bản ghi theo subjectId để tránh backend báo lỗi.
     */
    Array.from(
      detail.academicYears.reduce((map, year) => {
        year.semesters.forEach((semester) => {
          semester.subjects.forEach((subject) => {
            const key = subject.subjectId
            if (!map.has(key)) {
              map.set(key, {
                subjectId: subject.subjectId,
                academicYearIndex: year.academicYearIndex,
                semesterIndex: semester.semesterIndex,
              })
            }
          })
        })
        return map
      }, new Map<string, { subjectId: string; academicYearIndex: number; semesterIndex: number }>() ).values(),
    )

  const handleSaveSubjects = async (curriculumId: string) => {
    const detail = curriculumDetails[curriculumId]
    if (!detail) return

    try {
      setSavingSubjectsId(curriculumId)
      const subjectsPayload = collectSubjectPositions(detail)
      debugCurriculumPage('handleSaveSubjects: request', {
        curriculumId,
        subjects: subjectsPayload,
      })
      const payload = { subjects: subjectsPayload }

      // Log body trước khi gửi request để dễ debug
      // eslint-disable-next-line no-console
      console.log('[CurriculumManagementPage] setSubjects payload', {
        curriculumId,
        payload,
      })

      const res = await curriculumsApi.setSubjects(curriculumId, payload)
      if (res.success) {
        debugCurriculumPage('handleSaveSubjects: success', res)
        toast.success(res.message || t('subjects.saveSuccess'))
        // Reload list and detail to sync totals
        await fetchCurriculums({
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
          searchKeyword: searchKeyword || undefined,
          facultyId: selectedFacultyId || undefined,
          departmentId: selectedDepartmentId || undefined,
        })
        const detailRes = await curriculumsApi.getCurriculumDetail(curriculumId)
        if (detailRes.success && detailRes.data) {
          debugCurriculumPage('handleSaveSubjects: reload detail success', detailRes.data)
          setCurriculumDetails((prev) => ({
            ...prev,
            [curriculumId]: detailRes.data,
          }))
        }
      } else {
        debugCurriculumPage('handleSaveSubjects: failed', res)
        toast.error(res.message || t('subjects.saveError'))
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      debugCurriculumPage('handleSaveSubjects: exception', err)
      toast.error(err.response?.data?.message || err.message || t('subjects.saveGeneralError'))
    } finally {
      setSavingSubjectsId(null)
    }
  }

  const moveSubjectToSemester = (
    curriculumId: string,
    curriculumDetailId: string,
    targetYear: CurriculumAcademicYear,
    targetSemester: CurriculumSemester,
  ) => {
    setCurriculumDetails((prev) => {
      const detail = prev[curriculumId]
      if (!detail) return prev

      debugCurriculumPage('moveSubjectToSemester: start', {
        curriculumId,
        curriculumDetailId,
        targetYearIndex: targetYear.academicYearIndex,
        targetSemesterIndex: targetSemester.semesterIndex,
      })

      // Deep clone academicYears structure shallowly
      const newAcademicYears = detail.academicYears.map((year) => ({
        ...year,
        semesters: year.semesters.map((semester) => ({
          ...semester,
          subjects: [...semester.subjects],
        })),
      }))

      let subjectToMove: CurriculumSemester['subjects'][number] | null = null

      for (const year of newAcademicYears) {
        for (const semester of year.semesters) {
          const index = semester.subjects.findIndex(
            (s) => s.curriculumDetailId === curriculumDetailId,
          )
          if (index !== -1) {
            subjectToMove = semester.subjects[index]
            semester.subjects.splice(index, 1)
            break
          }
        }
        if (subjectToMove) break
      }

      if (!subjectToMove) return prev

      const targetYearRef = newAcademicYears.find(
        (y) => y.academicYearIndex === targetYear.academicYearIndex,
      )
      const targetSemesterRef = targetYearRef?.semesters.find(
        (s) => s.semesterIndex === targetSemester.semesterIndex,
      )

      if (!targetSemesterRef) return prev
      targetSemesterRef.subjects.push(subjectToMove)

      debugCurriculumPage('moveSubjectToSemester: completed', {
        curriculumId,
        curriculumDetailId,
        newYearIndex: targetYearRef?.academicYearIndex,
        newSemesterIndex: targetSemesterRef.semesterIndex,
      })

      return {
        ...prev,
        [curriculumId]: {
          ...detail,
          academicYears: newAcademicYears,
        },
      }
    })
  }

  const renderRow = (
    item: CurriculumListItem,
    visibleColumns: ResizableColumn[],
    cellStyle: { paddingX: string; paddingY: string },
  ) => {
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0)
    const isSelected = selectedCurriculumIds.has(item.curriculumId)

    return (
      <>
        {visibleColumns.map((column) => {
          const widthPercent =
            (column as { widthPercent?: number }).widthPercent ||
            (baseTotalWidth > 0 ? (column.width / baseTotalWidth) * 100 : 100 / visibleColumns.length)

          const cellPaddingStyle: React.CSSProperties = {
            width: `${widthPercent}%`,
            paddingLeft: cellStyle.paddingX,
            paddingRight: cellStyle.paddingX,
            paddingTop: cellStyle.paddingY,
            paddingBottom: cellStyle.paddingY,
          }

          switch (column.key) {
            case 'checkbox':
              return (
                <td key="checkbox" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(item.curriculumId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              )
            case 'code':
              return (
                <td
                  key="code"
                  className="text-gray-900 font-medium"
                  style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-left hover:text-[#0053AD] cursor-pointer"
                    onClick={() => toggleExpandCurriculum(item)}
                  >
                    <span>{item.curriculumCode}</span>
                    <span className="text-xs text-gray-400">
                      {expandedCurriculumId === item.curriculumId ? '▲' : '▼'}
                    </span>
                  </button>
                </td>
              )
            case 'name':
              return (
                <td
                  key="name"
                  className="text-gray-900"
                  style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {item.curriculumName}
                </td>
              )
            case 'faculty':
              return (
                <td
                  key="faculty"
                  className="text-gray-600"
                  style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {item.facultyName || item.departmentName}
                </td>
              )
            case 'credits':
              return (
                <td key="credits" className="text-center text-gray-900" style={cellPaddingStyle}>
                  {item.totalCredits}
                </td>
              )
            case 'year':
              return (
                <td key="year" className="text-center text-gray-900" style={cellPaddingStyle}>
                  {item.appliedYear}
                </td>
              )
            case 'status': {
              const isActive = item.isActive
              const badgeClasses = isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-700'
              const label = isActive ? t('table.status.active') : t('table.status.disabled')

              return (
                <td key="status" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <span className={`text-xs font-medium rounded px-2 py-1 whitespace-nowrap ${badgeClasses}`}>
                      {label}
                    </span>
                  </div>
                </td>
              )
            }
            case 'actions':
              return (
                <td key="actions" style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}>
                  <div className="flex justify-center">
                    <CurriculumActionsMenu
                      item={item}
                      onExport={handleExport}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  </div>
                </td>
              )
            default:
              return null
          }
        })}
      </>
    )
  }

  const renderCurriculumDetail = (curriculumId: string) => {
    const detail = curriculumDetails[curriculumId]
    const isLoading = detailLoadingId === curriculumId && !detail
    const removingLoading = removingSubjectsId === curriculumId
    const savingLoading = savingSubjectsId === curriculumId

    if (isLoading) {
      return (
        <div className="py-4 text-sm text-gray-500">
          {t('subjects.loading')}
        </div>
      )
    }

    if (!detail) {
      return (
        <div className="py-4 text-sm text-gray-500">
          {t('subjects.noData')}
        </div>
      )
    }

    const selectedForRemove = removingDetailIdsByCurriculum[curriculumId]

    return (
      <div className="py-4 h-full flex flex-col overflow-y-auto">
        {/* Header summary + actions (pinned at top of panel) */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 px-0 pb-3">
            <div className="text-sm text-gray-700">
              <div className="font-medium text-gray-900">
                {t('subjects.summary', {
                  totalSubjects: detail.totalSubjects,
                  totalCredits: detail.totalCredits,
                })}
              </div>
              <div className="mt-1 inline-flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0053AD] mr-1" />
                  {t('subjects.totalSubjectsChip', { count: detail.totalSubjects })}
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                  {t('subjects.totalCreditsChip', { credits: detail.totalCredits })}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setAddingSubjectsCurriculumId(curriculumId)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {t('subjects.addButton')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-600 text-red-600 hover:bg-red-50"
                disabled={removingLoading}
                onClick={() => handleRemoveSelectedSubjects(curriculumId)}
              >
                {removingLoading ? t('subjects.removing') : t('subjects.removeSelected')}
              </Button>
              <Button
                size="sm"
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
                disabled={savingLoading}
                onClick={() => handleSaveSubjects(curriculumId)}
              >
                {savingLoading ? t('subjects.saving') : t('subjects.saveAll')}
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll content inside panel: full height within panel body */}
        <div className="mt-3 pr-1">
          <div className="grid gap-4 md:grid-cols-2">
            {detail.academicYears.map((year) => (
              <div
                key={year.academicYearIndex}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{year.academicYearName}</div>
                    <div className="text-xs text-gray-500">
                      {t('subjects.yearSummary', {
                        totalSubjects: year.totalSubjects,
                        totalCredits: year.totalCredits,
                      })}
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {year.semesters.map((semester) => (
                    <div
                      key={semester.semesterIndex}
                      className="px-4 py-3 space-y-2"
                      onDragOver={(e) => {
                        if (draggingSubject?.curriculumId === curriculumId) {
                          e.preventDefault()
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (draggingSubject?.curriculumId === curriculumId) {
                          moveSubjectToSemester(
                            curriculumId,
                            draggingSubject.curriculumDetailId,
                            year,
                            semester,
                          )
                        }
                        setDraggingSubject(null)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-800">{semester.semesterName}</div>
                        <div className="text-xs text-gray-500">
                          {t('subjects.semesterSummary', {
                            totalSubjects: semester.totalSubjects,
                            totalCredits: semester.totalCredits,
                          })}
                        </div>
                      </div>
                      {semester.subjects.length === 0 ? (
                        <div className="mt-2 text-xs text-gray-400 italic">{t('subjects.noSubjects')}</div>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {semester.subjects.map((subject) => {
                            const checked = selectedForRemove?.has(subject.curriculumDetailId) ?? false
                            return (
                              <li
                                key={subject.curriculumDetailId}
                                className="flex items-center justify-between gap-2 rounded-md border border-gray-100 bg-white px-2 py-1.5 text-xs shadow-sm"
                                draggable
                                onDragStart={() =>
                                  setDraggingSubject({
                                    curriculumId,
                                    curriculumDetailId: subject.curriculumDetailId,
                                  })
                                }
                                onDragEnd={() => setDraggingSubject(null)}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 cursor-pointer accent-red-600"
                                    checked={checked}
                                    onChange={() =>
                                      handleToggleSubjectForRemove(curriculumId, subject.curriculumDetailId)
                                    }
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium text-gray-900 truncate">
                                      {subject.subjectName}
                                    </span>
                                    <span className="text-[11px] text-gray-500">
                                      {subject.subjectCode} • {subject.credits} {t('subjects.creditsShort')}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end text-[11px] text-gray-500">
                                  <span>
                                    {subject.theoryHours}/{subject.practiceHours} {t('subjects.hoursShort')}
                                  </span>
                                  <span>
                                    {subject.isGeneral
                                      ? t('subjects.type.general')
                                      : t('subjects.type.specialized')}
                                  </span>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasSelection = selectedCurriculumIds.size > 0

  const panelCurriculum = useMemo(
    () => curriculums.find((c) => c.curriculumId === expandedCurriculumId) ?? null,
    [curriculums, expandedCurriculumId],
  )

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('page.title')}</h1>
        <p className="text-gray-600 mt-1">{t('page.subtitle')}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{t('page.listTitle')}</h2>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload className="w-4 h-4" />
                {t('page.import')}
              </Button>
              <Button
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                {t('page.add')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            <div className="sm:col-span-2">
              <SearchInput
                placeholder={t('page.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownSearch
              options={facultyOptions}
              value={selectedFacultyId}
              placeholder={t('filters.allFaculties')}
              searchPlaceholder={t('fields.faculty.searchPlaceholder')}
              onChange={(value) => {
                setSelectedFacultyId(value)
                setSelectedDepartmentId('')
                setSelectedCurriculumIds(new Set())
                setCurrentPage(1)
              }}
            />

            <DropdownSearch
              options={departmentOptions}
              value={selectedDepartmentId}
              placeholder={t('filters.allDepartments')}
              searchPlaceholder={t('fields.department.searchPlaceholder')}
              onChange={(value) => {
                setSelectedDepartmentId(value)
                setSelectedCurriculumIds(new Set())
                setCurrentPage(1)
              }}
            />

            <Dropdown
              options={[
                { value: '', label: t('filters.allStatuses') },
                { value: 'active', label: t('filters.statusActive') },
              { value: 'disabled', label: t('filters.statusDisabled') },
              ]}
            value={selectedStatus || ''}
              placeholder={t('filters.allStatuses')}
            onChange={(value) => {
              setSelectedStatus(value)
              setCurrentPage(1)
              }}
            />
          </div>

          {hasSelection && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="text-sm font-medium text-[#0053AD]">
                {t('page.bulkSelection', { count: selectedCurriculumIds.size })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                  onClick={handleBulkEditSelected}
                >
                  {t('selection.bulkEdit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={handleBulkDeleteSelected}
                >
                  {t('selection.bulkDelete')}
                </Button>
                <Button
                  size="sm"
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setSelectedCurriculumIds(new Set())}
                >
                  {t('selection.clear')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            <ResizableTable
              columns={resizableColumns}
              data={filteredCurriculums}
              renderRow={(item, visibleColumns, cellStyle) => (
                <tr className="hover:bg-gray-50 transition-colors">
                  {renderRow(item as CurriculumListItem, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage={t('table.empty')}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={
                    filteredCurriculums.length > 0 &&
                    selectedCurriculumIds.size === filteredCurriculums.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedCurriculumIds.size > 0 &&
                        selectedCurriculumIds.size < filteredCurriculums.length
                    }
                  }}
                />
              )}
            />
          </div>
        </div>

        <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Detail panel for curriculum subjects */}
      {expandedCurriculumId && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <button
            type="button"
            className="flex-1 bg-black/30"
            onClick={() => setExpandedCurriculumId(null)}
          />

          {/* Right side panel */}
          <div className="w-full max-w-3xl md:max-w-4xl h-full bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="px-4 lg:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {t('page.detailPanelLabel')}
                </p>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {panelCurriculum
                    ? `${panelCurriculum.curriculumCode} — ${panelCurriculum.curriculumName}`
                    : t('page.title')}
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpandedCurriculumId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4">
              {renderCurriculumDetail(expandedCurriculumId)}
            </div>
          </div>
        </div>
      )}

      <AddCurriculumModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchCurriculums({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            searchKeyword: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            departmentId: selectedDepartmentId || undefined,
          })
        }}
      />

      <EditCurriculumModal
        isOpen={isEditModalOpen}
        curriculum={editingCurriculum}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingCurriculum(null)
        }}
        onSuccess={() => {
          fetchCurriculums({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            searchKeyword: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            departmentId: selectedDepartmentId || undefined,
          })
        }}
      />

      <ImportCurriculumModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchCurriculums({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            searchKeyword: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            departmentId: selectedDepartmentId || undefined,
          })
        }}
      />

      <ConfirmDeleteCurriculumModal
        isOpen={isDeleteModalOpen}
        curriculumName={deletingCurriculum?.curriculumName}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingCurriculum(null)
        }}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteCurriculumModal
        isOpen={isBulkDeleteModalOpen}
        selectedCount={selectedCurriculumIds.size}
        isLoading={isBulkDeleting}
        onClose={() => {
          if (isBulkDeleting) return
          setIsBulkDeleteModalOpen(false)
        }}
        onConfirm={async () => {
          if (selectedCurriculumIds.size === 0) {
            setIsBulkDeleteModalOpen(false)
            return
          }

          try {
            setIsBulkDeleting(true)
            const ids = Array.from(selectedCurriculumIds)
            const res = await curriculumsApi.bulkDeleteCurriculums(ids)
            if (res.success) {
              toast.success(res.message || t('toast.bulkDeleteSuccess'))
            } else {
              toast.error(res.message || t('toast.bulkDeleteGeneralError'))
            }
            setSelectedCurriculumIds(new Set())
            await fetchCurriculums({
              pageNumber: currentPage,
              pageSize: PAGE_SIZE,
              searchKeyword: searchKeyword || undefined,
              facultyId: selectedFacultyId || undefined,
              departmentId: selectedDepartmentId || undefined,
            })
          } finally {
            setIsBulkDeleting(false)
            setIsBulkDeleteModalOpen(false)
          }
        }}
      />
      <BulkEditCurriculumModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedCurriculumIds={Array.from(selectedCurriculumIds)}
        onSuccess={() => {
          setSelectedCurriculumIds(new Set())
          fetchCurriculums({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            searchKeyword: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            departmentId: selectedDepartmentId || undefined,
          })
        }}
      />
      <AddSubjectToCurriculumModal
        isOpen={Boolean(addingSubjectsCurriculumId)}
        curriculumDetail={
          addingSubjectsCurriculumId ? curriculumDetails[addingSubjectsCurriculumId] ?? null : null
        }
        onClose={() => setAddingSubjectsCurriculumId(null)}
        onSuccess={async () => {
          if (!addingSubjectsCurriculumId) return
          const detailRes = await curriculumsApi.getCurriculumDetail(addingSubjectsCurriculumId)
          if (detailRes.success && detailRes.data) {
            setCurriculumDetails((prev) => ({
              ...prev,
              [addingSubjectsCurriculumId]: detailRes.data,
            }))
          }
          await fetchCurriculums({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            searchKeyword: searchKeyword || undefined,
            facultyId: selectedFacultyId || undefined,
            departmentId: selectedDepartmentId || undefined,
          })
        }}
      />
    </div>
  )
}
