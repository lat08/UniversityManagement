// Types for Class Management

export interface Class {
  classId: string;
  classCode: string;
  className: string;
  departmentId: string;
  departmentName: string;
  facultyId?: string;
  facultyName?: string;
  advisorInstructorId?: string;
  advisorInstructorName?: string;
  trainingSystemId: string;
  trainingSystemName: string;
  startAcademicYearId: string;
  startAcademicYearName: string;
  endAcademicYearId: string;
  endAcademicYearName: string;
  curriculumDescPdf?: string;
  classStatus: string;
  curriculumId?: string;
  curriculumName?: string;
  studentCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ClassDetail extends Class {
  students: StudentDto[];
}

export interface StudentDto {
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  enrollmentStatus: string;
}

export interface CreateClassDto {
  classCode: string;
  className: string;
  departmentId: string;
  advisorInstructorId?: string;
  trainingSystemId: string;
  startAcademicYearId: string;
  curriculumId?: string;
}

export interface UpdateClassDto {
  className: string;
  advisorInstructorId?: string;
  trainingSystemId: string;
  classStatus: string;
  curriculumId?: string;
}

export interface ClassFilterDto {
  departmentId?: string;
  trainingSystemId?: string;
  advisorInstructorId?: string;
  startAcademicYearId?: string;
  endAcademicYearId?: string;
  classStatus?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface ClassListResponse {
  classes: Class[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface InstructorBasicDto {
  instructorId: string;
  fullName: string;
}

export interface CurriculumBasicDto {
  curriculumId: string;
  curriculumName: string;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  facultyId: string;
}

export interface TrainingSystem {
  trainingSystemId: string;
  trainingSystemName: string;
  trainingSystemCode?: string;
}

export interface AcademicYear {
  academicYearId: string;
  yearName: string;
  yearCode?: string;
}

export const CLASS_STATUS_OPTIONS = [
  { value: 'active', labelKey: 'status.active' },
  { value: 'graduated', labelKey: 'status.graduated' },
  { value: 'inactive', labelKey: 'status.inactive' },
] as const;

export const getStatusDisplay = (status: string, t: (key: string) => string) => {
  const option = CLASS_STATUS_OPTIONS.find(opt => opt.value === status);
  if (!option) return { label: status, color: 'bg-gray-100 text-gray-800' };
  
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    graduated: 'bg-blue-100 text-blue-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  
  return {
    label: t(option.labelKey),
    color: colorMap[status] || 'bg-gray-100 text-gray-800',
  };
};

