import { FormData, FormErrors } from '../types/types'

export const validateField = (field: keyof FormData, value: string): boolean => {
  switch (field) {
    case "fullName":
      // Should contain only letters, spaces, and Vietnamese characters
      return value.trim().length >= 2 && /^[a-zA-ZÀ-ỹ\s]+$/.test(value)

    case "studentId":
      // Should be alphanumeric and at least 5 characters
      return value.trim().length >= 5 && /^[a-zA-Z0-9]+$/.test(value)

    case "gender":
      return value === "Nam" || value === "Nữ"

    case "dateOfBirth":
      if (!value) return false
      const date = new Date(value)
      const today = new Date()
      const minDate = new Date(today.getFullYear() - 100, 0, 1) // 100 years ago
      const maxDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate()) // At least 15 years old
      return date >= minDate && date <= maxDate

    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

    case "major":
      // Should contain meaningful text, not just random characters
      return value.trim().length >= 3 && /^[a-zA-ZÀ-ỹ\s]+$/.test(value)

    case "idNumber":
      // CMND is 9 digits, CCCD is 12 digits
      return /^\d{9}$/.test(value) || /^\d{12}$/.test(value)

    case "specialization":
      return value.trim().length >= 3 && /^[a-zA-ZÀ-ỹ\s]+$/.test(value)

    case "residence":
      return value.trim().length >= 5

    case "academicYear":
      // Should match format like "2023-2027"
      return /^\d{4}-\d{4}$/.test(value)

    case "class":
      return value.trim().length >= 2

    default:
      return true
  }
}

export const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {}

  Object.keys(formData).forEach((key) => {
    const field = key as keyof FormData
    if (!validateField(field, formData[field])) {
      errors[field] = true
    }
  })

  return errors
}
