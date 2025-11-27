export interface Faculty {
  facultyId: string;
  facultyName: string;
  facultyCode: string;
  divisionId?: string;
  divisionName?: string;
  divisionCode?: string;
  deanId?: string;
  deanName?: string;
  departmentCount?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface FacultyListResponse {
  faculties: Faculty[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetFacultiesParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  divisionId?: string;
  curriculumId?: string;
  isActive?: boolean | null;
  deanId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateFacultyPayload {
  facultyCode: string;
  facultyName: string;
  divisionId: string;
  deanId?: string;
  isActive?: boolean;
}

export interface UpdateFacultyPayload {
  facultyCode?: string;
  facultyName?: string;
  divisionId?: string;
  deanId?: string;
  isActive?: boolean;
}

export interface Division {
  divisionId: string;
  divisionName: string;
  divisionCode: string;
  divisionStatus?: string;
}

export interface Curriculum {
  curriculumId: string;
  curriculumCode: string;
  curriculumName: string;
  departmentId: string;
  departmentName: string;
  appliedYear: number;
  versionNumber: number;
  isActive: boolean;
}

export interface Instructor {
  instructorId: string;
  instructorCode: string;
  fullName: string;
}

export const getStatusDisplay = (
  isActive: boolean,
  labels?: {
    active: string;
    inactive: string;
  }
) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    true: { label: labels?.active ?? 'Active', color: 'bg-green-100 text-green-700' },
    false: { label: labels?.inactive ?? 'Inactive', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[String(isActive)] || { label: labels?.inactive ?? 'Inactive', color: 'bg-gray-100 text-gray-700' };
};

