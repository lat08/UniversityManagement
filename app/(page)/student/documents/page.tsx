'use client';

import { useState, useMemo } from 'react';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useDocuments, useDocumentTypes } from './lib/hooks';
import { useSemesters, useSubjects } from '@/lib/hooks';
import {
  DocumentCard,
  DocumentModal,
  DocumentsFilters,
  DocumentsHeader,
  DocumentsLoading,
  DocumentsError,
  DocumentsEmpty,
} from './components';
import type { CourseGroup } from './lib/types/types';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, SEARCH_DEBOUNCE_MS } from './lib/constants';

export default function DocumentsPage() {
  usePageTitle('Tài liệu');
  
  const [selectedGroup, setSelectedGroup] = useState<CourseGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  
  const materialsParams = useMemo(() => ({
    searchTerm: debouncedQuery || undefined,
    documentType: selectedDocumentType || undefined,
    semesterId: selectedSemesterId || undefined,
    subjectId: selectedSubjectId || undefined,
    pageNumber: DEFAULT_PAGE_NUMBER,
    pageSize: DEFAULT_PAGE_SIZE,
  }), [debouncedQuery, selectedDocumentType, selectedSemesterId, selectedSubjectId]);
  
  const { documentTypes, loading: typesLoading } = useDocumentTypes();
  const { data: semesters, loading: semestersLoading } = useSemesters();
  const { data: subjects, loading: subjectsLoading } = useSubjects();
  const { courseGroups, loading, error, refetch } = useDocuments(materialsParams);

  const safeCourseGroups = useMemo(() => {
    return Array.isArray(courseGroups) ? courseGroups : [];
  }, [courseGroups]);

  const hasFilters = Boolean(
    debouncedQuery || 
    selectedDocumentType || 
    selectedSemesterId || 
    selectedSubjectId
  );

  const handleView = (group: CourseGroup) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  const handleDownloadAll = (group: CourseGroup) => {
    (group.documents || []).forEach(doc => {
      if (doc.downloadUrl) {
        window.open(doc.downloadUrl, '_blank');
      }
    });
  };

  if (loading) {
    return <DocumentsLoading />;
  }

  if (error) {
    return <DocumentsError error={error} onRetry={refetch} />;
  }

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        <DocumentsHeader />

        <DocumentsFilters
          searchQuery={query}
          onSearchChange={setQuery}
          selectedDocumentType={selectedDocumentType}
          onDocumentTypeChange={setSelectedDocumentType}
          selectedSemesterId={selectedSemesterId}
          onSemesterChange={setSelectedSemesterId}
          selectedSubjectId={selectedSubjectId}
          onSubjectChange={setSelectedSubjectId}
          documentTypes={documentTypes}
          semesters={semesters}
          subjects={subjects}
          typesLoading={typesLoading}
          semestersLoading={semestersLoading}
          subjectsLoading={subjectsLoading}
        />

        <div className="space-y-4">
          {safeCourseGroups.length === 0 ? (
            <DocumentsEmpty hasFilters={hasFilters} />
          ) : (
            safeCourseGroups.map((group) => (
              <DocumentCard
                key={group.courseClassId}
                courseGroup={group}
                onView={handleView}
                onDownloadAll={handleDownloadAll}
              />
            ))
          )}
        </div>
      </div>

      <DocumentModal
        courseGroup={selectedGroup}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
