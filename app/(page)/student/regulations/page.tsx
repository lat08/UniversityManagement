"use client"

import { useState, useMemo } from "react"
import { Download, ExternalLink, AlertTriangle, ChevronDown, Loader2, Search, FileText } from "lucide-react"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useRegulations } from "./lib/hooks/useRegulations"
import { Regulation } from "./lib/types/types"

export default function RegulationsPage() {
  usePageTitle('Quy chế / Quy định');
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { regulations, loading, error, refetch } = useRegulations()

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      // Fallback: mở trong tab mới
      window.open(fileUrl, '_blank')
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Filter regulations based on search query
  const filteredRegulations = useMemo(() => {
    if (!searchQuery.trim()) return regulations
    
    const query = searchQuery.toLowerCase()
    return regulations.filter(reg => 
      (reg.title || '').toLowerCase().includes(query) ||
      (reg.description || '').toLowerCase().includes(query) ||
      (reg.category || '').toLowerCase().includes(query)
    )
  }, [regulations, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quy chế - Quy định</h1>
          <p className="text-sm text-gray-600">Tìm hiểu các quy định, quy chế và chính sách của trường</p>
        </header>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Không thể tải dữ liệu</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={refetch}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!regulations.length) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quy chế - Quy định</h1>
          <p className="text-sm text-gray-600">Tìm hiểu các quy định, quy chế và chính sách của trường</p>
        </header>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 lg:p-6 text-center">
          <p className="text-gray-600">Chưa có quy chế nào được công bố.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quy chế - Quy định</h1>
        <p className="text-sm text-gray-600">Tìm hiểu các quy định, quy chế và chính sách của trường</p>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Regulations List */}
      <div className="space-y-4">
        {filteredRegulations.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Không tìm thấy quy chế phù hợp với từ khóa &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          filteredRegulations.map((regulation) => (
            <RegulationCard
              key={regulation.id}
              regulation={regulation}
              isExpanded={expandedId === regulation.id}
              onToggle={() => toggleExpand(regulation.id)}
              onDownload={handleDownload}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface RegulationCardProps {
  regulation: Regulation
  isExpanded: boolean
  onToggle: () => void
  onDownload: (fileUrl: string, fileName: string) => void
}

function RegulationCard({ regulation, isExpanded, onToggle, onDownload }: RegulationCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Card Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-blue-50 transition-colors cursor-pointer"
      >
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900 mb-1">{regulation.title}</h3>
          <p className="text-sm text-gray-500">Lần cuối cập nhật: {new Date(regulation.updatedAt || regulation.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>

        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Card Content - Expandable */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-4">
          {/* Description */}
          <div>
            <p className="font-semibold text-sm text-gray-900 mb-2">Nội dung:</p>
            <p className="text-sm text-gray-700 leading-relaxed">{regulation.description}</p>
          </div>

          {/* Action Buttons */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Xem tài liệu chi tiết:</h4>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onDownload(regulation.fileUrl, regulation.fileName)}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Tải file PDF
              </button>

              <a
                href={regulation.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Xem trực tuyến
              </a>
            </div>

            {regulation.fileName && (
              <p className="mt-2 text-xs text-gray-500">Tên file: {regulation.fileName}</p>
            )}
          </div>

          {/* Notice */}
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-yellow-900 mb-1">Lưu ý</p>
              <p className="text-sm text-yellow-800 leading-relaxed">
                Sinh viên có trách nhiệm đọc kỹ và tuân thủ các quy định trong quy chế này. Mọi thắc mắc xin liên hệ Phòng Đào tạo hoặc Phòng Tổ chức - Hành chính để được hướng dẫn chi tiết.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
