'use client';

import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface DocumentCardProps {
  document: {
    documentId: string;
    title: string;
    content: string;
    relevance: number;
    documentType: string;
  };
}

export function DocumentCard({ document }: DocumentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxPreviewLength = 200;

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (relevance >= 0.6) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-blue-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const getRelevanceLabel = (relevance: number) => {
    if (relevance >= 0.8) return 'Rất liên quan';
    if (relevance >= 0.6) return 'Liên quan';
    return 'Có liên quan';
  };

  const shouldTruncate = document.content.length > maxPreviewLength;
  const displayContent = isExpanded || !shouldTruncate 
    ? document.content 
    : document.content.substring(0, maxPreviewLength) + '...';

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5 p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                {document.title}
              </h4>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRelevanceColor(document.relevance)}`}>
                  {getRelevanceLabel(document.relevance)} ({Math.round(document.relevance * 100)}%)
                </span>
                {document.documentType && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                    {document.documentType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {displayContent}
        </div>
        
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Xem thêm
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface DocumentsListProps {
  documents: Array<{
    documentId: string;
    title: string;
    content: string;
    relevance: number;
    documentType: string;
  }>;
}

export function DocumentsList({ documents }: DocumentsListProps) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Tài liệu tham khảo ({documents.length})
        </h3>
      </div>
      {documents.map((doc) => (
        <DocumentCard key={doc.documentId} document={doc} />
      ))}
    </div>
  );
}

