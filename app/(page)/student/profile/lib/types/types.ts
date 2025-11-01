// Student Profile Types
export interface StudentProfile {
  studentId: string
  fullName: string
  studentCode: string
  gender: "male" | "female" | "other"
  dateOfBirth: string
  email: string
  phoneNumber: string | null
  citizenId: string | null
  departmentName: string
  facultyName: string
  classCode: string
  className: string
  enrollmentStatus: string
  educationLevel: string
  academicYear: string
  address: string | null
  profilePicture: string | null
  role: string
}

export interface StudentProfileResponse {
  success: boolean
  message: string
  data: StudentProfile
  errors: string[] | null
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
  data: null
  errors: string[] | null
}

