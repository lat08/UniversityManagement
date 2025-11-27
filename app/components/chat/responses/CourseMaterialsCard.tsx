'use client';

import { BookOpen, Download, ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { downloadFile } from '@/lib/utils/fileDownload';

interface Document {
  documentId: string;
  fileTitle: string;
  fileType: string;
  fileSize: number;
  fileSizeMb?: string;
  description: string;
  documentType: string;
  filePath: string;
  previewUrl: string;
  downloadUrl: string;
  created: string;
}

interface CourseMaterial {
  courseClassId: string;
  courseName: string;
  uploadedById: string;
  uploadedByName: string;
  documents: Document[];
}

interface CourseMaterialCardProps {
  material: CourseMaterial;
  isExpanded: boolean;
  onToggle: () => void;
  animationDelay?: number;
}

const getDocumentTypeIcon = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('slide') || typeLower.includes('presentation')) {
    return '📊';
  }
  if (typeLower.includes('lab') || typeLower.includes('thí nghiệm')) {
    return '🔬';
  }
  if (typeLower.includes('bài tập') || typeLower.includes('exercise')) {
    return '📝';
  }
  return '📄';
};

const getDocumentTypeColor = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('slide')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  if (typeLower.includes('lab')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (typeLower.includes('bài tập')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
};

export function CourseMaterialCard({ material, isExpanded, onToggle, animationDelay = 0 }: CourseMaterialCardProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden animate-fade-up transition-all duration-300 ease-out hover:shadow-md"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both'
      }}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center gap-4 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      >
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{material.courseName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {material.documents.length} tài liệu
            {material.uploadedByName && ` • Upload bởi: ${material.uploadedByName}`}
          </p>
        </div>

        <ChevronDown 
          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-3">
          {material.documents.map((doc) => (
            <div 
              key={doc.documentId}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl mt-0.5">
                  {getDocumentTypeIcon(doc.documentType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {doc.fileTitle}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(doc.documentType)}`}>
                      {doc.documentType}
                    </span>
                    {doc.fileSizeMb && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.fileSizeMb} MB
                      </span>
                    )}
                  </div>
                  
                  {doc.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {doc.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {doc.downloadUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(doc.downloadUrl, doc.fileTitle);
                        }}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Tải xuống
                      </button>
                    )}
                    
                    {doc.previewUrl && (
                      <a
                        href={doc.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Xem trực tuyến
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CourseMaterialsListProps {
  materials: CourseMaterial[];
}

export function CourseMaterialsList({ materials }: CourseMaterialsListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (!materials || materials.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Tài liệu học tập ({materials.length} môn)
        </h3>
      </div>
      {materials.map((material, index) => (
        <CourseMaterialCard
          key={material.courseClassId}
          material={material}
          isExpanded={expandedIds.has(material.courseClassId)}
          onToggle={() => toggleExpand(material.courseClassId)}
          animationDelay={index * 50}
        />
      ))}
    </div>
  );
}

