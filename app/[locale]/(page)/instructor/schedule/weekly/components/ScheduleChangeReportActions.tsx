"use client"

import { useState, useEffect } from "react"
import { FileText, FilePlus, ExternalLink } from "lucide-react"
import { useGenerateReport, useCheckReportFile } from "../lib/hooks/useScheduleChange"
import toast from "react-hot-toast"

interface ScheduleChangeReportActionsProps {
  scheduleChangeId: string
  reportFileUrl: string | null
  onReportGenerated?: (url: string) => void
}

export function ScheduleChangeReportActions({
  scheduleChangeId,
  reportFileUrl: initialReportFileUrl,
  onReportGenerated,
}: ScheduleChangeReportActionsProps) {
  const [reportFileUrl, setReportFileUrl] = useState<string | null>(initialReportFileUrl)
  const [isChecking, setIsChecking] = useState(false)
  
  const generateReport = useGenerateReport()
  const { data: checkedFileUrl, refetch } = useCheckReportFile(scheduleChangeId)

  useEffect(() => {
    if (checkedFileUrl !== undefined) {
      setReportFileUrl(checkedFileUrl)
    }
  }, [checkedFileUrl])

  useEffect(() => {
    setReportFileUrl(initialReportFileUrl)
  }, [initialReportFileUrl])

  const handleGenerateReport = async () => {
    try {
      const url = await generateReport.mutateAsync(scheduleChangeId)
      setReportFileUrl(url)
      toast.success('Tạo tường trình thành công')
      onReportGenerated?.(url)
    } catch {
      toast.error('Tạo tường trình thất bại')
    }
  }

  const handleCheckAndView = async () => {
    if (reportFileUrl) {
      window.open(reportFileUrl, '_blank')
      return
    }

    setIsChecking(true)
    try {
      const { data } = await refetch()
      if (data) {
        setReportFileUrl(data)
        window.open(data, '_blank')
        onReportGenerated?.(data)
      } else {
        await handleGenerateReport()
      }
    } catch {
      toast.error('Kiểm tra file thất bại')
    } finally {
      setIsChecking(false)
    }
  }

  if (reportFileUrl) {
    return (
      <button
        onClick={() => window.open(reportFileUrl, '_blank')}
        className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors text-sm font-medium"
        title="Xem tường trình"
      >
        <FileText className="w-4 h-4" />
        <span>Xem</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    )
  }

  return (
    <button
      onClick={handleCheckAndView}
      disabled={generateReport.isPending || isChecking}
      className="flex items-center gap-1.5 px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      title="Tạo tường trình"
    >
      {generateReport.isPending || isChecking ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Đang tạo...</span>
        </>
      ) : (
        <>
          <FilePlus className="w-4 h-4" />
          <span>Tạo</span>
        </>
      )}
    </button>
  )
}
