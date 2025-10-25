"use client"

import { useState } from "react"
import { Download, ExternalLink, AlertTriangle, ChevronRight, Loader2 } from "lucide-react"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useRegulations } from "./lib/hooks/useRegulations"
import { CONTACT_INFO } from "./lib/constants/contactInfo"

export default function RegulationsPage() {
  usePageTitle('Quy chế / Quy định');
  const [selectedIdx, setSelectedIdx] = useState(0)
  const { regulations, loading, error, refetch } = useRegulations()
  
  const selected = regulations[selectedIdx]

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
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: mở trong tab mới
      window.open(fileUrl, '_blank')
    }
  }

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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quy chế Quy định</h1>
          <p className="text-xs lg:text-sm text-gray-600">Tìm hiểu các quy định, quy chế và chính sách của trường</p>
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quy chế Quy định</h1>
          <p className="text-xs lg:text-sm text-gray-600">Tìm hiểu các quy định, quy chế và chính sách của trường</p>
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
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quy chế Quy định</h1>
        <p className="text-xs lg:text-sm text-gray-600">Tìm hiểu các quy định, quy chế và chính sách của trường</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Section - DANH SÁCH */}
        <aside className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-white rounded-xl border shadow overflow-hidden h-full">
            <div className="border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-900 uppercase tracking-wide">DANH SÁCH</h3>
            </div>

            <nav className="p-3 lg:p-4 space-y-2">
              {regulations.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedIdx(i)}
                  className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors duration-75 text-xs lg:text-sm cursor-pointer select-none
                    ${
                      i === selectedIdx
                        ? "bg-[#EBF5FF] border border-[#B3D9FF] text-gray-900 font-medium"
                        : "text-gray-700 hover:bg-gray-100 border border-transparent"
                    }
                  `}
                >
                  {r.title}
                </button>
              ))}
            </nav>

            <div className="border-t border-gray-200 px-4 lg:px-6 py-3 lg:py-4 bg-gray-50">
              <p className="text-xs text-gray-600 leading-relaxed">
                Chọn một mục để xem nội dung chi tiết. Tài liệu có thể được tải xuống hoặc xem trực tuyến.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Section - NỘI DUNG QUY CHẾ */}
        <article className="flex-1 space-y-4 lg:space-y-6">
          <div className="bg-white rounded-xl border shadow overflow-hidden">
            <div className="border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
              <h2 className="text-xs lg:text-sm font-semibold text-gray-900 uppercase tracking-wide">NỘI DUNG</h2>
            </div>

            <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
              <div>
                <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">{selected?.description}</p>
              </div>

              <div>
                <h4 className="text-xs lg:text-sm font-semibold text-gray-900 mb-3 lg:mb-4">Tải xuống tài liệu đầy đủ:</h4>

                <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                   <button
                     onClick={() => selected && handleDownload(selected.fileUrl, selected.fileName)}
                     className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                     disabled={!selected?.fileUrl}
                   >
                    <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                    Tải file PDF
                  </button>

                  <a
                    href={selected?.fileUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 lg:w-5 lg:h-5" />
                    Xem trực tuyến
                  </a>
                </div>

                {selected?.fileName && (
                  <p className="mt-2 lg:mt-3 text-xs text-gray-500">{`Tên file: ${selected.fileName}`}</p>
                )}
              </div>

              <div className="p-3 lg:p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-2 lg:gap-3">
                <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-xs lg:text-sm text-yellow-900 mb-1">Lưu ý quan trọng</p>
                  <p className="text-xs lg:text-sm text-yellow-800 leading-relaxed">
                    Sinh viên có trách nhiệm đọc kỹ và tuân thủ các quy định trong quy chế này. Mọi thắc mắc xin liên
                    hệ Phòng Đào tạo hoặc Phòng Công tác sinh viên để được hướng dẫn chi tiết.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow overflow-hidden">
            <div className="border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-900 uppercase tracking-wide">THÔNG TIN LIÊN HỆ</h3>
            </div>

            <div className="p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                <div>
                  <p className="font-semibold text-xs lg:text-sm text-gray-900 mb-2 lg:mb-3">{CONTACT_INFO.academicAffairs.name}</p>
                  <p className="text-xs lg:text-sm text-gray-600 mb-1">Email: {CONTACT_INFO.academicAffairs.email}</p>
                  <p className="text-xs lg:text-sm text-gray-600">ĐT: {CONTACT_INFO.academicAffairs.phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-xs lg:text-sm text-gray-900 mb-2 lg:mb-3">{CONTACT_INFO.studentAffairs.name}</p>
                  <p className="text-xs lg:text-sm text-gray-600 mb-1">Email: {CONTACT_INFO.studentAffairs.email}</p>
                  <p className="text-xs lg:text-sm text-gray-600">ĐT: {CONTACT_INFO.studentAffairs.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
