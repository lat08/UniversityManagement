import type { ApiResponse, ChangePasswordDto } from "@/lib/api/auth"

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

export type StudentProfileResponse = ApiResponse<StudentProfile>
export type ChangePasswordRequest = ChangePasswordDto
export type ChangePasswordResponse = ApiResponse<boolean>

