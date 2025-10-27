'use client';

import { useState } from 'react';
import { Download, Eye, ChevronDown, FileText, AlertTriangle, BookOpen } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useDocuments } from './lib/hooks/useDocuments';
import { formatFileSize } from './lib/utils/documentUtils';
import { DocumentModal } from './lib/components/DocumentModal';
import type { DocumentItem, CourseGroup } from './lib/types/types';

interface DocumentFileProps {
  document: DocumentItem;
  onView: (doc: DocumentItem, uploadedByName: string) => void;
  uploadedByName: string;
}

const DocumentFile = ({ document, onView, uploadedByName }: DocumentFileProps) => {
  const handleDownload = () => {
    window.open(document.downloadUrl, '_blank');
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1">{document.fileTitle}</h4>
            <p className="text-sm text-gray-600 mb-2">{document.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Dung lượng: {formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span>Định dạng: {document.fileType.toUpperCase()}</span>
              <span>•</span>
              <span>Upload bởi: {uploadedByName}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tạo lúc: {new Date(document.created).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={() => onView(document, uploadedByName)}
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4 mr-1" />
            Xem
          </Button>
          <Button
            onClick={handleDownload}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-1" />
            Tải
          </Button>
        </div>
      </div>
    </div>
  );
};


interface CourseCardProps {
  courseGroup: CourseGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onView: (doc: DocumentItem, uploadedByName: string) => void;
}

const CourseCard = ({ courseGroup, isExpanded, onToggle, onView }: CourseCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Course Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-blue-50 transition-colors cursor-pointer"
      >
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900 mb-1">{courseGroup.courseName}</h3>
          <p className="text-sm text-gray-500">
            {courseGroup.documents.length} tài liệu • Upload bởi: {courseGroup.uploadedByName}
          </p>
        </div>

        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Documents List - Expandable */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-3">
          {courseGroup.documents.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Chưa có tài liệu nào</p>
            </div>
          ) : (
            courseGroup.documents.map((document) => (
              <DocumentFile
                key={document.documentId}
                document={document}
                onView={(doc) => onView(doc, courseGroup.uploadedByName)}
                uploadedByName={courseGroup.uploadedByName}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default function DocumentsPage() {
  usePageTitle('Tài liệu');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [selectedUploadedBy, setSelectedUploadedBy] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { courseGroups, loading, error, refetch } = useDocuments();

  const toggleExpand = (courseClassId: string) => {
    setExpandedId(expandedId === courseClassId ? null : courseClassId);
  };

  const handleView = (document: DocumentItem, uploadedByName: string) => {
    setSelectedDocument(document);
    setSelectedUploadedBy(uploadedByName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải tài liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tài liệu</h1>
          <p className="text-sm text-gray-600">Tham khảo tài liệu cho sinh viên</p>
        </header>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Không thể tải dữ liệu</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={refetch}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseGroups.length) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tài liệu</h1>
          <p className="text-sm text-gray-600">Tham khảo tài liệu cho sinh viên</p>
        </header>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 lg:p-6 text-center">
          <p className="text-gray-600">Chưa có tài liệu nào được chia sẻ.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tài liệu</h1>
          <p className="text-sm text-gray-600">Tham khảo tài liệu cho sinh viên</p>
        </header>

        {/* Course Groups List */}
        <div className="space-y-4">
          {courseGroups.map((courseGroup) => (
            <CourseCard
              key={courseGroup.courseClassId}
              courseGroup={courseGroup}
              isExpanded={expandedId === courseGroup.courseClassId}
              onToggle={() => toggleExpand(courseGroup.courseClassId)}
              onView={handleView}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <DocumentModal
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        uploadedByName={selectedUploadedBy}
      />
    </>
  );
}
