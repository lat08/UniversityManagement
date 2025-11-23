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
    const queryParams = new URLSearchParams();
    
    if (params?.semesterId?.trim()) {
      queryParams.append('SemesterId', params.semesterId.trim());
    }
    if (params?.subjectId?.trim()) {
      queryParams.append('SubjectId', params.subjectId.trim());
    }
    if (params?.status?.trim()) {
      queryParams.append('Status', params.status.trim());
    }
    if (params?.examType?.trim()) {
      queryParams.append('ExamType', params.examType.trim());
    }
    if (params?.searchKeyword?.trim()) {
      queryParams.append('SearchKeyword', params.searchKeyword.trim());
    }
    if (params?.pageNumber !== undefined) {
      queryParams.append('PageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize !== undefined) {
      queryParams.append('PageSize', params.pageSize.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${EXAMS_API.GET_EXAM_ENTRIES}?${queryString}` : EXAMS_API.GET_EXAM_ENTRIES;
    
    const response = await api.get<GetExamEntriesResponse>(url);
    return response.data;
  },

  getExamEntryDetail: async (examEntryId: string): Promise<GetExamEntryDetailResponse> => {
    const response = await api.get<GetExamEntryDetailResponse>(
      EXAMS_API.GET_EXAM_ENTRY_DETAIL(examEntryId)
    );
    return response.data;
  },

  uploadExamEntry: async (data: UploadExamRequest): Promise<UploadExamResponse> => {
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
  },

  updateExamEntry: async (
    examEntryId: string,
    data: UpdateExamRequest
  ): Promise<UpdateExamResponse> => {
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
  },

};

