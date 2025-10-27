/**
 * Format date from ISO string to DD/MM/YYYY
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return ""
  
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Format gender to Vietnamese
 */
export function formatGender(gender: string): string {
  switch (gender?.toLowerCase()) {
    case "male":
      return "Nam"
    case "female":
      return "Nữ"
    case "other":
      return "Khác"
    default:
      return ""
  }
}

/**
 * Format enrollment status to Vietnamese
 */
export function formatEnrollmentStatus(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "Đang học"
    case "suspended":
      return "Tạm ngưng"
    case "graduated":
      return "Đã tốt nghiệp"
    case "withdrawn":
      return "Thôi học"
    default:
      return status || ""
  }
}

