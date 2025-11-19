import { api } from '@/lib/api/client';
import type {
  Building,
  BuildingLight,
  ApiResponse,
  PagedResult,
  GetBuildingsParams,
  CreateBuildingPayload,
  UpdateBuildingPayload,
} from '../types/types';

export const buildingsApi = {
  // GET /v1/Building/light - Lấy danh sách tòa nhà dạng rút gọn
  getLight: async (): Promise<BuildingLight[]> => {
    const response = await api.get<ApiResponse<BuildingLight[]>>('/v1/Building/light');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  // GET /v1/Building/full - Lấy danh sách tòa nhà đầy đủ (phân trang)
  getFull: async (params: GetBuildingsParams = {}): Promise<ApiResponse<PagedResult<Building[]>>> => {
    const { pageIndex = 1, pageSize = 20, search } = params;
    const queryParams: Record<string, string> = {
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
    };
    if (search) {
      queryParams.search = search;
    }

    const response = await api.get<ApiResponse<PagedResult<Building[]>>>('/v1/Building/full', {
      params: queryParams,
    });
    
    // Return the ApiResponse wrapper
    return response.data;
  },

  // GET /v1/Building/get/{id} - Lấy chi tiết tòa nhà
  getById: async (id: string): Promise<Building> => {
    const response = await api.get<ApiResponse<Building>>(`/v1/Building/get/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không tìm thấy tòa nhà');
  },

  // POST /v1/Building/create - Tạo tòa nhà mới
  create: async (payload: CreateBuildingPayload): Promise<ApiResponse<Building>> => {
    const response = await api.post<ApiResponse<Building>>('/v1/Building/create', payload);
    return response.data;
  },

  // PUT /v1/Building/update/{id} - Cập nhật tòa nhà
  update: async (id: string, payload: UpdateBuildingPayload): Promise<ApiResponse<Building>> => {
    const response = await api.put<ApiResponse<Building>>(`/v1/Building/update/${id}`, payload);
    return response.data;
  },

  // DELETE /v1/Building/delete/{id} - Xóa mềm tòa nhà
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/v1/Building/delete/${id}`);
    return response.data;
  },

  // Bulk delete - xóa nhiều tòa nhà
  bulkDelete: async (ids: string[]): Promise<ApiResponse<null>> => {
    try {
      const results = await Promise.allSettled(ids.map((id) => buildingsApi.delete(id)));
      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      
      if (failed.length > 0) {
        return {
          success: false,
          message: `Xóa thành công ${ids.length - failed.length}/${ids.length} tòa nhà`,
          data: null,
        };
      }
      
      return {
        success: true,
        message: `Đã xóa ${ids.length} tòa nhà`,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Xóa hàng loạt thất bại',
        data: null,
      };
    }
  },

  // Bulk update - cập nhật nhiều tòa nhà
  bulkUpdate: async (payload: {
    buildingIds: string[];
    buildingStatus?: 'active' | 'inactive';
    address?: string;
  }): Promise<ApiResponse<null>> => {
    try {
      const updatePayload: UpdateBuildingPayload = {};
      if (payload.buildingStatus) {
        updatePayload.buildingStatus = payload.buildingStatus;
      }
      if (payload.address) {
        updatePayload.address = payload.address;
      }

      const results = await Promise.allSettled(
        payload.buildingIds.map((id) => buildingsApi.update(id, updatePayload))
      );
      
      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      
      if (failed.length > 0) {
        return {
          success: false,
          message: `Cập nhật thành công ${payload.buildingIds.length - failed.length}/${payload.buildingIds.length} tòa nhà`,
          data: null,
        };
      }
      
      return {
        success: true,
        message: `Đã cập nhật ${payload.buildingIds.length} tòa nhà`,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật hàng loạt thất bại',
        data: null,
      };
    }
  },
};

