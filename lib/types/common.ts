export interface Semester {
  semesterId: string;
  semesterName: string;
  semesterType: string;
  startDate: string;
  endDate: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
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

export interface Building {
  buildingId: string;
  buildingCode: string;
  buildingName: string;
  address: string;
  status: string;
}

export interface CourseClass {
  courseClassId: string;
  courseClassCode: string;
  id?: string; // Alternative field name
  code?: string; // Alternative field name
}

export interface Instructor {
  instructorId: string;
  instructorCode?: string;
  instructorName?: string;
  fullName?: string;
  name?: string;
  id?: string; // Alternative field name
  userId?: string; // Alternative field name
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[] | null;
}

export type GetSemestersResponse = ApiResponse<Semester[]>;
export type GetSubjectsResponse = ApiResponse<Subject[]>;
export type GetFacultiesResponse = ApiResponse<Faculty[]>;
export type GetDepartmentsResponse = ApiResponse<Department[]>;
export type GetClassesResponse = ApiResponse<Class[]>;
export type GetAcademicYearsResponse = ApiResponse<AcademicYear[]>;
export type GetBuildingsResponse = ApiResponse<Building[]>;
export type GetCourseClassesBySubjectResponse = ApiResponse<CourseClass[]>;
export type GetInstructorsResponse = ApiResponse<Instructor[]>;

export interface GetClassesParams {
  departmentId?: string;
  facultyId?: string;
  semesterId?: string;
}

export interface GetDepartmentsParams {
  facultyId?: string;
}

export interface GetAcademicYearsParams {
  count?: number;
}

export interface GetSubjectsParams {
  instructorId?: string;
  semesterId?: string;
}

export interface GetCourseClassesBySubjectParams {
  subjectId: string;
  semesterId?: string;
}

export interface GetInstructorsParams {
  searchString?: string;
}

