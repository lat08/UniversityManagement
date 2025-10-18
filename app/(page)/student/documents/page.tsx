'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'pdf' | 'zip' | 'pptx';
}

interface DocumentSection {
  title: string;
  subtitle: string;
  fileCount: number;
  documents: Document[];
}

const documentSections: DocumentSection[] = [
  {
    title: 'Lập trình Web',
    subtitle: 'CS301 - TS. Nguyễn Văn Bangkok',
    fileCount: 3,
    documents: [
      {
        id: '1',
        name: 'Bài giảng bài 1 - Giới thiệu HTML/CSS',
        size: '2.5 MB',
        date: '01/02/2025',
        type: 'pdf'
      },
      {
        id: '2',
        name: 'Bài tập thực hành JavaScript',
        size: '1.8 MB',
        date: '05/02/2025',
        type: 'pdf'
      },
      {
        id: '3',
        name: 'Source code demo React',
        size: '5.2 MB',
        date: '08/02/2025',
        type: 'zip'
      }
    ]
  },
  {
    title: 'Cơ sở dữ liệu',
    subtitle: 'CS202 - PGS. Trần Thị Canada',
    fileCount: 2,
    documents: [
      {
        id: '4',
        name: 'Chương 1 - Mô hình quan hệ',
        size: '3.1 MB',
        date: '02/02/2025',
        type: 'pdf'
      },
      {
        id: '5',
        name: 'Bài tập SQL cơ bản',
        size: '1.2 MB',
        date: '06/02/2025',
        type: 'pdf'
      }
    ]
  },
  {
    title: 'Mạng máy tính',
    subtitle: 'CS304 - Tiến sĩ Vũ Domain',
    fileCount: 2,
    documents: [
      {
        id: '6',
        name: 'Bài giảng - Mô hình OSI',
        size: '4.2 MB',
        date: '03/02/2025',
        type: 'pptx'
      },
      {
        id: '7',
        name: 'Lab 1 - Cấu hình Router',
        size: '2.9 MB',
        date: '07/02/2025',
        type: 'pdf'
      }
    ]
  }
];

const getFileIcon = (type: string) => {
  return <FileText className="w-8 h-8" style={{ color: '#4E8EE1' }} />;
};

const getFileTypeTag = (type: string) => {
  const tagColors = {
    'pdf': 'bg-red-50 text-red-600 border border-red-200',
    'zip': 'bg-green-50 text-green-600 border border-green-200', 
    'pptx': 'bg-orange-50 text-orange-600 border border-orange-200',
    'docx': 'bg-blue-50 text-blue-600 border border-blue-200'
  };
  
  const typeLabels = {
    'pdf': 'PDF',
    'zip': 'ZIP',
    'pptx': 'PPTX',
    'docx': 'WORD'
  };
  
  return (
    <span className={`inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium border ${tagColors[type as keyof typeof tagColors] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {typeLabels[type as keyof typeof typeLabels] || type.toUpperCase()}
    </span>
  );
};

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

const DocumentSection = ({ section }: { section: DocumentSection }) => {
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
        {section.documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
    </div>
  );
};

export default function DocumentsPage() {
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
