'use client'

import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useDebounce } from '@/lib/hooks/useDebounce'
import { 
  useMaterialsQuery, 
  useDocumentTypesQuery, 
  useInstructorCourseClassesQuery,
  useUploadMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation
} from './lib/hooks'
import { useSemesters, useSubjects } from '@/lib/hooks'
import { useProfile } from '../profile/lib/hooks/useProfile'
import { Pagination } from '@/app/components/ui/pagination'
import { MaterialsHeader } from './components/MaterialsHeader'
import { MaterialsFilters } from './components/MaterialsFilters'
import { DocumentCard, type Document } from './components/DocumentCard'
import { MaterialsSkeleton } from './components/MaterialsSkeleton'
import { MaterialsEmpty } from './components/MaterialsEmpty'
import type { UploadFormData } from './components/UploadDocumentModal'
import type { EditFormData } from './components/EditDocumentModal'
import { transformMaterialsToDocuments } from './lib/utils/transformers'
import { downloadFile } from '@/lib/utils/fileDownload'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, SEARCH_DEBOUNCE_MS } from './lib/constants'
import type { GetMaterialsParams } from './lib/type'
import { queryKeys } from '@/lib/api/queryKeys'

const UploadDocumentModal = lazy(() => 
  import('./components/UploadDocumentModal').then(mod => ({ default: mod.UploadDocumentModal }))
)
const EditDocumentModal = lazy(() => 
  import('./components/EditDocumentModal').then(mod => ({ default: mod.EditDocumentModal }))
)
const DeleteDocumentModal = lazy(() => 
  import('./components/DeleteDocumentModal').then(mod => ({ default: mod.DeleteDocumentModal }))
)

export default function MaterialsPage() {
  const t = useTranslations('instructor.materials');
  usePageTitle(t('title'))
  
  const queryClient = useQueryClient()
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('')
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null)
  const [isFilterChanging, setIsFilterChanging] = useState(false)
  
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS)
  
  const materialsParams = useMemo<GetMaterialsParams>(() => ({
    keyword: debouncedQuery || undefined,
    documentType: selectedDocumentType || undefined,
    semesterId: selectedSemesterId || undefined,
    subjectId: selectedSubjectId || undefined,
    pageNumber: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
  }), [debouncedQuery, selectedDocumentType, selectedSemesterId, selectedSubjectId, currentPage])
  
  const { data: documentsResponse, isLoading: documentsLoading, isFetching, error: documentsError, refetch } = useMaterialsQuery(materialsParams)
  const { data: documentTypesResponse, isLoading: typesLoading } = useDocumentTypesQuery()
  const { data: semesters, loading: semestersLoading } = useSemesters()
  const { profile } = useProfile()
  const { data: subjects, loading: subjectsLoading } = useSubjects({ 
    instructorId: profile?.instructorId,
    semesterId: selectedSemesterId || undefined
  })
  const { data: courseClassesResponse, isLoading: courseClassesLoading } = useInstructorCourseClassesQuery(selectedSemesterId || undefined)
  
  const uploadMutation = useUploadMaterialMutation()
  const updateMutation = useUpdateMaterialMutation()
  const deleteMutation = useDeleteMaterialMutation()
  const [shouldRefetchAfterUpload, setShouldRefetchAfterUpload] = useState(false)

  useEffect(() => {
    setCurrentPage(DEFAULT_PAGE_NUMBER)
    setIsFilterChanging(true)
    const timer = setTimeout(() => setIsFilterChanging(false), 150)
    return () => clearTimeout(timer)
  }, [debouncedQuery, selectedDocumentType, selectedSemesterId, selectedSubjectId])

  useEffect(() => {
    if (shouldRefetchAfterUpload && !selectedDocumentType && !selectedSemesterId && !selectedSubjectId && !query) {
      void queryClient.refetchQueries({ queryKey: queryKeys.materials.lists() })
      setShouldRefetchAfterUpload(false)
    }
  }, [shouldRefetchAfterUpload, selectedDocumentType, selectedSemesterId, selectedSubjectId, query, queryClient])

  const documents = useMemo(() => documentsResponse?.data?.items || [], [documentsResponse])
  const totalCount = useMemo(() => documentsResponse?.data?.totalCount || 0, [documentsResponse])
  const totalPages = useMemo(() => documentsResponse?.data?.totalPages || 0, [documentsResponse])
  const documentTypes = useMemo(() => documentTypesResponse?.data || [], [documentTypesResponse])
  const allCourseClasses = useMemo(() => courseClassesResponse?.data || [], [courseClassesResponse])

  const allDocuments = useMemo(() => transformMaterialsToDocuments(documents), [documents])

  const showLoading = documentsLoading || isFilterChanging || (isFetching && allDocuments.length === 0)

  const hasFilters = Boolean(
    debouncedQuery || 
    selectedDocumentType || 
    selectedSemesterId || 
    selectedSubjectId
  )

  const courseClasses = useMemo(() => {
    if (!allCourseClasses || allCourseClasses.length === 0) return []
    
    return allCourseClasses.map(cc => ({
      id: cc.courseClassId,
      name: `${cc.courseCode} - ${cc.courseName}`,
    }))
  }, [allCourseClasses])

  const subjectOptions = useMemo(() => 
    subjects.map(s => ({
      id: s.subjectId,
      name: `${s.subjectCode} - ${s.subjectName}`,
    }))
  , [subjects])

  const documentTypeOptions = useMemo(() => [
    { id: '', name: t('allTypes') },
    ...documentTypes.map(dt => ({ id: dt.documentType, name: dt.documentType }))
  ], [documentTypes, t])

  const semesterOptions = useMemo(() => [
    { id: '', name: t('allSemesters') },
    ...semesters.map(s => ({ id: s.semesterId, name: s.semesterName }))
  ], [semesters, t])

  const handleUpload = () => {
    setIsUploadModalOpen(true)
  }

  const handlePrefetchCourseClasses = () => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.materials.courseClasses(selectedSemesterId || undefined),
      staleTime: 10 * 60 * 1000,
    })
  }

  const handleUploadSubmit = async (data: UploadFormData) => {
    uploadMutation.mutate({
      courseClassId: data.subjectClass,
      documentType: data.documentType,
      title: data.documentName,
      description: data.description,
      file: data.file as File,
    }, {
      onSuccess: (response) => {
        if (response.success) {
          setIsUploadModalOpen(false)
          setSelectedDocumentType('')
          setSelectedSemesterId('')
          setSelectedSubjectId('')
          setQuery('')
          setCurrentPage(DEFAULT_PAGE_NUMBER)
          setShouldRefetchAfterUpload(true)
        }
      }
    })
  }

  const handleEdit = (id: string) => {
    const doc = allDocuments.find((d) => d.id === id)
    if (doc) {
      setDocumentToEdit(doc)
      setIsEditModalOpen(true)
    }
  }

  const handleEditSubmit = async (data: EditFormData) => {
    if (!documentToEdit) return

    updateMutation.mutate({
      documentId: documentToEdit.id,
      data: {
        courseClassId: data.subjectClass,
        documentType: data.documentType,
        title: data.documentName,
        description: data.description,
        file: data.file,
      }
    }, {
      onSuccess: (response) => {
        if (response.success) {
          setIsEditModalOpen(false)
          setDocumentToEdit(null)
        }
      }
    })
  }

  const handleDownload = async (id: string) => {
    const doc = allDocuments.find((d) => d.id === id)
    if (doc?.downloadUrl) {
      await downloadFile(doc.downloadUrl, doc.title || 'document')
    }
  }

  const handleDelete = (id: string) => {
    const doc = allDocuments.find((d) => d.id === id)
    if (doc) {
      setDocumentToDelete(doc)
      setIsDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return

    deleteMutation.mutate(documentToDelete.id, {
      onSuccess: (response) => {
        if (response.success) {
          setIsDeleteModalOpen(false)
          setDocumentToDelete(null)
        }
      }
    })
  }

  const error = documentsError?.message || null

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        <MaterialsHeader 
          onUploadClick={handleUpload} 
          onUploadHover={handlePrefetchCourseClasses}
        />

        <MaterialsFilters
          searchQuery={query}
          onSearchChange={setQuery}
          selectedSemester={selectedSemesterId}
          onSemesterChange={setSelectedSemesterId}
          selectedSubject={selectedSubjectId}
          onSubjectChange={setSelectedSubjectId}
          selectedType={selectedDocumentType}
          onTypeChange={setSelectedDocumentType}
          semesters={semesterOptions}
          subjects={subjectOptions}
          types={documentTypeOptions}
          semestersLoading={semestersLoading}
          subjectsLoading={subjectsLoading}
          typesLoading={typesLoading}
        />

        {error ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        ) : showLoading ? (
          <MaterialsSkeleton />
        ) : (
          <div className="space-y-4">
            {allDocuments.length === 0 ? (
              <MaterialsEmpty hasFilters={hasFilters} />
            ) : (
              <div className={`space-y-4 transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                {allDocuments.map((document, index) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onEdit={handleEdit}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    animationDelay={index * 100}
                    onClick={() => handleEdit(document.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!showLoading && !error && totalCount > 0 && (
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

      <Suspense fallback={null}>
        {isUploadModalOpen && (
          <UploadDocumentModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onSubmit={handleUploadSubmit}
            courseClasses={courseClasses}
            documentTypes={documentTypeOptions.filter(t => t.id !== '')}
            isUploading={uploadMutation.isPending}
            isLoadingCourseClasses={courseClassesLoading}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteDocumentModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setDocumentToDelete(null)
            }}
            onConfirm={handleConfirmDelete}
            document={documentToDelete}
            isLoading={deleteMutation.isPending}
          />
        )}

        {isEditModalOpen && (
          <EditDocumentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setDocumentToEdit(null)
            }}
            onSubmit={handleEditSubmit}
            document={documentToEdit}
            courseClasses={courseClasses}
            documentTypes={documentTypeOptions.filter(t => t.id !== '')}
            isUpdating={updateMutation.isPending}
            isLoadingCourseClasses={courseClassesLoading}
          />
        )}
      </Suspense>
    </>
  )
}
