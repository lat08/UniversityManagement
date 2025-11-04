export const isNoDataError = (message?: string): boolean => {
  if (!message) return false
  return (
    message.includes("Không tìm thấy thời khóa biểu") ||
    message.includes("không có dữ liệu") ||
    message.includes("không có thời khóa biểu")
  )
}

export const handleScheduleError = (error: unknown, setScheduleData: (data: []) => void, setError: (error: string | null) => void) => {
  const err = error as { response?: { data?: { success?: boolean; message?: string } } }
  
  if (err?.response?.data?.success === false) {
    const response = err.response.data
    setScheduleData([])
    
    if (isNoDataError(response.message)) {
      setError(null)
    } else {
      setError(response.message || "Không có dữ liệu thời khóa biểu")
    }
  } else {
    setScheduleData([])
  }
}

