// Path: lib/api/coursesApi.ts
import { api } from "@/lib/api/client" // Giả sử client.ts là file cấu hình Axios
import { CourseDto, PaginatedResponse } from "../type/courseType"

export interface GetAvailableCoursesParams {
    pageNumber?: number;
    pageSize?: number;
}

export const coursesApi = {
    // GET: /v1/enrollments/available with pagination
    getAvailable: async (params?: GetAvailableCoursesParams): Promise<PaginatedResponse<CourseDto>> => {
        const response = await api.get(`/v1/enrollments/available`, {
            params: {
                pageNumber: params?.pageNumber ?? 1,
                pageSize: params?.pageSize ?? 10,
            }
        });
        // Backend returns a wrapper: { success, message, data: { items, totalCount, ... } }
        return response.data?.data || {
            items: [],
            totalCount: 0,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false,
        };
    },
    // GET: /v1/enrollments/registered
    getRegistered: async (): Promise<CourseDto[]> => {
        const response = await api.get(`/v1/enrollments/registered`, {});
        // Backend returns a wrapper: { success, message, data: [...] }
        // Return the inner `data` array (or empty array if missing)
        return response.data?.data || [];
    },
    // POST: /v1/enrollments/enroll (Truyền courseId qua body)
    registerCourse: async (courseId: string): Promise<void> => {
        await api.post(`/v1/enrollments/enroll`, { courseId: courseId });
    },
    // POST: /v1/enrollments/unenroll (Truyền courseId qua body)
    cancelRegistration: async (courseId: string): Promise<void> => {
        await api.post(`/v1/enrollments/unenroll`, { courseId: courseId });
    },
}