"use client"

import { useState, useMemo } from "react"
import { Loader2, Search, AlertTriangle } from "lucide-react"
import { useRegulations } from "./lib/hooks/useRegulations"
import { RegulationCard } from "./RegulationCard"

interface RegulationsPageProps {
  readonly pageTitle: string
  readonly description: string
  readonly noticeText?: string
}

export function RegulationsPage({ pageTitle, description, noticeText }: RegulationsPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { regulations, loading, error, refetch } = useRegulations()

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-600">{description}</p>
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-600">{description}</p>
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
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-sm text-gray-600">{description}</p>
      </header>

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
              noticeText={noticeText}
            />
          ))
        )}
      </div>
    </div>
  )
}

