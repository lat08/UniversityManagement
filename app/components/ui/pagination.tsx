'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

interface PaginationProps {
  readonly currentPage: number
  readonly totalPages: number
  readonly totalCount: number
  readonly pageSize: number
  readonly onPageChange: (page: number) => void
  readonly className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  className = ''
}: PaginationProps) {
  const t = useTranslations('common.table.pagination')
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount)

  const pageNumbers = useMemo(() => {
    const pages: Array<{ type: 'page' | 'ellipsis'; value: number | string }> = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push({ type: 'page', value: i })
      }
    } else if (currentPage <= 3) {
      pages.push(
        { type: 'page', value: 1 },
        { type: 'page', value: 2 },
        { type: 'page', value: 3 },
        { type: 'page', value: 4 },
        { type: 'ellipsis', value: 'end' },
        { type: 'page', value: totalPages }
      )
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        { type: 'page', value: 1 },
        { type: 'ellipsis', value: 'start' },
        { type: 'page', value: totalPages - 3 },
        { type: 'page', value: totalPages - 2 },
        { type: 'page', value: totalPages - 1 },
        { type: 'page', value: totalPages }
      )
    } else {
      pages.push(
        { type: 'page', value: 1 },
        { type: 'ellipsis', value: 'start' },
        { type: 'page', value: currentPage - 1 },
        { type: 'page', value: currentPage },
        { type: 'page', value: currentPage + 1 },
        { type: 'ellipsis', value: 'end' },
        { type: 'page', value: totalPages }
      )
    }
    
    return pages
  }, [currentPage, totalPages])

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-gray-600">
        {t('summary', { start: startItem, end: endItem, total: totalCount })}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {t('previous')}
        </button>
        {pageNumbers.map((item) => 
          item.type === 'page' ? (
            <button
              key={`page-${item.value}`}
              onClick={() => onPageChange(item.value as number)}
              className={`px-3 py-1 text-sm rounded cursor-pointer ${
                currentPage === item.value
                  ? 'bg-[#0053AD] text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {item.value}
            </button>
          ) : (
            <span key={`ellipsis-${item.value}`} className="px-3 py-1 text-sm text-gray-400">
              ...
            </span>
          )
        )}
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {t('next')}
        </button>
      </div>
    </div>
  )
}
