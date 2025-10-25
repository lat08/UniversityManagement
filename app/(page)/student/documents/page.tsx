'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { documentSections } from './lib/data/documentData';
import { getFileIcon, getFileTypeTag } from './lib/utils/fileUtils';
import { Document, DocumentSection as DocumentSectionType } from './lib/types/types';

const DocumentCard = ({ document }: { document: Document }) => {
  const handleView = () => {
    console.log('Xem tài liệu:', document.name);
  };

  const handleDownload = () => {
    console.log('Tải về tài liệu:', document.name);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {getFileIcon(document.type)}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {document.name}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {getFileTypeTag(document.type)}
              <span>•</span>
              <span>{document.size}</span>
              <span>•</span>
              <span>{document.date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
          >
            <Eye className="w-4 h-4" />
            <span>Xem</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
          >
            <Download className="w-4 h-4" />
            <span>Tải về</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

const DocumentSection = ({ section }: { section: DocumentSectionType }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {section.title}
          </h3>
          <p className="text-sm text-gray-600">{section.subtitle}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
          {section.fileCount} tài liệu
        </span>
      </div>
      <div className="space-y-4">
        {section.documents.map((document: Document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
    </div>
  );
};

export default function DocumentsPage() {
  usePageTitle('Tài liệu');
  const [selectedSemester, setSelectedSemester] = useState('Tất cả học kỳ');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const semesters = [
    'Tất cả học kỳ',
    'Học kỳ 1 - 2024-2025',
    'Học kỳ 2 - 2024-2025',
    'Học kỳ 3 - 2024-2025'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tài liệu</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý và tải xuống tài liệu học tập</p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 min-w-[200px] justify-between bg-white hover:bg-white hover:border-gray-400 cursor-pointer"
          >
            <span>{selectedSemester}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {semesters.map((semester) => (
                <button
                  key={semester}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                  onClick={() => {
                    setSelectedSemester(semester);
                    setIsDropdownOpen(false);
                  }}
                >
                  {semester}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Sections */}
      <div className="space-y-8">
        {documentSections.map((section, index) => (
          <DocumentSection key={index} section={section} />
        ))}
      </div>
    </div>
  );
}
