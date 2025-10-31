"use client"

import { useState } from "react";
import { MaterialsHeader } from "./MaterialsHeader";
import { MaterialsFilters } from "./MaterialsFilters";
import { DocumentCard, type Document } from "./DocumentCard";
import { UploadDocumentModal, type UploadFormData } from "./UploadDocumentModal";
import { DeleteDocumentModal } from "./DeleteDocumentModal";
import { EditDocumentModal, type EditFormData } from "./EditDocumentModal";

export function MaterialsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("20251");
  const [selectedSubject, setSelectedSubject] = useState("web");
  const [selectedType, setSelectedType] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const semesters = [
    { id: "all", name: "Tất cả học kỳ" },
    { id: "20251", name: "Học kỳ 1 - Năm học 2025 - 2026" },
    { id: "20242", name: "Học kỳ 2 - Năm học 2024 - 2025" },
  ];

  const subjects = [
    { id: "all", name: "Tất cả môn học" },
    { id: "web", name: "Lập trình web" },
    { id: "network", name: "Mạng máy tính" },
    { id: "database", name: "Cơ sở dữ liệu" },
  ];

  const types = [
    { id: "all", name: "Tất cả loại" },
    { id: "slide", name: "Slide" },
    { id: "document", name: "Tài liệu" },
    { id: "exercise", name: "Bài tập" },
  ];

  const documents: Document[] = [
    {
      id: "1",
      title: "Bài giảng tuần 1 - Giới thiệu HTML/CSS",
      subject: "Lập trình web",
      date: "01/02/2025",
      type: "slide",
      classCode: "230PM",
    },
    {
      id: "2",
      title: "Tài liệu tham khảo JavaScript",
      subject: "Lập trình web",
      date: "01/02/2025",
      type: "document",
      classCode: "230PM",
    },
    {
      id: "3",
      title: "Bài tập tuần 1 - HTML/CSS",
      subject: "Lập trình web",
      date: "01/02/2025",
      type: "exercise",
      classCode: "230PM",
    },
    {
      id: "4",
      title: "Bài tập tuần 2 - JavaScript cơ bản",
      subject: "Lập trình web",
      date: "08/02/2025",
      type: "exercise",
      classCode: "230PM",
    },
    {
      id: "5",
      title: "Bài tập tuần 3 - DOM Manipulation",
      subject: "Lập trình web",
      date: "15/02/2025",
      type: "exercise",
      classCode: "230PM",
    },
  ];

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (data: UploadFormData) => {
    // TODO: Implement upload API call
    console.log("Upload data:", data);
    // After successful upload, refetch documents list
  };

  const handleEdit = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setDocumentToEdit(doc);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = (data: EditFormData) => {
    // TODO: Implement edit API call
    console.log("Edit data:", data);
    // After successful edit, refetch documents list
  };

  const handleDownload = (id: string) => {
    // TODO: Implement download functionality
    console.log("Download:", id);
  };

  const handleDelete = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setDocumentToDelete(doc);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      // TODO: Implement delete API call
      console.log("Deleting document:", documentToDelete.id);
      // await deleteDocument(documentToDelete.id);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // After successful delete, refetch documents list
      // You can add a callback here to refresh the list
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSemester = selectedSemester === "all" || true; // TODO: Add semester filter logic
    
    const matchesSubject =
      selectedSubject === "all" ||
      doc.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    
    const matchesType = selectedType === "all" || doc.type === selectedType;

    return matchesSearch && matchesSemester && matchesSubject && matchesType;
  });

  return (
    <div className="space-y-6">
      <MaterialsHeader onUploadClick={handleUpload} />

      <MaterialsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
        {filteredDocuments.length === 0 ? (
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
      />

      <DeleteDocumentModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDocumentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        document={documentToDelete}
        isLoading={isDeleting}
      />

      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setDocumentToEdit(null);
        }}
        onSubmit={handleEditSubmit}
        document={documentToEdit}
      />
    </div>
  );
}

