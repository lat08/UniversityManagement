import { api } from '@/lib/api/client';
import { ExamScheduleResponse, NotesResponse, CreateNoteRequest, UpdateNoteRequest, NoteResponse, DeleteNoteResponse } from '../types/types';

export async function getExamSchedule(semesterId: string): Promise<ExamScheduleResponse[]> {
  const response = await api.get(`/v1/exam-schedules`, {
    params: { SemesterId: semesterId },
  });
  if (response.data.success) {
    return response.data.data;
  }
  return [];
}

export async function getNotes(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
}): Promise<NotesResponse> {
  const response = await api.get('/v1/notes', { params });
  return response.data;
}

export async function createNote(data: CreateNoteRequest): Promise<NoteResponse> {
  const response = await api.post('/v1/notes', data);
  return response.data;
}

export async function updateNote(noteId: string, data: UpdateNoteRequest): Promise<NoteResponse> {
  const response = await api.put(`/v1/notes/${noteId}`, data);
  return response.data;
}

export async function deleteNote(noteId: string): Promise<DeleteNoteResponse> {
  const response = await api.delete(`/v1/notes/${noteId}`);
  return response.data;
}

