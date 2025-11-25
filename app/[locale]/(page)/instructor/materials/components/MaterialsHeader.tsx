"use client"

import { useTranslations } from "next-intl"
import { Upload } from "lucide-react"
import { Button } from "@/app/components/ui/button"

interface MaterialsHeaderProps {
  onUploadClick?: () => void
  onUploadHover?: () => void
}

export function MaterialsHeader({ onUploadClick, onUploadHover }: MaterialsHeaderProps) {
  const t = useTranslations('instructor.materials')
  
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          {t('title')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {t('description')}
        </p>
      </div>
      <Button 
        onClick={onUploadClick}
        onMouseEnter={onUploadHover}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base whitespace-nowrap"
      >
        <Upload className="w-4 h-4 flex-shrink-0" />
        <span>{t('uploadDocument')}</span>
      </Button>
    </header>
  )
}

