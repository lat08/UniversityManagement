'use client';

import { Download, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { CourseGroup } from '../lib/types/types';

interface DocumentCardProps {
  courseGroup: CourseGroup;
  onView: (group: CourseGroup) => void;
  onDownloadAll: (group: CourseGroup) => void;
}

export const DocumentCard = ({ courseGroup, onView, onDownloadAll }: DocumentCardProps) => {
  const documentCount = courseGroup.documents?.length || 0;

  const handleDownloadAll = () => {
    for (const doc of courseGroup.documents || []) {
      if (doc.downloadUrl) {
        window.open(doc.downloadUrl, '_blank');
      }
    }
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-4 lg:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-blue-700">
          {courseGroup.courseName}
        </h3>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          {courseGroup.uploadedByName}
        </p>
        <p className="text-xs lg:text-sm text-gray-500 mt-2">
          {documentCount} tài liệu
        </p>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <Button 
          onClick={() => onView(courseGroup)} 
          variant="outline" 
          className="border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-1 lg:mr-2" /> Xem
        </Button>
        <Button 
          onClick={handleDownloadAll}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          size="sm"
        >
          <Download className="w-4 h-4 mr-1 lg:mr-2" /> Tải
        </Button>
      </div>
    </div>
  );
};

