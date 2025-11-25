export interface Major {
  majorId: string;
  majorCode: string;
  majorName: string;
  facultyId: string;
  facultyName: string;
  trainingSystemName: string;
  curriculumId: string;
  curriculumName: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface MajorsResponse {
  majors: Major[];
  pagination: Pagination;
  statistics?: {
    totalMajors: number;
    activeMajors: number;
    inactiveMajors: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface Faculty {
  facultyId: string;
  facultyName: string;
  facultyCode: string;
}

export interface TrainingSystem {
  trainingSystemId: string;
  trainingSystemName: string;
  trainingSystemCode: string;
}

export interface Curriculum {
  curriculumId: string;
  curriculumName: string;
  curriculumCode: string;
}

export interface GetMajorsParams {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  facultyId?: string;
  trainingSystemId?: string;
  curriculumId?: string;
  status?: string;
}

export interface CreateMajorPayload {
  majorName: string;
  majorCode: string;
  facultyId: string;
  trainingSystemId: string;
  curriculumId: string;
  status?: 'active' | 'inactive';
}

export interface UpdateMajorPayload extends CreateMajorPayload {
  majorId: string;
}

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

export const getStatusDisplay = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700' },
    inactive: { label: 'Ngừng hoạt động', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
};
