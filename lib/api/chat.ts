import { api } from './client';
import { GradeInfoData, ScheduleResponse } from '@/lib/types/chat';

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface RagContext {
  documentId: string;
  title: string;
  content: string;
  relevance: number;
  documentType: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
  context: RagContext[];
  responseType?: 'text' | 'grade_info' | 'schedule' | 'course_list' | 'course_materials';
  structuredData?: GradeInfoData | ScheduleResponse['data'] | Record<string, unknown>;
}

export interface ChatMessage {
  messageId: string;
  userId: string;
  role: 'user' | 'assistant';
  message: string;
  sessionId: string;
  createdAt: string;
}

export interface ChatHistory {
  sessionId: string;
  messages: ChatMessage[];
  lastActivity: string;
}

export const chatApi = {
  sendMessage: async (request: SendMessageRequest): Promise<SendMessageResponse> => {
    try {
      const { data } = await api.post<SendMessageResponse>('/v1/chat/message', request);
      return data;
    } catch (error) {
      throw error;
    }
  },

  getHistory: async (sessionId: string, limit = 20): Promise<ChatHistory> => {
    const { data } = await api.get<ChatHistory>(`/v1/chat/history/${sessionId}`, {
      params: { limit },
    });
    return data;
  },

  createSession: async (): Promise<{ sessionId: string }> => {
    const { data } = await api.post<{ sessionId: string }>('/v1/chat/session');
    return data;
  },
};
