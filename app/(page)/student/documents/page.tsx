'use client';

import { useState } from 'react';
import { Download, Eye, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useDocuments } from './lib/hooks/useDocuments';
import { formatFileSize, formatDate } from './lib/utils/documentUtils';
import { DocumentModal } from './lib/components/DocumentModal';
import type { DocumentSection, CourseGroup } from './lib/types/types';

/* DocumentFile component removed — overview now shows DocumentSection cards. */


export default function DocumentsPage() {
  usePageTitle('Tài liệu');
  const [selectedGroup, setSelectedGroup] = useState<CourseGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [query, setQuery] = useState<string>('');
  
  // TODO: Replace with API data
  const semesters = [
    { id: 'all', name: 'Tất cả học kỳ' },
    { id: '20241', name: 'Học kỳ 1 - Năm học 2024-2025' },
    { id: '20232', name: 'Học kỳ 2 - Năm học 2023-2024' },
  ];

  const subjects = [
    { id: 'all', name: 'Tất cả môn học' },
    { id: 'web', name: 'Lập trình web' },
    { id: 'network', name: 'Mạng máy tính' },
    { id: 'database', name: 'Cơ sở dữ liệu' },
  ];
  
  const { courseGroups, loading, error, refetch } = useDocuments();

  const handleView = (group: CourseGroup) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
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

  // Build DocumentSection list from API CourseGroup
  // DocumentSection: { title, subtitle, fileCount, documents: Document[] }
  const sections: DocumentSection[] = courseGroups.map((group) => ({
    id: group.courseClassId,
    title: group.courseName,
    subtitle: group.uploadedByName,
    fileCount: group.documents.length,
    documents: group.documents.map((d) => ({
      id: d.documentId,
      name: d.fileTitle,
      size: formatFileSize(d.fileSize),
      date: formatDate(d.created),
      type: d.fileType,
    })),
  }));

  return (
    <>
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Tài liệu</h1>
          <p className="text-sm text-gray-600">Tham khảo tài liệu cho sinh viên</p>
        </header>

        {/* Filters */}
          <div className="grid gap-4 md:grid-cols-4 items-center">
          {/* Search */}
          <div className="relative col-span-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              aria-label="Tìm kiếm tài liệu theo tên"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {semesters.map(semester => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

        </div>

        {/* Documents Sections List (DocumentSection) */}
        <div className="space-y-4">
          
          {(() => {
            const filtered = sections.filter(s => s.title.toLowerCase().includes(query.trim().toLowerCase()));
            if (filtered.length === 0) {
              return (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-blue-700">Chưa có tài liệu nào được chia sẻ.</p>
                </div>
              );
            }

            return filtered.map((section, idx) => {
              const group = courseGroups[idx];
              return (
                <div key={section.id} className="relative bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.subtitle}</p>
                    <p className="text-sm text-gray-500 mt-2">{section.fileCount} tài liệu</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={() => handleView(group)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      <Eye className="w-4 h-4 mr-2" /> Xem
                    </Button>
                    <Button onClick={() => {
                      // download all files in this group
                      group.documents.forEach(doc => window.open(doc.downloadUrl, '_blank'))
                    }} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Download className="w-4 h-4 mr-2" /> Tải
                    </Button>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Modal */}
      <DocumentModal
        courseGroup={selectedGroup}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
