'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useDocumentsQuery, useDocumentTypesQuery } from './lib/hooks/useDocumentsQuery';
import { useSemesters, useSubjects } from '@/lib/hooks';
import { Pagination } from '@/app/components/ui/pagination';
import {
  DocumentCard,
  DocumentModal,
  DocumentsFilters,
  DocumentsHeader,
  DocumentsLoading,
  DocumentsError,
  DocumentsEmpty,
} from './components';
import type { CourseGroup, GetMaterialsParams } from './lib/types/types';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, SEARCH_DEBOUNCE_MS } from './lib/constants';

const DocumentsContent = () => {
  const [selectedGroup, setSelectedGroup] = useState<CourseGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
  const [isFilterChanging, setIsFilterChanging] = useState(false);
  
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  
  const materialsParams = useMemo(() => {
    const params: GetMaterialsParams = {
      pageNumber: currentPage,
      pageSize: DEFAULT_PAGE_SIZE,
    };
    
    if (debouncedQuery?.trim()) {
      params.keyword = debouncedQuery.trim();
    }
    if (selectedDocumentType?.trim()) {
      params.documentType = selectedDocumentType.trim();
    }
    if (selectedSemesterId?.trim()) {
      params.semesterId = selectedSemesterId.trim();
    }
    if (selectedSubjectId?.trim()) {
      params.subjectId = selectedSubjectId.trim();
    }
    
    return params;
  }, [debouncedQuery, selectedDocumentType, selectedSemesterId, selectedSubjectId, currentPage]);
  
  const { data: documentTypesRes, isLoading: typesLoading } = useDocumentTypesQuery();
  const { data: semesters = [], loading: semestersLoading } = useSemesters();
  const { data: subjects = [], loading: subjectsLoading } = useSubjects();
  const { data: documentsRes, isLoading, isError, error, refetch, isFetching } = useDocumentsQuery(materialsParams);

  const documentTypes = documentTypesRes?.data ?? [];
  const courseGroups = documentsRes?.data?.items ?? [];
  const totalCount = documentsRes?.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / DEFAULT_PAGE_SIZE);

  const showLoading = isLoading || isFilterChanging || (isFetching && courseGroups.length === 0);

  const hasFilters = Boolean(
    debouncedQuery || 
    selectedDocumentType || 
    selectedSemesterId || 
    selectedSubjectId
  );

  useEffect(() => {
    setCurrentPage(DEFAULT_PAGE_NUMBER);
    setIsFilterChanging(true);
    const timer = setTimeout(() => setIsFilterChanging(false), 150);
    return () => clearTimeout(timer);
  }, [debouncedQuery, selectedDocumentType, selectedSemesterId, selectedSubjectId]);

  const handleView = (group: CourseGroup): void => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

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

        {isError ? (
          <DocumentsError 
            error={(error as Error)?.message ?? 'Không thể tải dữ liệu tài liệu'} 
            onRetry={refetch} 
          />
        ) : showLoading ? (
          <DocumentsLoading />
        ) : (
          <div className="space-y-4">
            {courseGroups.length === 0 ? (
              <DocumentsEmpty hasFilters={hasFilters} />
            ) : (
              <div className={`space-y-4 transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                {courseGroups.map((group, index) => (
                  <DocumentCard
                    key={group.courseClassId}
                    courseGroup={group}
                    onView={handleView}
                    animationDelay={index * 50}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!showLoading && !isError && totalCount > 0 && (
          <div className="pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={DEFAULT_PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <DocumentModal
        courseGroup={selectedGroup}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default function DocumentsPage() {
  usePageTitle('Tài liệu');
  
  return (
    <Suspense fallback={<DocumentsLoading />}>
      <DocumentsContent />
    </Suspense>
  );
}
