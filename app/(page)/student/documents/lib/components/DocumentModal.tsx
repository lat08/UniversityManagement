'use client';

import { X, Download, Eye, ChevronDown, HardDrive, FileText, Book, User, BookText } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { CourseGroup, DocumentItem } from '../types/types';
import { formatFileSize, formatDate } from '../utils/documentUtils';
import { useState } from 'react';

interface DocumentModalProps {
  courseGroup: CourseGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentModal = ({ courseGroup, isOpen, onClose }: DocumentModalProps) => {
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  
  if (!courseGroup || !isOpen) return null;

  const handleDownload = (doc: DocumentItem) => {
    window.open(doc.downloadUrl, '_blank');
  };

  const handleViewOnline = (doc: DocumentItem) => {
    window.open(doc.previewUrl, '_blank');
  };



  const toggleDocExpand = (docId: string) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-500 text-white px-6 py-4 rounded-t-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{courseGroup.courseName}</h2>
            </div>
            <button onClick={onClose} className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* I. General Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">I. Thông tin chung</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-800 rounded-sm">
                  <Book className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"/>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Môn học</p>
                  <p className="font-medium text-gray-900">{courseGroup.courseName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-800 rounded-sm">
                  <User className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"/>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Người tải lên</p>
                  <p className="font-medium text-gray-900">{courseGroup.uploadedByName}</p>
                </div>
              </div>

              
            </div>
          </div>

          {/* II. Related Documents */}
          {courseGroup.documents && courseGroup.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">II. Bài giảng chi tiết</h3>
              <div className="space-y-3">
                {courseGroup.documents.map((doc) => {
                  const isExpanded = expandedDocId === doc.documentId;
                  return (
                    <div key={doc.documentId} className="border border-black-900 bg-gray-50 rounded-sm overflow-hidden">
                      {/* Document Header - Always visible */}
                      <div 
                        onClick={() => toggleDocExpand(doc.documentId)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookText className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"/>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.fileTitle}</h4>
                            
                              <p className="text-sm text-gray-500">
                                {formatDate(doc.created)}
                              </p>
                            
                          </div>
                        </div>
                        <div className="flex items-center">
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                          />
                        </div>
                      </div>
                      
                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1">
                          <div className="flex justify-between items-start space-y-2 mb-3">

                            <div className="flex flex-col items-start gap-2">
                              {doc.description && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                  <p>{doc.description}</p>
                                </div>
                              )}
                              <div className="flex items-center text-sm text-gray-500">
                                <HardDrive className="w-4 h-4 mr-2 text-gray-400" />
                                <p>{formatFileSize(doc.fileSize)}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Button onClick={() => handleViewOnline(doc)} variant="outline" size="sm" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                                <Eye className="w-4 h-4 mr-1" /> Xem
                              </Button>
                              <Button onClick={() => handleDownload(doc)} size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <Download className="w-4 h-4 mr-1" /> Tải
                              </Button>
                            </div>

                          </div>
                          
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


