export interface Subject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  isGeneral: boolean;
  subjectStatus: 'active' | 'inactive' | 'archived';
  departmentName: string;
  prerequisiteSubjectName?: string;
  activeCoursesCount: number;
  totalEnrollmentsCount: number;
}

export interface SubjectDetail extends Subject {
  departmentId: string;
  prerequisiteSubjectId?: string;
}

export interface CreateSubjectPayload {
  subjectName: string;
  subjectCode: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  isGeneral: boolean;
  departmentId: string;
  subjectStatus: 'active' | 'inactive' | 'archived';
  prerequisiteSubjectId?: string;
}

export interface UpdateSubjectPayload extends CreateSubjectPayload {
  subjectId: string;
}

export interface GetSubjectsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  facultyId?: string;
  departmentId?: string;
  isGeneral?: boolean;
  status?: string;
}

export interface SubjectsResponse {
  subjects: Subject[];
  pagination: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Faculty {
  facultyId: string;
  facultyName: string;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  facultyId?: string;
  facultyName?: string;
}

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Tạm ngưng' },
  { value: 'archived', label: 'Lưu trữ' },
];

export const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Hoạt động', color: 'bg-green-100 text-green-800' };
    case 'inactive':
      return { label: 'Tạm ngưng', color: 'bg-gray-100 text-gray-800' };
    case 'archived':
      return { label: 'Lưu trữ', color: 'bg-red-100 text-red-800' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800' };
  }
};
