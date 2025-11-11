"use client"

import { FileText, Edit, Download, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { DOCUMENT_TYPE_COLORS, DOCUMENT_TYPE_LABELS } from "../lib/constants";

export interface Document {
  id: string;
  title: string;
  subject: string;
  date: string;
  type: "slide" | "document" | "exercise";
  classCode: string;
  // Additional fields from API
  courseClassId?: string;
  documentType?: string;
  description?: string;
  downloadUrl?: string;
  previewUrl?: string;
}

interface DocumentCardProps {
  document: Document;
  onEdit?: (id: string) => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  animationDelay?: number;
  onClick?: () => void;
}

export function DocumentCard({
  document,
  onEdit,
  onDownload,
  onDelete,
  animationDelay = 0,
  onClick,
}: DocumentCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onClick?.();
  };

  const documentType = document.documentType || '';
  const tagColor = DOCUMENT_TYPE_COLORS[documentType] || 'bg-gray-500 text-white';
  const tagLabel = DOCUMENT_TYPE_LABELS[documentType] || documentType || 'Tài liệu';

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center justify-between transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01] cursor-pointer animate-fade-up"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both'
      }}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">
              {document.title}
            </h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${tagColor}`}
            >
              {tagLabel}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {document.subject} - {document.date}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(document.id)}
            className="h-8 w-8"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownload?.(document.id)}
            className="h-8 w-8"
            title="Tải xuống"
          >
            <Download className="w-4 h-4 text-gray-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(document.id)}
            className="h-8 w-8"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
      </div>
    </div>
  );
}

