import { api } from "@/lib/api/client";
import { 
  GetMaterialsResponse, 
  GetDocumentTypesResponse, 
  GetMaterialsParams,
} from "../types/types";

export const documentsApi = {
  /**
   * Get materials/documents for current user with optional filters
   * @param params - Search and filter parameters
   * @returns Promise with materials response
   */
  getMaterials: async (params?: GetMaterialsParams): Promise<GetMaterialsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.keyword && params.keyword.trim()) {
        queryParams.append('Keyword', params.keyword.trim());
      }
      if (params?.documentType && params.documentType.trim()) {
        queryParams.append('DocumentType', params.documentType.trim());
      }
      if (params?.semesterId && params.semesterId.trim()) {
        queryParams.append('SemesterId', params.semesterId.trim());
      }
      if (params?.subjectId && params.subjectId.trim()) {
        queryParams.append('SubjectId', params.subjectId.trim());
      }
      if (params?.pageNumber && params.pageNumber > 0) {
        queryParams.append('PageNumber', params.pageNumber.toString());
      }
      if (params?.pageSize && params.pageSize > 0) {
        queryParams.append('PageSize', params.pageSize.toString());
      }
      
      const url = `/v1/materials/GetMaterials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await api.get<GetMaterialsResponse>(url);
      const apiResponse = response.data;
      
      if (!apiResponse) {
        throw new Error('Invalid API response: missing response');
      }
      
      if (apiResponse.data) {
        if (!Array.isArray(apiResponse.data.items)) {
          apiResponse.data.items = [];
        }
      }
      
      return apiResponse;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Get distinct document types available for the student
   * @returns Promise with document types response
   */
  getDocumentTypes: async (): Promise<GetDocumentTypesResponse> => {
    try {
      const response = await api.get<GetDocumentTypesResponse>('/v1/materials/student/document-types');
      return response.data;
    } catch (err) {
      throw err;
    }
  },
};
