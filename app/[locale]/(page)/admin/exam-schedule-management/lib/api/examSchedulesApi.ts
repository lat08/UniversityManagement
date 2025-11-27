import { api } from '@/lib/api/client';
import type {
  ExamScheduleDetail,
  ApiResponse,
  GetExamSchedulesParams,
  ExamSchedulesResponse,
  CreateExamSchedulePayload,
  UpdateExamSchedulePayload,
  BulkActionDto,
  BulkCancelDto,
  BulkActionResultDto,
} from '../types/types';

interface ApiResponseData {
  Success?: boolean;
  success?: boolean;
  Message?: string;
  message?: string;
  Data?: unknown;
  data?: unknown;
  TotalCount?: number;
  totalCount?: number;
  PageNumber?: number;
  pageNumber?: number;
  PageSize?: number;
  pageSize?: number;
}

export const examSchedulesApi = {
  // GET /v1/admin/exam-schedules - Lấy danh sách lịch thi
  getList: async (params: GetExamSchedulesParams = {}): Promise<ExamSchedulesResponse> => {
    const {
      pageNumber = 1,
      pageSize = 20,
      semesterId,
      courseClassId,
      status,
      searchTerm,
    } = params;

    // ASP.NET Core uses camelCase for query parameters by default
    const queryParams: Record<string, string> = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };

    if (semesterId) queryParams.semesterId = semesterId;
    if (courseClassId) queryParams.courseClassId = courseClassId;
    if (status) queryParams.status = status;
    if (searchTerm) queryParams.searchTerm = searchTerm;

    const response = await api.get<ApiResponseData>('/v1/admin/exam-schedules', {
      params: queryParams,
    });

    // Backend returns PagedApiResponse<AdminExamScheduleDto> with PascalCase properties
    // Structure: { Success, Message, Data, TotalCount, PageNumber, PageSize }
    const responseData = response.data;
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Exam schedules API response:', responseData);
    }
    
    // Backend uses PascalCase, handle both for compatibility
    const success = responseData.Success ?? responseData.success ?? false;
    const message = responseData.Message ?? responseData.message ?? '';
    const data = responseData.Data ?? responseData.data ?? [];
    const totalCount = responseData.TotalCount ?? responseData.totalCount ?? 0;
    const pageNum = responseData.PageNumber ?? responseData.pageNumber ?? pageNumber;
    const pageSz = responseData.PageSize ?? responseData.pageSize ?? pageSize;
    
    return {
      success,
      message,
      data: Array.isArray(data) ? data : [],
      totalCount: Number(totalCount) || 0,
      pageNumber: Number(pageNum) || pageNumber,
      pageSize: Number(pageSz) || pageSize,
    };
  },

  // GET /v1/admin/exam-schedules/{id} - Lấy chi tiết lịch thi
  getById: async (id: string): Promise<ExamScheduleDetail> => {
    const response = await api.get<ApiResponseData>(`/v1/admin/exam-schedules/${id}`);
    
    // Backend returns ApiResponse<AdminExamScheduleDetailDto> with PascalCase
    const responseData = response.data;
    const success = responseData.Success ?? responseData.success ?? false;
    const message = responseData.Message ?? responseData.message ?? '';
    const data = responseData.Data ?? responseData.data;
    
    if (success && data && typeof data === 'object') {
      return data as ExamScheduleDetail;
    }
    throw new Error(message || 'Không tìm thấy lịch thi');
  },

  // POST /v1/admin/exam-schedules - Tạo lịch thi mới
  create: async (payload: CreateExamSchedulePayload): Promise<ApiResponse<string>> => {
    try {
      // Log payload in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating exam schedule with payload:', JSON.stringify(payload, null, 2));
      }

      // ASP.NET Core JSON serializer uses camelCase by default
      // Backend DTOs have PascalCase properties but JSON uses camelCase
      const backendPayload = {
        courseClassId: payload.courseClassId,
        roomId: payload.roomId,
        examDate: payload.examDate, // YYYY-MM-DD format
        examTime: payload.examTime, // HH:mm format (TimeOnly can parse this)
        durationInMinutes: payload.durationInMinutes,
        examFormat: payload.examFormat,
        proctorIds: payload.proctorIds,
        notes: payload.notes || undefined,
      };

      const response = await api.post<ApiResponseData>('/v1/admin/exam-schedules', backendPayload);
      
      // Backend returns ApiResponse<Guid> with PascalCase
      const responseData = response.data;
      const dataValue = responseData.Data ?? responseData.data;
      return {
        success: responseData.Success ?? responseData.success ?? false,
        message: responseData.Message ?? responseData.message ?? '',
        data: typeof dataValue === 'string' ? dataValue : '',
      };
    } catch (error: unknown) {
      // Log error details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating exam schedule:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { status?: number; data?: unknown } };
          if (apiError.response) {
            console.error('Response status:', apiError.response.status);
            console.error('Response data:', apiError.response.data);
          }
        }
      }
      throw error;
    }
  },

  // PUT /v1/admin/exam-schedules/{id} - Cập nhật lịch thi
  update: async (id: string, payload: UpdateExamSchedulePayload): Promise<ApiResponse<null>> => {
    // ASP.NET Core uses camelCase for JSON by default
    const backendPayload: Record<string, unknown> = {};
    if (payload.roomId !== undefined) backendPayload.roomId = payload.roomId;
    if (payload.examDate !== undefined) backendPayload.examDate = payload.examDate;
    if (payload.examTime !== undefined) backendPayload.examTime = payload.examTime;
    if (payload.durationInMinutes !== undefined) backendPayload.durationInMinutes = payload.durationInMinutes;
    if (payload.examFormat !== undefined) backendPayload.examFormat = payload.examFormat;
    if (payload.proctorIds !== undefined) backendPayload.proctorIds = payload.proctorIds;
    if (payload.notes !== undefined) backendPayload.notes = payload.notes || undefined;

    const response = await api.put<ApiResponseData>(`/v1/admin/exam-schedules/${id}`, backendPayload);
    
    // Backend returns ApiResponse<object> with PascalCase
    const responseData = response.data;
    return {
      success: responseData.Success ?? responseData.success ?? false,
      message: responseData.Message ?? responseData.message ?? '',
      data: null,
    };
  },

  // POST /v1/admin/exam-schedules/publish - Công bố lịch thi (hàng loạt)
  publish: async (payload: BulkActionDto): Promise<ApiResponse<BulkActionResultDto>> => {
    // ASP.NET Core uses camelCase for JSON
    const backendPayload = {
      ids: payload.ids,
    };
    
    const response = await api.post<ApiResponseData>('/v1/admin/exam-schedules/publish', backendPayload);
    
    const responseData = response.data;
    const dataValue = responseData.Data ?? responseData.data;
    const defaultResult: BulkActionResultDto = { successCount: 0, failureCount: 0, errorMessages: [] };
    return {
      success: responseData.Success ?? responseData.success ?? false,
      message: responseData.Message ?? responseData.message ?? '',
      data: (dataValue && typeof dataValue === 'object' && 'successCount' in dataValue) 
        ? (dataValue as BulkActionResultDto) 
        : defaultResult,
    };
  },

  // POST /v1/admin/exam-schedules/cancel - Hủy lịch thi (hàng loạt)
  cancel: async (payload: BulkCancelDto): Promise<ApiResponse<BulkActionResultDto>> => {
    // ASP.NET Core uses camelCase for JSON
    const backendPayload = {
      ids: payload.ids,
      reason: payload.reason,
    };
    
    const response = await api.post<ApiResponseData>('/v1/admin/exam-schedules/cancel', backendPayload);
    
    const responseData = response.data;
    const dataValue = responseData.Data ?? responseData.data;
    const defaultResult: BulkActionResultDto = { successCount: 0, failureCount: 0, errorMessages: [] };
    return {
      success: responseData.Success ?? responseData.success ?? false,
      message: responseData.Message ?? responseData.message ?? '',
      data: (dataValue && typeof dataValue === 'object' && 'successCount' in dataValue) 
        ? (dataValue as BulkActionResultDto) 
        : defaultResult,
    };
  },

  // DELETE /v1/admin/exam-schedules - Xóa lịch thi (hàng loạt)
  delete: async (payload: BulkActionDto): Promise<ApiResponse<BulkActionResultDto>> => {
    // ASP.NET Core uses camelCase for JSON
    const backendPayload = {
      ids: payload.ids,
    };
    
    const response = await api.delete<ApiResponseData>('/v1/admin/exam-schedules', {
      data: backendPayload,
    });
    
    const responseData = response.data;
    const dataValue = responseData.Data ?? responseData.data;
    const defaultResult: BulkActionResultDto = { successCount: 0, failureCount: 0, errorMessages: [] };
    return {
      success: responseData.Success ?? responseData.success ?? false,
      message: responseData.Message ?? responseData.message ?? '',
      data: (dataValue && typeof dataValue === 'object' && 'successCount' in dataValue) 
        ? (dataValue as BulkActionResultDto) 
        : defaultResult,
    };
  },
};

