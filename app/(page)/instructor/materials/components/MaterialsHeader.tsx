"use client"

import { Upload } from "lucide-react"
import { Button } from "@/app/components/ui/button"

interface MaterialsHeaderProps {
  onUploadClick?: () => void
  onUploadHover?: () => void
}

export function MaterialsHeader({ onUploadClick, onUploadHover }: MaterialsHeaderProps) {
  return (
    <header className="flex items-start justify-between mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Bài giảng & Giáo trình
        </h1>
        <p className="text-sm text-gray-600">
          Quản lý tài liệu giảng dạy của bạn
        </p>
      </div>
      <Button 
        onClick={onUploadClick}
        onMouseEnter={onUploadHover}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        <span>Tải lên tài liệu</span>
      </Button>
    </header>
  )
}

