import { api } from '@/lib/api/client';
import { ExamScheduleResponse, NotesResponse, CreateNoteRequest, UpdateNoteRequest, NoteResponse, DeleteNoteResponse } from '../types/types';

export const examScheduleApi = {
  getSchedule: async (semesterId: string): Promise<ExamScheduleResponse[]> => {
    const response = await api.get(`/v1/exam-schedules`, {
      params: { SemesterId: semesterId },
    });
    return response.data.success ? response.data.data : [];
  },

  getNotes: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortOrder?: 'asc' | 'desc';
  }): Promise<NotesResponse> => {
    const response = await api.get('/v1/notes', { params });
    return response.data;
  },

  createNote: async (data: CreateNoteRequest): Promise<NoteResponse> => {
    const response = await api.post('/v1/notes', data);
    return response.data;
  },

  updateNote: async (noteId: string, data: UpdateNoteRequest): Promise<NoteResponse> => {
    const response = await api.put(`/v1/notes/${noteId}`, data);
    return response.data;
  },

  deleteNote: async (noteId: string): Promise<DeleteNoteResponse> => {
    const response = await api.delete(`/v1/notes/${noteId}`);
    return response.data;
  },
};

