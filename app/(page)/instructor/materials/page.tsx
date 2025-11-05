'use client'

import { useState, useMemo, useEffect } from 'react'
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useMaterials, useDocumentTypes } from './lib/hooks'
import { useSemesters, useSubjects } from '@/lib/hooks'
import { Pagination } from '@/app/components/ui/pagination'
import { MaterialsHeader } from './components/MaterialsHeader'
import { MaterialsFilters } from './components/MaterialsFilters'
import { DocumentCard, type Document } from './components/DocumentCard'
import { UploadDocumentModal, type UploadFormData } from './components/UploadDocumentModal'
import { DeleteDocumentModal } from './components/DeleteDocumentModal'
import { EditDocumentModal, type EditFormData } from './components/EditDocumentModal'
import { transformMaterialsToDocuments, getCourseClassesOptions } from './lib/utils/transformers'
import { downloadFile } from '@/lib/utils/fileDownload'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, SEARCH_DEBOUNCE_MS } from './lib/constants'

export default function MaterialsPage() {
  usePageTitle('Bài giảng & Giáo trình')
  
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
  
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS)
  
  const materialsParams = useMemo(() => ({
    keyword: debouncedQuery || undefined,
    documentType: selectedDocumentType || undefined,
    semesterId: selectedSemesterId || undefined,
    subjectId: selectedSubjectId || undefined,
    pageNumber: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
  }), [debouncedQuery, selectedDocumentType, selectedSemesterId, selectedSubjectId, currentPage])
  
  const { documentTypes, loading: typesLoading } = useDocumentTypes()
  const { data: semesters, loading: semestersLoading } = useSemesters()
  const { data: subjects, loading: subjectsLoading } = useSubjects()
  const { materials, loading, error, refetch, totalCount, uploadMaterial, updateMaterial, deleteMaterial } = useMaterials(materialsParams)

  const allDocuments = useMemo(() => {
    return transformMaterialsToDocuments(materials)
  }, [materials])

  const courseClasses = useMemo(() => {
    return getCourseClassesOptions(materials)
  }, [materials])

  const totalPages = Math.ceil(totalCount / DEFAULT_PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(DEFAULT_PAGE_NUMBER)
  }, [debouncedQuery, selectedDocumentType, selectedSemesterId, selectedSubjectId])

  const handleUpload = () => {
    setIsUploadModalOpen(true)
  }

  const handleUploadSubmit = async (data: UploadFormData) => {
    const success = await uploadMaterial({
      courseClassId: data.subjectClass,
      documentType: data.documentType,
      title: data.documentName,
      description: data.description,
      file: data.file as File,
    })

    if (success) {
      setIsUploadModalOpen(false)
    }
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

    const success = await updateMaterial(documentToEdit.id, {
      courseClassId: data.subjectClass,
      documentType: data.documentType,
      title: data.documentName,
      description: data.description,
    })

    if (success) {
      setIsEditModalOpen(false)
      setDocumentToEdit(null)
    }
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

    const success = await deleteMaterial(documentToDelete.id)
    
    if (success) {
      setIsDeleteModalOpen(false)
      setDocumentToDelete(null)
    }
  }

  const documentTypeOptions = useMemo(() => [
    { id: '', name: 'Tất cả loại tài liệu' },
    ...documentTypes.map(dt => ({ id: dt.documentType, name: dt.documentType }))
  ], [documentTypes])

  const semesterOptions = useMemo(() => [
    { id: '', name: 'Tất cả học kỳ' },
    ...semesters.map(s => ({ id: s.semesterId, name: s.semesterName }))
  ], [semesters])

  const subjectOptions = useMemo(() => 
    subjects.map(s => ({ id: s.subjectId, name: s.subjectName }))
  , [subjects])

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        <MaterialsHeader onUploadClick={handleUpload} />

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

        {(() => {
          if (error) {
            return (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-red-600">{error}</p>
                <button onClick={refetch} className="mt-4 text-blue-600 hover:text-blue-800">
                  Thử lại
                </button>
              </div>
            );
          }
          
          if (loading) {
            return (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            );
          }
          
          return (
          <div className="space-y-4">
            {allDocuments.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">Không tìm thấy tài liệu nào.</p>
              </div>
            ) : (
              allDocuments.map((document, index) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onEdit={handleEdit}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  animationDelay={index * 100}
                  onClick={() => handleEdit(document.id)}
                />
              ))
            )}
          </div>
          );
        })()}

        {!loading && !error && totalCount > 0 && (
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

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
        courseClasses={courseClasses}
        documentTypes={documentTypeOptions.filter(t => t.id !== '')}
      />

      <DeleteDocumentModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDocumentToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        document={documentToDelete}
        isLoading={loading}
      />

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
      />
    </>
  )
}
