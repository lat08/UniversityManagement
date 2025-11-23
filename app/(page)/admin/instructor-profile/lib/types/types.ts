export interface FacultyOption {
  facultyId: string;
  facultyName: string;
}

export interface InstructorListItem {
  instructorId: string;
  instructorCode: string;
  fullName: string;
  degree: string | null;
  specialization: string | null;
  facultyName: string;
  email: string;
  phoneNumber: string | null;
  classCount: number;
  employmentStatus: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface InstructorStatistics {
  totalInstructors: number;
  currentlyActive: number;
  doctorCount: number;
  masterCount: number;
  bachelorCount: number;
  engineerCount: number;
  onLeave: number;
  retired: number;
}

export interface InstructorsResponse {
  instructors: InstructorListItem[];
  statistics: InstructorStatistics;
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[] | null;
}

export interface CreateInstructorPayload {
  fullName: string;
  gender: string;
  facultyId: string;
  dateOfBirth?: string;
  hireDate?: string;
  phoneNumber?: string;
  citizenId?: string;
  address?: string;
  degree?: 'PhD' | 'Master' | 'Bachelor' | 'Engineer';
  specialization?: string;
  employmentStatus?: 'active' | 'on_leave' | 'retired';
  profilePicture?: File;
}

export interface InstructorDetail {
  instructorId: string;
  instructorCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phoneNumber: string;
  citizenId: string;
  address: string;
  profilePicture: string | null;
  facultyId: string;
  facultyName: string;
  facultyCode: string;
  degree: string | null;
  specialization: string | null;
  hireDate: string;
  employmentStatus: string;
  currentClassCount?: number;
}

export interface UpdateInstructorPayload {
  fullName?: string;
  gender?: string;
  facultyId?: string;
  dateOfBirth?: string;
  hireDate?: string; 
  phoneNumber?: string;
  citizenId?: string;
  address?: string;
  degree?: 'PhD' | 'Master' | 'Bachelor' | 'Engineer';
  specialization?: string;
  employmentStatus?: 'active' | 'on_leave' | 'retired' | 'inactive';
  profilePicture?: File;
  password?: string;
  confirmPassword?: string;
}

