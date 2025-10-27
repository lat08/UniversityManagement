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

/**
 * Format date to DD/MM/YYYY
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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




