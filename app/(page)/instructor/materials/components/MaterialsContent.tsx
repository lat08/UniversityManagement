"use client"

import { useState, useMemo } from "react";
import { MaterialsHeader } from "./MaterialsHeader";
import { MaterialsFilters } from "./MaterialsFilters";
import { DocumentCard, type Document } from "./DocumentCard";
import { UploadDocumentModal, type UploadFormData } from "./UploadDocumentModal";
import { DeleteDocumentModal } from "./DeleteDocumentModal";
import { EditDocumentModal, type EditFormData } from "./EditDocumentModal";
import { useMaterials } from "../lib/hooks/useMaterials";
import { transformMaterialsToDocuments, getCourseClassesOptions } from "../lib/utils/transformers";

export function MaterialsContent() {
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);

  // Use materials hook
  const {
    materials,
    documentTypes,
    isLoading,
    searchQuery,
    uploadMaterial,
    updateMaterial,
    deleteMaterial,
    handleSearch,
  } = useMaterials();

  // Transform API data to component format
  const allDocuments = useMemo(() => {
    return transformMaterialsToDocuments(materials);
  }, [materials]);

  // Get course classes for dropdowns
  const courseClasses = useMemo(() => {
    return getCourseClassesOptions(materials);
  }, [materials]);

  // Get unique subjects from materials
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(materials.map(m => m.courseName));
    return [
      { id: "all", name: "Tất cả môn học" },
      ...Array.from(uniqueSubjects).map(name => ({
        id: name,
        name: name
      }))
    ];
  }, [materials]);

  // Get document types from API
  const types = useMemo(() => {
    return [
      { id: "all", name: "Tất cả loại" },
      ...documentTypes.map(dt => ({
        id: dt.documentType,
        name: dt.documentType
      }))
    ];
  }, [documentTypes]);

  const semesters = [
    { id: "all", name: "Tất cả học kỳ" },
    { id: "20251", name: "Học kỳ 1 - Năm học 2025 - 2026" },
    { id: "20242", name: "Học kỳ 2 - Năm học 2024 - 2025" },
  ];

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (data: UploadFormData) => {
    const success = await uploadMaterial({
      courseClassId: data.subjectClass,
      documentType: data.documentType,
      title: data.documentName,
      description: data.description,
      file: data.file as File,
    });

    if (success) {
      setIsUploadModalOpen(false);
    }
  };

  const handleEdit = (id: string) => {
    const doc = allDocuments.find((d) => d.id === id);
    if (doc) {
      setDocumentToEdit(doc);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async (data: EditFormData) => {
    if (!documentToEdit) return;

    const success = await updateMaterial(documentToEdit.id, {
      courseClassId: data.subjectClass,
      documentType: data.documentType,
      title: data.documentName,
      description: data.description,
    });

    if (success) {
      setIsEditModalOpen(false);
      setDocumentToEdit(null);
    }
  };

  const handleDownload = (id: string) => {
    const doc = allDocuments.find((d) => d.id === id);
    if (doc?.downloadUrl) {
      // Open download URL in new tab
      window.open(doc.downloadUrl, '_blank');
    }
  };

  const handleDelete = (id: string) => {
    const doc = allDocuments.find((d) => d.id === id);
    if (doc) {
      setDocumentToDelete(doc);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    const success = await deleteMaterial(documentToDelete.id);
    
    if (success) {
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
    }
  };

  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((doc) => {
      // Search is handled by API
      
      const matchesSemester = selectedSemester === "all" || true; // TODO: Add semester filter logic
      
      const matchesSubject =
        selectedSubject === "all" ||
        doc.subject === selectedSubject;
      
      // Map UI type to API documentType
      const typeMapping: Record<string, string[]> = {
        'Slide': ['slide'],
        'Tài liệu': ['document'],
        'Bài tập': ['exercise'],
        'Bài LAB': ['exercise'],
      };
      
      let matchesType = selectedType === "all";
      if (!matchesType && doc.documentType) {
        matchesType = typeMapping[selectedType]?.includes(doc.type) || doc.documentType === selectedType;
      }

      return matchesSemester && matchesSubject && matchesType;
    });
  }, [allDocuments, selectedSemester, selectedSubject, selectedType]);

  return (
    <div className="space-y-6">
      <MaterialsHeader onUploadClick={handleUpload} />

      <MaterialsFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        selectedSemester={selectedSemester}
        onSemesterChange={setSelectedSemester}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        semesters={semesters}
        subjects={subjects}
        types={types}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Không tìm thấy tài liệu nào.</p>
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onEdit={handleEdit}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
        courseClasses={courseClasses}
        documentTypes={types.filter(t => t.id !== 'all')}
      />

      <DeleteDocumentModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDocumentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        document={documentToDelete}
        isLoading={isLoading}
      />

      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setDocumentToEdit(null);
        }}
        onSubmit={handleEditSubmit}
        document={documentToEdit}
        courseClasses={courseClasses}
        documentTypes={types.filter(t => t.id !== 'all')}
      />
    </div>
  );
}

