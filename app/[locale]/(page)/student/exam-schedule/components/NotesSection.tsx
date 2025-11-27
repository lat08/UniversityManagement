"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Note, CreateNoteRequest } from "../lib/types/types";

interface NotesSectionProps {
  notes: Note[];
  onCreateNote: (data: CreateNoteRequest) => Promise<unknown>;
  onUpdateNote: (params: { noteId: string; content: string }) => Promise<unknown>;
  onDeleteNote: (noteId: string) => Promise<unknown>;
  loading?: boolean;
  isBusy?: boolean;
}

export default function NotesSection({ 
  notes, 
  onCreateNote, 
  onUpdateNote, 
  onDeleteNote, 
  loading = false,
  isBusy = false,
}: NotesSectionProps) {
  const t = useTranslations('student.examSchedule.sections.notes');
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      await onCreateNote({ content: newNoteContent.trim() });
      setNewNoteContent("");
      setIsCreating(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.noteId);
    setEditingContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;

    try {
      await onUpdateNote({ noteId, content: editingContent.trim() });
      setEditingNoteId(null);
      setEditingContent("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await onDeleteNote(noteId);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="bg-[#DBEDFF] rounded-lg p-4 lg:p-6 h-full max-h-[600px] flex flex-col border-2 border-[#4196F0]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base lg:text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t('title')}
        </h3>
        {!loading && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            disabled={isBusy}
            title={t('createTooltip')}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#4196F0] text-white text-sm rounded-md hover:bg-[#3182ce] hover:shadow-md transition-all disabled:opacity-50 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('create')}
          </button>
        )}
      </div>

      {isCreating && !loading && (
        <div className="mb-3 p-3 bg-white rounded-lg border-2 border-[#4196F0]">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4196F0] resize-none"
            rows={3}
            autoFocus
            disabled={isBusy}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateNote}
              disabled={isBusy || !newNoteContent.trim()}
              title={t('saveTooltip')}
              className="px-3 py-1.5 bg-[#4196F0] text-white text-sm rounded-md hover:bg-[#3182ce] hover:shadow-md transition-all disabled:opacity-50 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              {t('save')}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewNoteContent("");
              }}
              disabled={isBusy}
              title={t('cancelTooltip')}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 hover:shadow-md transition-all disabled:opacity-50 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 lg:space-y-3 flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg border border-blue-200 bg-white p-3"
            >
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-4 flex gap-2">
                <div className="h-8 w-16 rounded bg-gray-200" />
                <div className="h-8 w-16 rounded bg-gray-200" />
              </div>
            </div>
          ))
        ) : notes.length > 0 ? (
          notes.map((note, index) => (
            <div
              key={note.noteId}
              className="p-3 bg-white rounded-lg border border-blue-200 transition-all animate-fade-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              {editingNoteId === note.noteId ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4196F0] resize-none"
                    rows={3}
                    disabled={isBusy}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateNote(note.noteId)}
                      disabled={isBusy || !editingContent.trim()}
                      title={t('updateTooltip')}
                      className="px-3 py-1.5 bg-[#4196F0] text-white text-sm rounded-md hover:bg-[#3182ce] hover:shadow-md transition-all disabled:opacity-50 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
                    >
                      {t('save')}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isBusy}
                      title={t('cancelTooltip')}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 hover:shadow-md transition-all disabled:opacity-50 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-xs lg:text-sm text-gray-900 whitespace-pre-wrap break-words">
                    {note.content}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleStartEdit(note)}
                      disabled={isBusy}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      title={t('editTooltip')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.noteId)}
                      disabled={isBusy}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      title={t('deleteTooltip')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="text-gray-500 text-sm">{t('empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

