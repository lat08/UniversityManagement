export interface InstructorProfile {
  instructorId: string
  instructorCode: string
  fullName: string
  gender: 'male' | 'female' | 'other'
  dateOfBirth: string
  email: string
  phoneNumber: string
  citizenId: string
  address: string
  profilePicture?: string
  degree: string
  specialization: string
  departmentName?: string
  facultyName?: string
  hireDate: string
  employmentStatus: string
  yearsOfService: number
  totalCourses: number
  totalStudents: number
  totalDocuments: number
  role: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors: Record<string, string[]> | null
}

export interface UpdateProfilePayload {
  fullName?: string
  gender?: 'male' | 'female' | 'other'
  dateOfBirth?: string
  phoneNumber?: string
  address?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

