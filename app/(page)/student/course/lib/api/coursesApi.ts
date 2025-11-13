// Path: lib/api/coursesApi.ts
import { api } from "@/lib/api/client" // Giả sử client.ts là file cấu hình Axios
import { CourseDto, PaginatedResponse, BulkEnrollmentResult } from "../type/courseType"

export interface GetAvailableCoursesParams {
    pageNumber?: number;
    pageSize?: number;
    searchQuery?: string;
    availableOnly?: boolean | null;
    isGeneral?: boolean | null;
    isInStudentCurriculum?: boolean | null;
}

export const coursesApi = {
    // GET: /v1/enrollments/available with pagination
    getAvailable: async (params?: GetAvailableCoursesParams): Promise<PaginatedResponse<CourseDto>> => {
        const response = await api.get(`/v1/enrollments/available`, {
            params: {
                pageNumber: params?.pageNumber ?? 1,
                pageSize: params?.pageSize ?? 15,
                searchQuery: params?.searchQuery,
                availableOnly: params?.availableOnly,
                isGeneral: params?.isGeneral,
                isInStudentCurriculum: params?.isInStudentCurriculum,
            }
        });
        
        // Backend: { success, message, data: { items: { courses: [...], semesterName: "..." }, totalCount, ... } }
        const wrapper = response.data;
        const paginatedData = wrapper?.data;

        if (!paginatedData) {
            return {
                items: [],
                totalCount: 0,
                pageNumber: 1,
                pageSize: 15,
                totalPages: 0,
                hasPrevious: false,
                hasNext: false,
            };
        }

        // items là object CourseEnrollmentResponseDto có property courses
        const courses = Array.isArray(paginatedData.items?.courses) ? paginatedData.items.courses : [];

        return {
            items: courses,
            totalCount: paginatedData.totalCount ?? 0,
            pageNumber: paginatedData.pageNumber ?? 1,
            pageSize: paginatedData.pageSize ?? 15,
            totalPages: paginatedData.totalPages ?? 0,
            hasPrevious: paginatedData.hasPrevious ?? false,
            hasNext: paginatedData.hasNext ?? false,
        };
    },
    // GET: /v1/enrollments/registered
    getRegistered: async (): Promise<CourseDto[]> => {
        const response = await api.get(`/v1/enrollments/registered`, {});
        
        // Backend: { success, message, data: { items: { courses: [...], semesterName: "..." }, totalCount, ... } }
        const pagedData = response.data?.data;
        
        // items là object CourseEnrollmentResponseDto có property courses
        const courses = Array.isArray(pagedData?.items?.courses) ? pagedData.items.courses : [];
        
        return courses;
    },
    // POST: /v1/enrollments/enroll (Truyền courseId qua body)
    registerCourse: async (courseId: string): Promise<void> => {
        await api.post(`/v1/enrollments/enroll`, { courseId: courseId });
    },
    // POST: /v1/enrollments/unenroll (Truyền courseId qua body)
    cancelRegistration: async (courseId: string): Promise<void> => {
        await api.post(`/v1/enrollments/unenroll`, { courseId: courseId });
    },
    // POST: /v1/enrollments/enroll/bulk (Đăng ký nhiều môn cùng lúc)
    registerCoursesBulk: async (courseIds: string[]): Promise<BulkEnrollmentResult> => {
        const response = await api.post(`/v1/enrollments/enroll/bulk`, { courseIds });
        const data = response.data?.data;
        return {
            successCount: data?.successCount ?? 0,
            failedCount: data?.failureCount ?? 0, // Backend dùng FailureCount (chữ F hoa)
            successResults: data?.successResults ?? [],
            failedResults: data?.failureResults ?? []
        };
    },
}