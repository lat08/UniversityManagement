/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export { formatDate } from '@/lib/utils/format';

interface Document {
  id: string;
  courseName: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  fileType: string;
}

/**
 * Group documents by course name
 */
export const groupDocumentsByCourse = (documents: Document[]) => {
  const grouped = documents.reduce((acc, doc) => {
    if (!acc[doc.courseName]) {
      acc[doc.courseName] = [];
    }
    acc[doc.courseName].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);
  
  return Object.entries(grouped).map(([courseName, docs]) => ({
    courseName,
    documents: docs
  }));
};




