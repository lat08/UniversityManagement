'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { Plus, MoreVertical, Download, Edit, Trash2 } from 'lucide-react'
import { Dropdown, SearchInput, Button } from '@/app/components/ui'
import { Pagination } from '@/app/components/ui/pagination'
import { useDivisions } from './lib/hooks/useDivisions'
import { divisionsApi } from './lib/api/divisionsApi'
import type { DivisionListItem } from './lib/types/types'
import { ResizableTable, ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable'
import { TableSkeleton } from '@/app/(page)/admin/student-profile/components/LoadingSkeleton'
import { AddDivisionModal } from './components/AddDivisionModal'
import { EditDivisionModal } from './components/EditDivisionModal'
import { BulkDeleteDivisionModal } from './components/BulkDeleteDivisionModal'
import { BulkStatusUpdateModal } from './components/BulkStatusUpdateModal'
import { toast } from 'react-hot-toast'

const PAGE_SIZE = 10

type DivisionActionsMenuProps = {
  item: DivisionListItem
  onEdit: (item: DivisionListItem) => void
  onDelete: (item: DivisionListItem) => void
}

function DivisionActionsMenu({ item, onEdit, onDelete }: DivisionActionsMenuProps) {
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
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                onDelete(item)
                setOpen(false)
              }}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Xóa khoa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DivisionManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'' | 'active' | 'inactive'>('')
  const [selectedDivisionIds, setSelectedDivisionIds] = useState<Set<string>>(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [editingDivision, setEditingDivision] = useState<DivisionListItem | null>(null)

  const { divisions, loading, currentPage, totalCount, totalPages, fetchDivisions, setCurrentPage } = useDivisions()

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'code', label: 'Mã khoa', width: 120, minWidth: 100, align: 'left', visible: true, required: true },
    { key: 'name', label: 'Tên khoa', width: 260, minWidth: 200, align: 'left', visible: true, required: true },
    { key: 'dean', label: 'Trưởng khoa', width: 200, minWidth: 160, align: 'left', visible: true },
    { key: 'facultyCount', label: 'Số bộ môn', width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'subjectCount', label: 'Số môn học', width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'instructorCount', label: 'Số GV', width: 100, minWidth: 80, align: 'center', visible: true },
    { key: 'status', label: 'Trạng thái', width: 150, minWidth: 130, align: 'center', visible: true },
    { key: 'actions', label: 'HĐ', width: 80, minWidth: 70, align: 'center', visible: true, required: true },
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, setCurrentPage])

  useEffect(() => {
    fetchDivisions({
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
      searchTerm: searchKeyword || undefined,
      status: selectedStatus || undefined,
    })
  }, [currentPage, searchKeyword, selectedStatus, fetchDivisions])

  const handleEdit = (item: DivisionListItem) => {
    setEditingDivision(item)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (item: DivisionListItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khoa "${item.divisionName}"?`)) return

    try {
      const res = await divisionsApi.bulkDelete({ divisionIds: [item.divisionId] })
      if (res.isSuccess) {
        toast.success(res.message || 'Xóa khoa thành công')
        setSelectedDivisionIds((prev) => {
          const next = new Set(prev)
          next.delete(item.divisionId)
          return next
        })
        await fetchDivisions({
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
          searchTerm: searchKeyword || undefined,
          status: selectedStatus || undefined,
        })
      } else {
        toast.error(res.message || 'Xóa khoa thất bại')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi xóa khoa')
    }
  }

  const handleSelectAll = () => {
    if (selectedDivisionIds.size === divisions.length) {
      setSelectedDivisionIds(new Set())
    } else {
      setSelectedDivisionIds(new Set(divisions.map((d) => d.divisionId)))
    }
  }

  const handleSelectOne = (divisionId: string) => {
    setSelectedDivisionIds((prev) => {
      const next = new Set(prev)
      if (next.has(divisionId)) {
        next.delete(divisionId)
      } else {
        next.add(divisionId)
      }
      return next
    })
  }

  const handleBulkStatusUpdate = () => {
    if (selectedDivisionIds.size === 0) return
    setIsBulkStatusModalOpen(true)
  }

  const handleBulkDelete = () => {
    if (selectedDivisionIds.size === 0) return
    setIsBulkDeleteModalOpen(true)
  }

  const handleExport = async () => {
    try {
      const blob = await divisionsApi.exportDivisions({
        searchTerm: searchKeyword || undefined,
        status: selectedStatus || undefined,
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DanhSachKhoa_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Xuất danh sách khoa ra Excel thành công')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err.response?.data?.message || err.message || 'Xuất Excel thất bại')
    }
  }

  const renderRow = (
    item: DivisionListItem,
    visibleColumns: ResizableColumn[],
    cellStyle: { paddingX: string; paddingY: string },
  ) => {
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0)
    const isSelected = selectedDivisionIds.has(item.divisionId)

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
                      onChange={() => handleSelectOne(item.divisionId)}
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
                  {item.divisionCode}
                </td>
              )
            case 'name':
              return (
                <td
                  key="name"
                  className="text-gray-900"
                  style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {item.divisionName}
                </td>
              )
            case 'dean':
              return (
                <td
                  key="dean"
                  className="text-gray-600"
                  style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {item.deanName || '-'}
                </td>
              )
            case 'facultyCount':
              return (
                <td key="facultyCount" className="text-center text-gray-900" style={cellPaddingStyle}>
                  {item.facultyCount}
                </td>
              )
            case 'subjectCount':
              return (
                <td key="subjectCount" className="text-center text-gray-900" style={cellPaddingStyle}>
                  {item.subjectCount}
                </td>
              )
            case 'instructorCount':
              return (
                <td key="instructorCount" className="text-center text-gray-900" style={cellPaddingStyle}>
                  {item.instructorCount}
                </td>
              )
            case 'status':
              return (
                <td key="status" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <span
                      className={`text-xs font-medium rounded px-2 py-1 whitespace-nowrap ${
                        item.divisionStatus === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.divisionStatus === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  </div>
                </td>
              )
            case 'actions':
              return (
                <td key="actions" style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}>
                  <div className="flex justify-center">
                    <DivisionActionsMenu item={item} onEdit={handleEdit} onDelete={handleDelete} />
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

  const hasSelection = selectedDivisionIds.size > 0

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả trạng thái' },
      { value: 'active', label: 'Đang hoạt động' },
      { value: 'inactive', label: 'Ngừng hoạt động' },
    ],
    [],
  )

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Khoa</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin các khoa trong trường</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Danh sách Khoa</h2>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Xuất Excel
              </Button>
              <Button className="bg-[#0053AD] hover:bg-[#003d82] text-white" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Thêm mới
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            <div className="sm:col-span-2">
              <SearchInput
                placeholder="Tìm kiếm theo Mã khoa hoặc Tên khoa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dropdown
              options={statusOptions}
              value={selectedStatus}
              placeholder="Tất cả trạng thái"
              onChange={(value) => {
                setSelectedStatus(value as '' | 'active' | 'inactive')
                setCurrentPage(1)
              }}
            />
          </div>

          {hasSelection && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="text-sm font-medium text-[#0053AD]">Đã chọn {selectedDivisionIds.size} khoa</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                  onClick={handleBulkStatusUpdate}
                >
                  Cập nhật trạng thái
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={handleBulkDelete}
                >
                  Xóa toàn bộ
                </Button>
                <Button
                  size="sm"
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setSelectedDivisionIds(new Set())}
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
              data={divisions}
              renderRow={(item, visibleColumns, cellStyle) => (
                <tr className="hover:bg-gray-50 transition-colors">
                  {renderRow(item as DivisionListItem, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage="Không có dữ liệu"
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={divisions.length > 0 && selectedDivisionIds.size === divisions.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedDivisionIds.size > 0 && selectedDivisionIds.size < divisions.length
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

      <AddDivisionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchDivisions({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
          })
        }}
      />

      <EditDivisionModal
        isOpen={isEditModalOpen}
        division={editingDivision}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingDivision(null)
        }}
        onSuccess={() => {
          fetchDivisions({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            searchTerm: searchKeyword || undefined,
            status: selectedStatus || undefined,
          })
        }}
      />

      <BulkDeleteDivisionModal
        isOpen={isBulkDeleteModalOpen}
        selectedCount={selectedDivisionIds.size}
        isLoading={isBulkDeleting}
        onClose={() => {
          if (isBulkDeleting) return
          setIsBulkDeleteModalOpen(false)
        }}
        onConfirm={async () => {
          if (selectedDivisionIds.size === 0) {
            setIsBulkDeleteModalOpen(false)
            return
          }

          try {
            setIsBulkDeleting(true)
            const ids = Array.from(selectedDivisionIds)
            const res = await divisionsApi.bulkDelete({ divisionIds: ids })

            if (res.isSuccess) {
              toast.success(res.message || `Đã xóa ${res.data.deletedCount} khoa thành công`)
              setSelectedDivisionIds(new Set())
              await fetchDivisions({
                pageNumber: currentPage,
                pageSize: PAGE_SIZE,
                searchTerm: searchKeyword || undefined,
                status: selectedStatus || undefined,
              })
            } else {
              toast.error(res.message || 'Xóa khoa thất bại')
            }
          } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            toast.error(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi xóa khoa')
          } finally {
            setIsBulkDeleting(false)
            setIsBulkDeleteModalOpen(false)
          }
        }}
      />

      <BulkStatusUpdateModal
        isOpen={isBulkStatusModalOpen}
        selectedCount={selectedDivisionIds.size}
        isLoading={isBulkUpdating}
        onClose={() => {
          if (isBulkUpdating) return
          setIsBulkStatusModalOpen(false)
        }}
        onConfirm={async (status: 'active' | 'inactive') => {
          if (selectedDivisionIds.size === 0) {
            setIsBulkStatusModalOpen(false)
            return
          }

          try {
            setIsBulkUpdating(true)
            const ids = Array.from(selectedDivisionIds)
            const res = await divisionsApi.bulkUpdateStatus({ divisionIds: ids, status })

            if (res.isSuccess) {
              toast.success(res.message || `Đã cập nhật trạng thái ${res.data.updatedCount} khoa thành công`)
              setSelectedDivisionIds(new Set())
              await fetchDivisions({
                pageNumber: currentPage,
                pageSize: PAGE_SIZE,
                searchTerm: searchKeyword || undefined,
                status: selectedStatus || undefined,
              })
            } else {
              toast.error(res.message || 'Cập nhật trạng thái thất bại')
            }
          } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            toast.error(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi cập nhật trạng thái')
          } finally {
            setIsBulkUpdating(false)
            setIsBulkStatusModalOpen(false)
          }
        }}
      />
    </div>
  )
}
