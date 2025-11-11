// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// Document Types
export interface MaterialDocument {
  documentId: string;
  fileTitle: string;
  fileType: string;
  fileSize: number;
  fileSizeMb: string;
  description: string;
  documentType: string;
  filePath: string;
  previewUrl: string;
  downloadUrl: string;
  created: string;
}

export interface CourseClassMaterials {
  courseClassId: string;
  courseName: string;
  uploadedById: string;
  uploadedByName: string;
  documents: MaterialDocument[];
}

export interface MaterialsData {
  items: CourseClassMaterials[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface DocumentType {
  documentType: string;
}

// Form Data Types
export interface UploadMaterialRequest {
  courseClassId: string;
  documentType: string;
  title: string;
  description: string;
  file: File;
}

export interface UpdateMaterialRequest {
  courseClassId: string;
  documentType: string;
  title: string;
  description: string;
  file?: File | null;
}

export interface UploadMaterialResponse {
  documentId: string;
  fileName: string;
  filePath: string;
  message: string;
}

// Query Params
export interface GetMaterialsParams {
  keyword?: string;
  semesterId?: string;
  subjectId?: string;
  documentType?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface InstructorCourseClassDto {
  courseClassId: string;
  subjectId: string;
  courseCode: string;
  courseName: string;
  className: string;
  semesterName: string;
  totalStudents: number;
  studentsWithGrades: number;
  status: string;
  isDraftEditable: boolean;
}

