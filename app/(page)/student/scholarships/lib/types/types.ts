export interface FormData {
  fullName: string
  studentId: string
  gender: string
  dateOfBirth: string
  email: string
  major: string
  idNumber: string
  specialization: string
  residence: string
  academicYear: string
  class: string
}

export interface FormErrors {
  [key: string]: boolean
}
