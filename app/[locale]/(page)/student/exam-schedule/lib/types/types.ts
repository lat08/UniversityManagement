export interface ExamScheduleResponse {
  subjectNameCode: string;
  examDate: string;
  examTimeDuration: string;
  roomCode: string;
  studentCount: number;
  examFormat: string;
  status: 'Đã thi' | 'Chưa tới' | 'Sắp tới';
}

export interface Exam {
  id: string;
  subjectNameCode: string;
  examDate: string;
  examTimeDuration: string;
  roomCode: string;
  studentCount: number;
  examFormat: string;
  status: 'Đã thi' | 'Chưa tới' | 'Sắp tới';
}

export type ExamStatusVariant = 'completed' | 'upcoming' | 'pending' | 'other';

export interface ExamStatCard {
  title: string;
  value: number | string;
  subtitle?: string;
  bgColor: string;
  iconColor: string;
  textColor: string;
  progress?: number;
  variant?: 'total' | 'upcoming' | 'completed';
  subtitleTone?: 'default' | 'muted' | 'alert';
}

export interface Note {
  noteId: string;
  studentId: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface NotesResponse {
  success: boolean;
  message: string;
  data: {
    notes: Note[];
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    sortOrder: string;
  };
  errors?: string[];
}

export interface CreateNoteRequest {
  content: string;
}

export interface UpdateNoteRequest {
  content: string;
}

export interface NoteResponse {
  success: boolean;
  message: string;
  data: Note;
  errors?: string[];
}

export interface DeleteNoteResponse {
  success: boolean;
  message: string;
  data: {
    noteId: string;
    isDeleted: boolean;
    deletedAt: string;
  };
  errors?: string[];
}

