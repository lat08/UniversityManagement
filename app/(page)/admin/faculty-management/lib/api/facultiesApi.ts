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
    const params: Record<string, string> = {};
    if (searchQuery) {
      params.search = searchQuery;
    }

    const response = await api.get<ApiResponse<PaginatedResponse<Faculty>>>('/v1/admin/faculties', {
      params,
    });

    return response.data.data.items;
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
    const faculties = await this.getAll()
    return {
      total: faculties.length,
      active: faculties.filter((f) => f.facultyStatus === "active").length,
      inactive: faculties.filter((f) => f.facultyStatus === "inactive").length,
    }
  },

  async getDivisions(): Promise<Division[]> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Division>>>('/v1/divisions');
      return response.data.data?.items || [];
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
      return [];
    }
  },

  async getDeans(): Promise<Dean[]> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Dean>>>('/v1/instructors');
      return response.data.data?.items || [];
    } catch (error) {
      console.error('Failed to fetch deans:', error);
      return [];
    }
  },
}
