import { api } from "@/lib/api/client";
import { 
  GetMaterialsResponse, 
  GetDocumentTypesResponse, 
  GetMaterialsParams,
  GetSemestersResponse,
  GetSubjectsResponse
} from "../types/types";

export const documentsApi = {
  /**
   * Get materials/documents for current user with optional filters
   * @param params - Search and filter parameters
   * @returns Promise with materials response
   */
  getMaterials: async (params?: GetMaterialsParams): Promise<GetMaterialsResponse> => {
    try {
      console.log("[documentsApi] 🔍 Fetching materials with params:", params);
      
      const queryParams = new URLSearchParams();
      if (params?.searchTerm && params.searchTerm.trim()) {
        queryParams.append('searchTerm', params.searchTerm.trim());
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
        queryParams.append('pageNumber', params.pageNumber.toString());
      }
      if (params?.pageSize && params.pageSize > 0) {
        queryParams.append('pageSize', params.pageSize.toString());
      }
      
      const url = `/v1/materials/GetMaterials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log("[documentsApi] 🌐 Calling URL:", url);
      
      const response = await api.get<GetMaterialsResponse>(url);
      
      console.log("[documentsApi] ✅ Raw axios response:", response);
      console.log("[documentsApi] ✅ Response.data (API body):", response.data);
      
      // API returns: { success, message, data: { total, data: [] } }
      // axios wraps it in response.data
      const apiResponse = response.data;
      
      console.log("[documentsApi] ✅ API response:", apiResponse);
      console.log("[documentsApi] ✅ API response.data:", apiResponse?.data);
      console.log("[documentsApi] ✅ API response.data.data:", apiResponse?.data?.data);
      
      // Ensure response has expected structure
      if (!apiResponse) {
        console.error("[documentsApi] ❌ Invalid API response: missing response");
        throw new Error('Invalid API response: missing response');
      }
      
      // Ensure data exists and data.data is always an array
      if (apiResponse.data) {
        if (!Array.isArray(apiResponse.data.data)) {
          console.warn("[documentsApi] ⚠️ data.data is not an array, setting to empty array");
          apiResponse.data.data = [];
        }
      }
      
      console.log("[documentsApi] ✅ Final response to return:", apiResponse);
      return apiResponse;
    } catch (err) {
      console.error("[documentsApi] ❌ Error fetching materials:", err);
      throw err;
    }
  },

  /**
   * Get distinct document types available for the student
   * @returns Promise with document types response
   */
  getDocumentTypes: async (): Promise<GetDocumentTypesResponse> => {
    try {
      console.log("[documentsApi] 🔍 Fetching document types...");
      const response = await api.get<GetDocumentTypesResponse>('/v1/materials/student/document-types');
      console.log("[documentsApi] ✅ Document types response:", response.data);
      return response.data;
    } catch (err) {
      console.error("[documentsApi] ❌ Error fetching document types:", err);
      throw err;
    }
  },

  /**
   * Get all semesters
   * @returns Promise with semesters response
   */
  getSemesters: async (): Promise<GetSemestersResponse> => {
    try {
      console.log("[documentsApi] 🔍 Fetching semesters...");
      const response = await api.get<GetSemestersResponse>('/v1/common/semesters');
      console.log("[documentsApi] ✅ Semesters response:", response.data);
      return response.data;
    } catch (err) {
      console.error("[documentsApi] ❌ Error fetching semesters:", err);
      throw err;
    }
  },

  /**
   * Get all subjects
   * @returns Promise with subjects response
   */
  getSubjects: async (): Promise<GetSubjectsResponse> => {
    try {
      console.log("[documentsApi] 🔍 Fetching subjects...");
      const response = await api.get<GetSubjectsResponse>('/v1/common/subjects');
      console.log("[documentsApi] ✅ Subjects response:", response.data);
      return response.data;
    } catch (err) {
      console.error("[documentsApi] ❌ Error fetching subjects:", err);
      throw err;
    }
  },
};
