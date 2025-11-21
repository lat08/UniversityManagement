import { api } from '@/lib/api/client';
import {
  RegulationListResponse,
  RegulationMutationPayload,
  RegulationQueryParams,
  RegulationRecord,
} from '@/lib/types/regulation';
import { createSupabaseClient } from '@/lib/utils/supabase';

/**
 * @api GET /v1/regulations
 * @description Lấy danh sách quy chế với phân trang/ký lọc
 * @param params RegulationFilterParams - bộ lọc & phân trang
 * @returns RegulationListResponse
 * @auth Required (Admin)
 */
const list = async (params: RegulationQueryParams = {}): Promise<RegulationListResponse> => {
  const response = await api.get('/v1/regulations', { params });
  const backendData = response.data.data as {
    data: readonly RegulationRecord[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  return {
    data: backendData.data,
    totalCount: backendData.totalCount,
    page: backendData.page,
    pageSize: backendData.pageSize,
    totalPages: backendData.totalPages,
  };
};

/**
 * @api GET /v1/regulations/:id
 * @description Lấy thông tin chi tiết một quy chế
 * @param id string - ID quy chế
 * @returns RegulationItem
 * @auth Required (Admin)
 */
const getById = async (id: string): Promise<RegulationRecord> => {
  const response = await api.get(`/v1/regulations/${id}`);
  const backendData = response.data.data as {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    issuingUnit: string;
    targetAudience: string;
    status: string;
    issueDate: string;
    effectiveDate: string;
    expireDate: string | null;
    version: string;
    fileUrl: string;
    fileName: string;
    fileType: string | null;
    createdAt: string;
    updatedAt: string | null;
    isDeleted: boolean;
  };
  return {
    id: backendData.id,
    code: backendData.code,
    title: backendData.title,
    description: backendData.description,
    category: backendData.category as RegulationRecord['category'],
    issuingUnit: backendData.issuingUnit as RegulationRecord['issuingUnit'],
    targetAudience: backendData.targetAudience as RegulationRecord['targetAudience'],
    status: backendData.status as RegulationRecord['status'],
    issueDate: backendData.issueDate,
    effectiveDate: backendData.effectiveDate,
    expireDate: backendData.expireDate,
    version: backendData.version,
    fileUrl: backendData.fileUrl,
    fileName: backendData.fileName,
    fileType: backendData.fileType,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
    isDeleted: backendData.isDeleted,
  };
};

/**
 * Upload file lên Supabase bucket 'regulations'
 */
const uploadFile = async (file: File, code: string): Promise<string> => {
  const supabase = createSupabaseClient();
  const filePath = `regulations/${code}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('regulations').upload(filePath, file, {
    upsert: true,
  });
  if (error) {
    throw new Error(error.message);
  }
  const { data: publicUrl } = supabase.storage.from('regulations').getPublicUrl(data.path);
  return publicUrl.publicUrl;
};

/**
 * @api POST /v1/regulations
 * @description Tạo quy chế mới (có upload file)
 * @param payload RegulationPayload
 * @param file File | null
 * @returns RegulationItem
 * @auth Required (Admin)
 */
const create = async (payload: RegulationMutationPayload, file: File | null): Promise<RegulationRecord> => {
  const fileUrl = file ? await uploadFile(file, payload.code) : undefined;
  const fileType = file ? file.name.split('.').pop()?.toLowerCase() ?? null : payload.fileType;
  const response = await api.post('/v1/regulations', {
    code: payload.code,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    issuingUnit: payload.issuingUnit,
    targetAudience: payload.targetAudience,
    status: payload.status,
    issueDate: payload.issueDate,
    effectiveDate: payload.effectiveDate,
    expireDate: payload.expireDate ?? null,
    version: payload.version,
    fileUrl: fileUrl ?? payload.fileUrl ?? '',
    fileType: fileType,
  });
  const backendData = response.data.data as {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    issuingUnit: string;
    targetAudience: string;
    status: string;
    issueDate: string;
    effectiveDate: string;
    expireDate: string | null;
    version: string;
    fileUrl: string;
    fileName: string;
    fileType: string | null;
    createdAt: string;
    updatedAt: string | null;
    isDeleted: boolean;
  };
  return {
    id: backendData.id,
    code: backendData.code,
    title: backendData.title,
    description: backendData.description,
    category: backendData.category as RegulationRecord['category'],
    issuingUnit: backendData.issuingUnit as RegulationRecord['issuingUnit'],
    targetAudience: backendData.targetAudience as RegulationRecord['targetAudience'],
    status: backendData.status as RegulationRecord['status'],
    issueDate: backendData.issueDate,
    effectiveDate: backendData.effectiveDate,
    expireDate: backendData.expireDate,
    version: backendData.version,
    fileUrl: backendData.fileUrl,
    fileName: backendData.fileName,
    fileType: backendData.fileType,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
    isDeleted: backendData.isDeleted,
  };
};

/**
 * @api PUT /v1/regulations/:id
 * @description Cập nhật quy chế
 * @param id string
 * @param payload RegulationPayload
 * @param file File | null
 * @returns RegulationItem
 * @auth Required (Admin)
 */
const update = async (id: string, payload: RegulationMutationPayload, file: File | null): Promise<RegulationRecord> => {
  const fileUrl = file ? await uploadFile(file, payload.code) : undefined;
  const fileType = file ? file.name.split('.').pop()?.toLowerCase() ?? null : payload.fileType;
  const response = await api.put(`/v1/regulations/${id}`, {
    code: payload.code,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    issuingUnit: payload.issuingUnit,
    targetAudience: payload.targetAudience,
    status: payload.status,
    issueDate: payload.issueDate,
    effectiveDate: payload.effectiveDate,
    expireDate: payload.expireDate ?? null,
    version: payload.version,
    fileUrl: fileUrl ?? payload.fileUrl ?? undefined,
    fileType: fileType,
  });
  const backendData = response.data.data as {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    issuingUnit: string;
    targetAudience: string;
    status: string;
    issueDate: string;
    effectiveDate: string;
    expireDate: string | null;
    version: string;
    fileUrl: string;
    fileName: string;
    fileType: string | null;
    createdAt: string;
    updatedAt: string | null;
    isDeleted: boolean;
  };
  return {
    id: backendData.id,
    code: backendData.code,
    title: backendData.title,
    description: backendData.description,
    category: backendData.category as RegulationRecord['category'],
    issuingUnit: backendData.issuingUnit as RegulationRecord['issuingUnit'],
    targetAudience: backendData.targetAudience as RegulationRecord['targetAudience'],
    status: backendData.status as RegulationRecord['status'],
    issueDate: backendData.issueDate,
    effectiveDate: backendData.effectiveDate,
    expireDate: backendData.expireDate,
    version: backendData.version,
    fileUrl: backendData.fileUrl,
    fileName: backendData.fileName,
    fileType: backendData.fileType,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
    isDeleted: backendData.isDeleted,
  };
};

/**
 * @api DELETE /v1/regulations/:id
 * @description Xóa quy chế
 * @param id string
 * @returns void
 * @auth Required (Admin)
 */
const remove = async (id: string): Promise<void> => {
  await api.delete(`/v1/regulations/${id}`);
};

export const regulationApi = {
  list,
  getById,
  create,
  update,
  remove,
  uploadFile,
};

