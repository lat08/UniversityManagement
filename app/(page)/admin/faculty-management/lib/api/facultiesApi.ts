import { api } from '@/lib/api/client';
import {
  Faculty,
  CreateFacultyDto,
  UpdateFacultyDto,
  BulkEditFacultyDto,
  FacultyStats,
  ApiResponse,
  PaginatedResponse,
  Division,
  Dean,
} from "../types/types"

export const facultyApi = {
  async getAll(searchQuery?: string): Promise<Faculty[]> {
    const params: Record<string, string | number> = {
      pageSize: 1000,
      pageNumber: 1,
    };
    
    if (searchQuery && searchQuery.trim()) {
      params.SearchTerm = searchQuery.trim();
    }

    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Faculty>>>('/v1/admin/faculties', {
        params,
      });

      if (response.data.success && response.data.data) {
        return response.data.data.items || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch faculties:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Faculty> {
    const response = await api.get<ApiResponse<Faculty>>(`/v1/admin/faculties/${id}`);
    return response.data.data;
  },

  async create(data: CreateFacultyDto): Promise<Faculty> {
    const response = await api.post<ApiResponse<Faculty>>('/v1/admin/faculties', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateFacultyDto): Promise<Faculty> {
    const response = await api.put<ApiResponse<Faculty>>(`/v1/admin/faculties/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/v1/admin/faculties/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.delete(id)))
  },

  async bulkEdit(data: BulkEditFacultyDto): Promise<void> {
    await Promise.all(
      data.ids.map((id) =>
        this.update(id, {
          divisionId: data.updates.divisionId,
          deanId: data.updates.deanId,
          facultyStatus: data.updates.facultyStatus,
        })
      )
    )
  },

  async getStats(): Promise<FacultyStats> {
    try {
      const faculties = await this.getAll();
      return {
        total: faculties.length,
        active: faculties.filter((f) => f.facultyStatus === "active").length,
        inactive: faculties.filter((f) => f.facultyStatus === "inactive").length,
      };
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }
  },

  async getDivisions(): Promise<Division[]> {
    try {
      // Sử dụng endpoint common/faculties và extract divisions unique
      const response = await api.get<ApiResponse<PaginatedResponse<Faculty>>>('/v1/admin/faculties', {
        params: {
          pageSize: 100,
          pageNumber: 1,
        }
      });
      
      if (response.data.success && response.data.data) {
        const faculties = response.data.data.items || [];
        const divisionsMap = new Map<string, Division>();
        
        faculties.forEach((faculty: Faculty) => {
          if (faculty.divisionId && !divisionsMap.has(faculty.divisionId)) {
            divisionsMap.set(faculty.divisionId, {
              divisionId: faculty.divisionId,
              divisionName: faculty.divisionName,
              divisionCode: faculty.divisionCode,
            });
          }
        });
        
        return Array.from(divisionsMap.values());
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
      return [];
    }
  },

  async getDeans(): Promise<Dean[]> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Dean>>>('/v1/common/instructors', {
        params: {
          pageSize: 100,
        }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.items || response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch deans:', error);
      return [];
    }
  },

  async getCurriculums(): Promise<{ curriculumId: string; curriculumCode: string; curriculumName: string }[]> {
    try {
      // Lấy danh sách CTĐT unique từ faculties
      const response = await api.get<ApiResponse<PaginatedResponse<Faculty>>>('/v1/admin/faculties', {
        params: {
          pageSize: 100,
          pageNumber: 1,
        }
      });
      
      if (response.data.success && response.data.data) {
        const faculties = response.data.data.items || [];
        const curriculumsSet = new Set<string>();
        
        faculties.forEach((faculty: Faculty) => {
          if (faculty.curriculumCodes && Array.isArray(faculty.curriculumCodes)) {
            faculty.curriculumCodes.forEach((code: string) => curriculumsSet.add(code));
          }
        });
        
        // Convert Set to array of objects
        return Array.from(curriculumsSet).map((code) => ({
          curriculumId: code,
          curriculumCode: code,
          curriculumName: code,
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch curriculums:', error);
      return [];
    }
  },
}
