"use client"

import { Download, ExternalLink, AlertTriangle, ChevronDown, FileText } from "lucide-react"
import { downloadFile } from "@/lib/utils/fileDownload"
import { Regulation } from "./lib/api/regulationsApi"

interface RegulationCardProps {
  readonly regulation: Regulation
  readonly isExpanded: boolean
  readonly onToggle: () => void
  readonly noticeText?: string
  readonly animationDelay?: number
}

export function RegulationCard({ regulation, isExpanded, onToggle, noticeText, animationDelay = 0 }: RegulationCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-up transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-md cursor-pointer"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both'
      }}
    >
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

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-4">
          <div>
            <p className="font-semibold text-sm text-gray-900 mb-2">Nội dung:</p>
            <p className="text-sm text-gray-700 leading-relaxed">{regulation.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Xem tài liệu chi tiết:</h4>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => downloadFile(regulation.fileUrl, regulation.fileName)}
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

          {noticeText && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-yellow-900 mb-1">Lưu ý</p>
                <p className="text-sm text-yellow-800 leading-relaxed">{noticeText}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

