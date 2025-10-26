// Path: lib/api/coursesApi.ts
import { api } from "@/lib/api/client" // Giả sử client.ts là file cấu hình Axios
import { CourseDto } from "../type/courseType"

export const coursesApi = {
    // GET: /v1/enrollments/available
    getAvailable: async (): Promise<CourseDto[]> => {
        const response = await api.get(`/v1/enrollments/available`, {});
        // Backend returns a wrapper: { success, message, data: [...] }
        // We need to return the inner `data` array so consumers get CourseDto[]
        return response.data?.data || []; // safe fallback to empty array
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