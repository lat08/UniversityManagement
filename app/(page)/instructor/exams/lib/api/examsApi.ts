import { api } from "@/lib/api/client";
import {
  GetExamEntriesResponse,
  GetExamEntryDetailResponse,
  UploadExamRequest,
  UploadExamResponse,
  UpdateExamRequest,
  UpdateExamResponse,
  GetExamEntriesParams,
} from "../types";
import { EXAMS_API } from "../constants";

export const examsApi = {
  /**
   * Get list of exam entries with optional filters
   * @param params - Search and filter parameters
   * @returns Promise with exam entries response
   */
  getExamEntries: async (params?: GetExamEntriesParams): Promise<GetExamEntriesResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.searchTerm && params.searchTerm.trim()) {
        queryParams.append('searchTerm', params.searchTerm.trim());
      }
      if (params?.examType && params.examType.trim()) {
        queryParams.append('examType', params.examType.trim());
      }
      if (params?.entryStatus && params.entryStatus.trim()) {
        queryParams.append('entryStatus', params.entryStatus.trim());
      }
      if (params?.semesterId && params.semesterId.trim()) {
        queryParams.append('semesterId', params.semesterId.trim());
      }
      if (params?.subjectId && params.subjectId.trim()) {
        queryParams.append('subjectId', params.subjectId.trim());
      }

      const queryString = queryParams.toString();
      const url = `${EXAMS_API.GET_EXAM_ENTRIES}${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get<GetExamEntriesResponse>(url);
      return response.data;
    } catch (err) {
      console.error("[examsApi] ❌ Error fetching exam entries:", err);
      throw err;
    }
  },

  /**
   * Get exam entry detail by ID
   * @param examEntryId - Exam entry ID
   * @returns Promise with exam entry detail response
   */
  getExamEntryDetail: async (examEntryId: string): Promise<GetExamEntryDetailResponse> => {
    try {
      const response = await api.get<GetExamEntryDetailResponse>(
        EXAMS_API.GET_EXAM_ENTRY_DETAIL(examEntryId)
      );
      return response.data;
    } catch (err) {
      console.error("[examsApi] ❌ Error fetching exam entry detail:", err);
      throw err;
    }
  },

  /**
   * Upload new exam entry
   * @param data - Exam entry data with files
   * @returns Promise with upload response
   */
  uploadExamEntry: async (data: UploadExamRequest): Promise<UploadExamResponse> => {
    try {
      const formData = new FormData();
      formData.append('CourseClassId', data.courseClassId);
      formData.append('ExamType', data.examType);
      formData.append('DurationMinutes', data.durationMinutes.toString());
      formData.append('Description', data.description);
      formData.append('QuestionFile', data.questionFile);
      formData.append('AnswerFile', data.answerFile);

      const response = await api.post<UploadExamResponse>(
        EXAMS_API.UPLOAD_EXAM_ENTRY,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("[examsApi] ❌ Error uploading exam entry:", err);
      throw err;
    }
  },

  /**
   * Update exam entry
   * @param examEntryId - Exam entry ID
   * @param data - Updated exam entry data
   * @returns Promise with update response
   */
  updateExamEntry: async (
    examEntryId: string,
    data: UpdateExamRequest
  ): Promise<UpdateExamResponse> => {
    try {
      const formData = new FormData();
      
      if (data.durationMinutes !== undefined) {
        formData.append('DurationMinutes', data.durationMinutes.toString());
      }
      if (data.description !== undefined) {
        formData.append('Description', data.description);
      }
      if (data.questionFile) {
        formData.append('QuestionFile', data.questionFile);
      }
      if (data.answerFile) {
        formData.append('AnswerFile', data.answerFile);
      }

      const response = await api.put<UpdateExamResponse>(
        EXAMS_API.UPDATE_EXAM_ENTRY(examEntryId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("[examsApi] ❌ Error updating exam entry:", err);
      throw err;
    }
  },

  /**
   * Download exam file (question or answer)
   * @param examEntryId - Exam entry ID
   * @param fileType - 'question' or 'answer'
   * @returns Promise with blob response
   */
  downloadExamFile: async (
    examEntryId: string,
    fileType: 'question' | 'answer'
  ): Promise<Blob> => {
    try {
      const response = await api.get<Blob>(
        EXAMS_API.DOWNLOAD_EXAM_FILE(examEntryId, fileType),
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (err) {
      console.error("[examsApi] ❌ Error downloading exam file:", err);
      throw err;
    }
  },
};

