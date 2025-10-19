export const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" }
] as const

export const MAJOR_OPTIONS = [
  { value: "Công nghệ thông tin", label: "Công nghệ thông tin" },
  { value: "Kinh tế", label: "Kinh tế" },
  { value: "Ngôn ngữ Anh", label: "Ngôn ngữ Anh" },
  { value: "Quản trị kinh doanh", label: "Quản trị kinh doanh" },
  { value: "Tài chính ngân hàng", label: "Tài chính ngân hàng" }
] as const

export const ACADEMIC_YEAR_OPTIONS = [
  { value: "2020-2024", label: "2020-2024" },
  { value: "2021-2025", label: "2021-2025" },
  { value: "2022-2026", label: "2022-2026" },
  { value: "2023-2027", label: "2023-2027" },
  { value: "2024-2028", label: "2024-2028" }
] as const

export const CLASS_OPTIONS = [
  { value: "23DPM", label: "23DPM" },
  { value: "22DPM", label: "22DPM" },
  { value: "21DPM", label: "21DPM" },
  { value: "20DPM", label: "20DPM" }
] as const

export const INITIAL_FORM_DATA = {
  fullName: "",
  studentId: "",
  gender: "",
  dateOfBirth: "",
  email: "",
  major: "",
  idNumber: "",
  specialization: "",
  residence: "",
  academicYear: "",
  class: "",
} as const
