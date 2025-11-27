'use client';

import { useState, useCallback, memo } from 'react';
import { X, Download, Eye, ChevronDown, HardDrive, FileText, Book, User, BookText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import type { CourseGroup, DocumentItem } from '../lib/types/types';
import { formatFileSize, formatDate } from '../lib/utils/documentUtils';

interface DocumentModalProps {
  courseGroup: CourseGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentModalComponent = ({ courseGroup, isOpen, onClose }: DocumentModalProps) => {
  const t = useTranslations('student.documents.modal');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  
  const handleDownload = useCallback((doc: DocumentItem) => {
    window.open(doc.downloadUrl, '_blank');
  }, []);

  const handleViewOnline = useCallback((doc: DocumentItem) => {
    window.open(doc.previewUrl, '_blank');
  }, []);

  const toggleDocExpand = useCallback((docId: string) => {
    setExpandedDocId((prev) => (prev === docId ? null : docId));
  }, []);

  if (!courseGroup || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-500 text-white px-6 py-4 rounded-t-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{courseGroup.courseName}</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
              aria-label={t('close')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('generalInfoTitle')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-800 rounded-sm">
                  <Book className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"/>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('courseLabel')}</p>
                  <p className="font-medium text-gray-900">{courseGroup.courseName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-800 rounded-sm">
                  <User className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"/>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{t('uploaderLabel')}</p>
                  <p className="font-medium text-gray-900">{courseGroup.uploadedByName}</p>
                </div>
              </div>
            </div>
          </div>

          {courseGroup.documents && courseGroup.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('documentsTitle')}</h3>
              <div className="space-y-3">
                {courseGroup.documents.map((doc) => {
                  const isExpanded = expandedDocId === doc.documentId;
                  return (
                    <div key={doc.documentId} className="border border-gray-900 bg-gray-50 rounded-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleDocExpand(doc.documentId)}
                        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookText className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"/>
                          </div>
                          <div className="text-left">
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
                      </button>
                      
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
                                <p>
                                  {t('fileSizeLabel', { size: formatFileSize(doc.fileSize) })}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Button 
                                onClick={() => handleViewOnline(doc)} 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4 mr-1" /> {t('viewOnline')}
                              </Button>
                              <Button 
                                onClick={() => handleDownload(doc)} 
                                size="sm" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Download className="w-4 h-4 mr-1" /> {t('download')}
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

export const DocumentModal = memo(DocumentModalComponent);

