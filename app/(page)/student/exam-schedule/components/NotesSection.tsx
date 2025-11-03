"use client";

import { Note } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";

interface NotesSectionProps {
  notes: Note[];
  onToggleNote?: (id: string) => void;
}

export default function NotesSection({ notes, onToggleNote }: NotesSectionProps) {
  const handleToggleNote = (id: string) => {
    if (onToggleNote) {
      onToggleNote(id);
    }
  };

  return (
    <div className="bg-[#DBEDFF] rounded-lg p-4 lg:p-6 h-full min-h-[400px] flex flex-col border-2 border-[#4196F0]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base lg:text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ghi chú
        </h3>
      </div>

      <div className="space-y-2 lg:space-y-3 flex-1 overflow-y-auto">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "flex items-center gap-3 p-3 bg-white rounded-lg border transition-all",
                note.completed ? "border-green-200 bg-green-50/50" : "border-blue-200"
              )}
            >
              <button
                onClick={() => handleToggleNote(note.id)}
                className="flex items-center justify-center w-4 h-4 flex-shrink-0"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  note.completed ? "bg-green-500" : "bg-gray-400"
                )} />
              </button>
              <span className={cn(
                "flex-1 text-xs lg:text-sm",
                note.completed ? "line-through text-gray-500" : "text-gray-900"
              )}>
                {note.content}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="text-gray-500 text-sm">Chưa có ghi chú nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

