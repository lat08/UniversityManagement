"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { CreateFacultyDto, Division, Dean } from "../lib/types/types"

interface AddFacultyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateFacultyDto) => void
  isLoading?: boolean
  divisions: Division[]
  deans: Dean[]
}

export function AddFacultyModal({ isOpen, onClose, onSubmit, isLoading, divisions, deans }: AddFacultyModalProps) {
  const [formData, setFormData] = useState<CreateFacultyDto>({
    facultyCode: "",
    facultyName: "",
    divisionId: "",
    deanId: "",
    facultyStatus: "active",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.facultyCode.trim()) {
      newErrors.facultyCode = "Vui lòng nhập mã ngành học"
    }
    
    if (!formData.facultyName.trim()) {
      newErrors.facultyName = "Vui lòng nhập tên ngành học"
    }

    if (!formData.divisionId) {
      newErrors.divisionId = "Vui lòng chọn khoa"
    }

    if (!formData.deanId) {
      newErrors.deanId = "Vui lòng chọn trưởng khoa"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      facultyCode: "",
      facultyName: "",
      divisionId: "",
      deanId: "",
      facultyStatus: "active",
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Thêm ngành học mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo ngành học mới
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">
                Mã ngành học <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="Ví dụ: KHMT"
                value={formData.facultyCode}
                onChange={(e) => {
                  setFormData({ ...formData, facultyCode: e.target.value })
                  setErrors({ ...errors, facultyCode: "" })
                }}
                className={errors.facultyCode ? "border-red-500" : ""}
              />
              {errors.facultyCode && (
                <p className="text-sm text-red-500">{errors.facultyCode}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên ngành học <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ví dụ: Khoa học máy tính"
                value={formData.facultyName}
                onChange={(e) => {
                  setFormData({ ...formData, facultyName: e.target.value })
                  setErrors({ ...errors, facultyName: "" })
                }}
                className={errors.facultyName ? "border-red-500" : ""}
              />
              {errors.facultyName && (
                <p className="text-sm text-red-500">{errors.facultyName}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="division">
                Khoa <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.divisionId}
                onValueChange={(value) => {
                  setFormData({ ...formData, divisionId: value })
                  setErrors({ ...errors, divisionId: "" })
                }}
              >
                <SelectTrigger id="division" className={errors.divisionId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn khoa" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem key={division.divisionId} value={division.divisionId}>
                      {division.divisionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.divisionId && (
                <p className="text-sm text-red-500">{errors.divisionId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dean">
                Trưởng khoa <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.deanId}
                onValueChange={(value) => {
                  setFormData({ ...formData, deanId: value })
                  setErrors({ ...errors, deanId: "" })
                }}
              >
                <SelectTrigger id="dean" className={errors.deanId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn trưởng khoa" />
                </SelectTrigger>
                <SelectContent>
                  {deans.map((dean) => (
                    <SelectItem key={dean.instructorId} value={dean.instructorId}>
                      {dean.fullName} ({dean.instructorCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deanId && (
                <p className="text-sm text-red-500">{errors.deanId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.facultyStatus}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, facultyStatus: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
