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
  getExamEntries: async (params?: GetExamEntriesParams): Promise<GetExamEntriesResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.semesterId && params.semesterId.trim()) {
        queryParams.append('SemesterId', params.semesterId.trim());
      }
      if (params?.subjectId && params.subjectId.trim()) {
        queryParams.append('SubjectId', params.subjectId.trim());
      }
      if (params?.status && params.status.trim()) {
        queryParams.append('Status', params.status.trim());
      }
      if (params?.examType && params.examType.trim()) {
        queryParams.append('ExamType', params.examType.trim());
      }
      if (params?.searchKeyword && params.searchKeyword.trim()) {
        queryParams.append('SearchKeyword', params.searchKeyword.trim());
      }
      if (params?.pageNumber !== undefined) {
        queryParams.append('PageNumber', params.pageNumber.toString());
      }
      if (params?.pageSize !== undefined) {
        queryParams.append('PageSize', params.pageSize.toString());
      }

      const queryString = queryParams.toString();
      const url = `${EXAMS_API.GET_EXAM_ENTRIES}${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get<GetExamEntriesResponse>(url);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  getExamEntryDetail: async (examEntryId: string): Promise<GetExamEntryDetailResponse> => {
    try {
      const response = await api.get<GetExamEntryDetailResponse>(
        EXAMS_API.GET_EXAM_ENTRY_DETAIL(examEntryId)
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

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
      throw err;
    }
  },

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
      throw err;
    }
  },

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
      throw err;
    }
  },
};

