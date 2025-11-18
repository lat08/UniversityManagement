"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, Edit, Trash2, Search, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card } from "@/app/components/ui/card"
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

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredFaculties.map((f) => f.facultyId))
    } else {
      setSelectedIds([])
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
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm ngành học
        </Button>
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

      {/* Filters and Bulk Actions */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Selection Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Đã chọn {selectedIds.length} ngành học
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkEdit}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa toàn bộ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa toàn bộ
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Bỏ chọn
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã, tên ngành học..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
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
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="w-12 p-4 text-left">
                  <Checkbox
                    checked={
                      selectedIds.length === filteredFaculties.length &&
                      filteredFaculties.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Mã
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Tên ngành học
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Khoa
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="w-12 p-4 text-left text-sm font-semibold text-gray-700">
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
              ) : filteredFaculties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Không tìm thấy ngành học nào
                  </td>
                </tr>
              ) : (
                filteredFaculties.map((faculty) => (
                  <tr key={faculty.facultyId} className="hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedIds.includes(faculty.facultyId)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(faculty.facultyId, checked as boolean)
                        }
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{faculty.facultyCode}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{faculty.facultyName}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {faculty.divisionName || "-"}
                      </span>
                    </td>
                    <td className="p-4">
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
                        {faculty.facultyStatus === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                      </Badge>
                    </td>
                    <td className="p-4">
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

        {/* Pagination info */}
        {!isLoading && filteredFaculties.length > 0 && (
          <div className="border-t p-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị 1-{filteredFaculties.length} trong tổng số{" "}
              {filteredFaculties.length} ngành học
            </p>
          </div>
        )}
      </Card>

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
