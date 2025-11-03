export interface Semester {
  semesterId: string;
  semesterName: string;
  semesterType: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface Subject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits?: number;
  theoryHours?: number;
  practiceHours?: number;
  status?: string;
  departmentName?: string;
}

export interface Faculty {
  facultyId: string;
  facultyName: string;
  facultyCode: string;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  facultyId?: string;
  facultyName?: string;
}

export interface Class {
  classId: string;
  classCode: string;
  className: string;
  departmentId?: string;
  departmentName?: string;
  startDate?: string;
  endDate?: string;
}

export interface AcademicYear {
  academicYearId: string;
  yearRange: string;
  yearCode: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[] | null;
}

export interface GetSemestersResponse extends ApiResponse<Semester[]> {}
export interface GetSubjectsResponse extends ApiResponse<Subject[]> {}
export interface GetFacultiesResponse extends ApiResponse<Faculty[]> {}
export interface GetDepartmentsResponse extends ApiResponse<Department[]> {}
export interface GetClassesResponse extends ApiResponse<Class[]> {}
export interface GetAcademicYearsResponse extends ApiResponse<AcademicYear[]> {}

export interface GetClassesParams {
  departmentId?: string;
  facultyId?: string;
}

export interface GetDepartmentsParams {
  facultyId?: string;
}

export interface GetAcademicYearsParams {
  count?: number;
}

