'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { useAuthStore } from '@/lib/store/authStore';
import Image from 'next/image';
import { ChatResponse } from '@/lib/types/chat';
import { GradeInfoCard } from './responses/GradeInfoCard';
import { ScheduleTable } from './responses/ScheduleTable';
import { ExamScheduleCard } from './responses/ExamScheduleCard';
import { DocumentsList } from './responses/DocumentCard';
import { CourseMaterialsList } from './responses/CourseMaterialsCard';
import { MarkdownText } from './MarkdownText';
import { RagContext } from '@/lib/api/chat';

interface Message {
  role: 'user' | 'assistant';
  message: string;
  createdAt: Date;
  parsedData?: ChatResponse;
  context?: RagContext[];
}

export default function ChatBubble() {
  const { user } = useAuthStore();
  const isInstructor = user?.role === 'Instructor';
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Quick suggestions based on role
  const suggestions = isInstructor ? [
    { icon: '📊', text: 'Cho tôi xem tổng quan' },
    { icon: '📅', text: 'Lịch dạy hôm nay' },
    { icon: '📚', text: 'Tôi đang dạy lớp nào?' },
    { icon: '📝', text: 'Trạng thái nhập điểm' }
  ] : [
    { icon: '📊', text: 'Điểm của tôi thế nào?' },
    { icon: '📅', text: 'Lịch học tuần này' },
    { icon: '📚', text: 'Hướng dẫn đăng ký môn học' }
  ];

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMsg: Message = {
      role: 'user',
      message: message,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage({ 
        message: userMsg.message, 
        sessionId: sessionId || undefined 
      });
      
      if (response) {
        // Save session ID
        if (!sessionId) setSessionId(response.sessionId);

        // Use backend structured data (no parsing needed)
        const parsedData: ChatResponse = response.responseType && response.structuredData
          ? {
              type: response.responseType as ChatResponse['type'],
              text: response.reply,
              data: response.structuredData
            } as ChatResponse
          : {
              type: 'text',
              text: response.reply
            };

        // Add AI response
        const aiMsg: Message = {
          role: 'assistant',
          message: response.reply,
          createdAt: new Date(),
          parsedData,
          context: response.context
        };
        setMessages(prev => [...prev, aiMsg]);
        
        // Play notification sound
        audioRef.current?.play().catch(() => {});
      }
    } catch {
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        message: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        createdAt: new Date(),
        parsedData: {
          type: 'text',
          text: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto greeting when opening chat for the first time
  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      setIsLoading(true);
      
      // Simulate typing delay
      const timer = setTimeout(() => {
        const greetingMsg: Message = {
          role: 'assistant',
          message: `Xin chào${user?.name ? ' ' + user.name : ''}! 👋\n\nTôi là SIU Chatbot, trợ lý ảo của bạn. Tôi có thể giúp gì cho bạn hôm nay?`,
          createdAt: new Date(),
          parsedData: {
            type: 'text',
            text: `Xin chào${user?.name ? ' ' + user.name : ''}! 👋\n\nTôi là SIU Chatbot, trợ lý ảo của bạn. Tôi có thể giúp gì cho bạn hôm nay?`
          }
        };
        setMessages([greetingMsg]);
        setIsLoading(false);
        setHasGreeted(true);
      }, 1000); // 1s typing delay

      return () => clearTimeout(timer);
    }
  }, [isOpen, hasGreeted, messages.length, user?.name]);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden"
          style={{
            animation: 'slideInFromBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors duration-300 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 shadow-md">
                <Image 
                  src="/logo-siu.webp" 
                  alt="SIU Logo" 
                  width={32} 
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-semibold">SIU Chatbot</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:scale-110 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Đang kết nối...
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}
              >
                {msg.role === 'user' ? (
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-2 bg-[var(--primary)] text-white shadow-md"
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ) : (
                  <div className="max-w-[85%] w-full space-y-3">
                    {/* Always show text response first */}
                    {msg.message && (
                      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl px-4 py-3">
                        <MarkdownText 
                          text={msg.message}
                          className="text-sm whitespace-pre-wrap"
                        />
                        <span className="text-xs opacity-70 mt-2 block">
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                    
                    {/* Render structured components as supplementary info */}
                    {msg.parsedData?.type === 'grade_info' && msg.parsedData.data && (
                      <GradeInfoCard data={msg.parsedData.data} />
                    )}
                    {msg.parsedData?.type === 'schedule' && msg.parsedData.data && (
                      <ScheduleTable data={msg.parsedData.data} />
                    )}
                    {msg.parsedData?.type === 'exam_schedule' && msg.parsedData.data && (
                      <ExamScheduleCard data={msg.parsedData.data} />
                    )}
                    {msg.parsedData?.type === 'course_materials' && msg.parsedData.data && (
                      <CourseMaterialsList materials={msg.parsedData.data} />
                    )}
                    
                    {/* Render documents/references if available */}
                    {msg.context && msg.context.length > 0 && (
                      <DocumentsList documents={msg.context} />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Show suggestions only after greeting */}
            {messages.length === 1 && messages[0].role === 'assistant' && !isLoading && (
              <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessage(suggestion.text)}
                    className="block w-full text-left px-4 py-2.5 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-[var(--primary)] hover:text-white dark:hover:bg-[var(--primary)] transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-[var(--primary)] hover:shadow-md"
                  >
                    {suggestion.icon} {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Invisible div for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Enter để gửi, Shift + Enter để xuống dòng
            </p>
          </div>
        </div>
      )}

      {/* Bubble Button */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-0 z-50"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center group cursor-pointer"
          style={{
            transform: isHovered || isOpen ? 'translateX(-1.5rem) scale(1.05)' : 'translateX(2.5rem)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease-in-out, box-shadow 0.3s ease'
          }}
        >
          {isOpen ? (
            <X className="w-7 h-7 transition-transform duration-200" />
          ) : (
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 shadow-lg">
                <Image 
                  src="/logo-siu.webp" 
                  alt="SIU Chatbot" 
                  width={32} 
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Active Badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
            </div>
          )}
        </button>
      </div>
    </>
  );
}
