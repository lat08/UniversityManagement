'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { Plus, MoreVertical, Upload, Download, Trash2, Edit } from 'lucide-react'
import { Dropdown, SearchInput, Button } from '@/app/components/ui'
import { Pagination } from '@/app/components/ui/pagination'
import { useCurriculums } from './lib/hooks/useCurriculums'
import { curriculumsApi } from './lib/api/curriculumsApi'
import type { CurriculumListItem, DepartmentOption, FacultyOption } from './lib/types/types'
import { ResizableTable, ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable'
import { TableSkeleton } from '@/app/(page)/admin/student-profile/components/LoadingSkeleton'
import { AddCurriculumModal } from './components/AddCurriculumModal'
import { ConfirmDeleteCurriculumModal } from './components/ConfirmDeleteCurriculumModal'
import { ImportCurriculumModal } from './components/ImportCurriculumModal'
import { EditCurriculumModal } from './components/EditCurriculumModal'
import { BulkDeleteCurriculumModal } from './components/BulkDeleteCurriculumModal'
import { toast } from 'react-hot-toast'

const PAGE_SIZE = 10

type CurriculumActionsMenuProps = {
  item: CurriculumListItem
  onExport: (item: CurriculumListItem) => void
  onEdit: (item: CurriculumListItem) => void
  onDelete: (item: CurriculumListItem) => void
}

function CurriculumActionsMenu({ item, onExport, onEdit, onDelete }: CurriculumActionsMenuProps) {
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
              <span>Chỉnh sửa</span>
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
              <span>Xuất Excel</span>
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
              <span>Xóa CTĐT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CurriculumManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [faculties, setFaculties] = useState<FacultyOption[]>([])
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<Set<string>>(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [deletingCurriculum, setDeletingCurriculum] = useState<CurriculumListItem | null>(null)
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumListItem | null>(null)

  const { curriculums, loading, currentPage, totalCount, totalPages, fetchCurriculums, setCurrentPage } =
    useCurriculums()

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'code', label: 'Mã', width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    { key: 'name', label: 'Tên chương trình đào tạo', width: 260, minWidth: 200, align: 'left', visible: true, required: true },
    { key: 'faculty', label: 'Khoa', width: 220, minWidth: 160, align: 'left', visible: true },
    { key: 'credits', label: 'Số tín chỉ', width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'year', label: 'Năm áp dụng', width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'status', label: 'Trạng thái', width: 150, minWidth: 130, align: 'center', visible: true },
    { key: 'actions', label: 'HĐ', width: 80, minWidth: 70, align: 'center', visible: true, required: true },
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
      toast.success('Xuất CTĐT ra Excel thành công')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || 'Xuất CTĐT thất bại')
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
        toast.success(res.message || 'Xóa chương trình đào tạo thành công')
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
        toast.error(res.message || 'Xóa chương trình đào tạo thất bại')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi xóa CTĐT')
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
      { value: '', label: 'Tất cả khoa' },
      ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
    ],
    [faculties],
  )

  const departmentOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả ngành' },
      ...departments.map((d) => ({ value: d.departmentId, label: d.departmentName })),
    ],
    [departments],
  )

  const handleSelectAll = () => {
    if (selectedCurriculumIds.size === curriculums.length) {
      setSelectedCurriculumIds(new Set())
    } else {
      setSelectedCurriculumIds(new Set(curriculums.map((c) => c.curriculumId)))
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
    toast('Tính năng chỉnh sửa toàn bộ CTĐT (trạng thái) sẽ được bổ sung sau khi có API backend.')
  }

  const handleBulkDeleteSelected = () => {
    if (selectedCurriculumIds.size === 0) return
    setIsBulkDeleteModalOpen(true)
  }

  const renderRow = (item: CurriculumListItem, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
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
                  {item.curriculumCode}
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
            case 'status':
              return (
                <td key="status" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <span className="text-xs font-medium rounded px-2 py-1 bg-green-100 text-green-700 whitespace-nowrap">
                      Đang hoạt động
                    </span>
                  </div>
                </td>
              )
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

  const hasSelection = selectedCurriculumIds.size > 0

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Chương trình đào tạo</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin chương trình đào tạo của các khoa ngành</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Danh sách Chương trình Đào tạo</h2>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload className="w-4 h-4" />
                Nhập Excel
              </Button>
              <Button
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Thêm mới
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            <div className="sm:col-span-2">
              <SearchInput
                placeholder="Tìm kiếm theo Mã CTĐT hoặc Tên CTĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dropdown
              options={facultyOptions}
              value={selectedFacultyId || ''}
              placeholder="Tất cả khoa"
              onChange={(value) => {
                setSelectedFacultyId(value)
                setSelectedDepartmentId('')
                setCurrentPage(1)
              }}
            />

            <Dropdown
              options={departmentOptions}
              value={selectedDepartmentId || ''}
              placeholder="Tất cả ngành"
              onChange={(value) => {
                setSelectedDepartmentId(value)
                setCurrentPage(1)
              }}
            />

            <Dropdown
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'active', label: 'Đang hoạt động' },
              ]}
              value={''}
              placeholder="Tất cả trạng thái"
              onChange={() => {
                /* hin ta1n reserved for future status filter */
              }}
            />
          </div>

          {hasSelection && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="text-sm font-medium text-[#0053AD]">
                Đã chọn {selectedCurriculumIds.size} chương trình đào tạo
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                  onClick={handleBulkEditSelected}
                >
                  Chỉnh sửa toàn bộ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={handleBulkDeleteSelected}
                >
                  Xóa toàn bộ
                </Button>
                <Button
                  size="sm"
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setSelectedCurriculumIds(new Set())}
                >
                  Bỏ chọn
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            <ResizableTable
              columns={resizableColumns}
              data={curriculums}
              renderRow={(item, visibleColumns, cellStyle) => (
                <tr className="hover:bg-gray-50 transition-colors">
                  {renderRow(item as CurriculumListItem, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage="Không có dữ liệu"
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={curriculums.length > 0 && selectedCurriculumIds.size === curriculums.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedCurriculumIds.size > 0 && selectedCurriculumIds.size < curriculums.length
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

            for (const id of ids) {
              try {
                const res = await curriculumsApi.deleteCurriculum(id)
                if (!res.success) {
                  toast.error(res.message || 'Xóa CTĐT thất bại')
                }
              } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } }; message?: string }
                toast.error(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi xóa CTĐT')
              }
            }

            toast.success('Đã xóa các chương trình đào tạo được chọn (nếu không có lỗi).')
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
    </div>
  )
}
