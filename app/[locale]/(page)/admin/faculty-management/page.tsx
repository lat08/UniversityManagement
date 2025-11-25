"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, Edit, Trash2, X, CheckCircle2 } from "lucide-react"
import { Button, SearchInput } from "@/app/components/ui"
import { Pagination } from "@/app/components/ui/pagination"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Badge } from "@/app/components/ui/badge"
import { useFaculties } from "./lib/hooks/useFaculties"
import { Faculty, CreateFacultyDto, UpdateFacultyDto } from "./lib/types/types"
import {
  AddFacultyModal,
  EditFacultyModal,
  ConfirmDeleteFacultyModal,
  BulkEditFacultyModal,
  BulkDeleteFacultyModal,
  FacultyActionsMenu,
  FacultyStatCard,
} from "./components"
import { GraduationCap, Activity, PauseCircle } from "lucide-react"

export default function FacultyManagementPage() {
  const {
    faculties,
    stats,
    divisions,
    deans,
    isLoading,
    handleSearch,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    bulkDeleteFaculties,
    bulkEditFaculties,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkDeleting,
    isBulkEditing,
  } = useFaculties()

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  // Selected faculty for edit/delete
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filters
  const [localSearchQuery, setLocalSearchQuery] = useState("")
  const [divisionFilter, setDivisionFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(localSearchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [localSearchQuery, handleSearch])

  // Filtered faculties (client-side filtering for division and status)
  const filteredFaculties = useMemo(() => {
    return faculties.filter((faculty) => {
      const matchesDivision =
        divisionFilter === "all" || faculty.divisionId === divisionFilter
      const matchesStatus =
        statusFilter === "all" || faculty.facultyStatus === statusFilter

      return matchesDivision && matchesStatus
    })
  }, [faculties, divisionFilter, statusFilter])

  // Reset về trang 1 khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [divisionFilter, statusFilter, localSearchQuery])

  const totalCount = filteredFaculties.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const paginatedFaculties = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredFaculties.slice(start, end)
  }, [filteredFaculties, currentPage])

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds([
        ...new Set([
          ...selectedIds,
          ...paginatedFaculties.map((f) => f.facultyId),
        ]),
      ])
    } else {
      // Bỏ chọn chỉ các item trong trang hiện tại
      setSelectedIds(
        selectedIds.filter(
          (id) => !paginatedFaculties.some((f) => f.facultyId === id),
        ),
      )
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  const handleEdit = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setIsEditModalOpen(true)
  }

  const handleDelete = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setIsDeleteModalOpen(true)
  }

  const handleBulkEdit = () => {
    setIsBulkEditModalOpen(true)
  }

  const handleBulkDelete = () => {
    setIsBulkDeleteModalOpen(true)
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Ngành học</h1>
          <p className="text-muted-foreground">Quản lý thông tin các ngành học</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <FacultyStatCard
          title="Tổng số ngành học"
          value={stats?.total || 0}
          icon={GraduationCap}
          color="blue"
        />
        <FacultyStatCard
          title="Đang hoạt động"
          value={stats?.active || 0}
          icon={Activity}
          color="green"
        />
        <FacultyStatCard
          title="Ngừng hoạt động"
          value={stats?.inactive || 0}
          icon={PauseCircle}
          color="orange"
        />
      </div>

      {/* Main Content: Filters, actions, table, pagination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          {/* Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Danh sách Ngành học
              </h2>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                <Plus className="w-4 h-4" />
                Thêm ngành học
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            <div className="sm:col-span-2">
              <SearchInput
                placeholder="Tìm kiếm theo mã, tên ngành học..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={divisionFilter}
                onValueChange={setDivisionFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khoa</SelectItem>
                  {divisions.map((div) => (
                    <SelectItem key={div.divisionId} value={div.divisionId}>
                      {div.divisionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  Đã chọn {selectedIds.length} ngành học
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkEdit}
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa toàn bộ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa toàn bộ
                </Button>
                <Button
                  size="sm"
                  onClick={handleClearSelection}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Bỏ chọn
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0053AD] text-white">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <Checkbox
                    checked={
                      paginatedFaculties.length > 0 &&
                      paginatedFaculties.every((f) =>
                        selectedIds.includes(f.facultyId),
                      )
                    }
                    onCheckedChange={(value) =>
                      handleSelectAll(Boolean(value))
                    }
                  />
                </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-l border-white/40">
                    Mã
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-l border-white/40">
                    Tên ngành học
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-l border-white/40">
                    Khoa
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold border-l border-white/40">
                    Trạng thái
                  </th>
                  <th className="w-12 px-4 py-3 text-center text-sm font-semibold border-l border-white/40">
                    HĐ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    </td>
                  </tr>
                ) : paginatedFaculties.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Không tìm thấy ngành học nào
                    </td>
                  </tr>
                ) : (
                  paginatedFaculties.map((faculty) => (
                    <tr key={faculty.facultyId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.includes(faculty.facultyId)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(
                              faculty.facultyId,
                              checked as boolean,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">
                          {faculty.facultyCode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">
                          {faculty.facultyName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {faculty.divisionName || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            faculty.facultyStatus === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            faculty.facultyStatus === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {faculty.facultyStatus === "active"
                            ? "Đang hoạt động"
                            : "Ngừng hoạt động"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <FacultyActionsMenu
                          faculty={faculty}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!isLoading && totalCount > 0 && (
          <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AddFacultyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data: CreateFacultyDto) => createFaculty(data)}
        isLoading={isCreating}
        divisions={divisions}
        deans={deans}
      />

      <EditFacultyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedFaculty(null)
        }}
        onSubmit={(id: string, data: UpdateFacultyDto) => updateFaculty({ id, data })}
        faculty={selectedFaculty}
        isLoading={isUpdating}
        divisions={divisions}
        deans={deans}
      />

      <ConfirmDeleteFacultyModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedFaculty(null)
        }}
        onConfirm={() => {
          if (selectedFaculty) {
            deleteFaculty(selectedFaculty.facultyId)
            setIsDeleteModalOpen(false)
            setSelectedFaculty(null)
          }
        }}
        faculty={selectedFaculty}
        isLoading={isDeleting}
      />

      <BulkEditFacultyModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        onSubmit={(updates) => {
          bulkEditFaculties({ ids: selectedIds, updates })
          setSelectedIds([])
        }}
        selectedCount={selectedIds.length}
        isLoading={isBulkEditing}
        divisions={divisions}
        deans={deans}
      />

      <BulkDeleteFacultyModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={() => {
          bulkDeleteFaculties(selectedIds)
          setSelectedIds([])
          setIsBulkDeleteModalOpen(false)
        }}
        selectedCount={selectedIds.length}
        isLoading={isBulkDeleting}
      />
    </div>
  )
}
