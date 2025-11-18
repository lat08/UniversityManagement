"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Division, Dean } from "../lib/types/types"

interface BulkEditFacultyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (updates: { divisionId?: string; deanId?: string; facultyStatus?: "active" | "inactive" }) => void
  selectedCount: number
  isLoading?: boolean
  divisions: Division[]
  deans: Dean[]
}

export function BulkEditFacultyModal({
  isOpen,
  onClose,
  onSubmit,
  selectedCount,
  isLoading,
  divisions,
  deans,
}: BulkEditFacultyModalProps) {
  const [divisionId, setDivisionId] = useState<string>("")
  const [deanId, setDeanId] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  const handleSubmit = () => {
    const updates: { divisionId?: string; deanId?: string; facultyStatus?: "active" | "inactive" } = {}
    
    if (divisionId) updates.divisionId = divisionId
    if (deanId) updates.deanId = deanId
    if (status) updates.facultyStatus = status as "active" | "inactive"

    if (Object.keys(updates).length === 0) {
      return
    }

    onSubmit(updates)
    handleClose()
  }

  const handleClose = () => {
    setDivisionId("")
    setDeanId("")
    setStatus("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa ngành học</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho <strong>{selectedCount}</strong> ngành học đã chọn
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bulk-division">Khoa</Label>
            <Select value={divisionId} onValueChange={setDivisionId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khoa (không thay đổi nếu bỏ trống)" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.divisionId} value={division.divisionId}>
                    {division.divisionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bulk-dean">Trưởng khoa</Label>
            <Select value={deanId} onValueChange={setDeanId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trưởng khoa (không thay đổi nếu bỏ trống)" />
              </SelectTrigger>
              <SelectContent>
                {deans.map((dean) => (
                  <SelectItem key={dean.instructorId} value={dean.instructorId}>
                    {dean.fullName} ({dean.instructorCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bulk-status">Trạng thái</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái (không thay đổi nếu bỏ trống)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || (!divisionId && !deanId && !status)}
          >
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
