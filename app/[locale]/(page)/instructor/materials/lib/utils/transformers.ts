import { MaterialViewDto, DocumentChildDto, InstructorDocumentDto } from "../type"
import { Document } from "../../components/DocumentCard"
import { formatDate } from "@/lib/utils/format"

const TYPE_MAPPING: Record<string, "slide" | "document" | "exercise"> = {
  'Slide': 'slide',
  'Tài liệu': 'document',
  'Bài tập': 'exercise',
  'Bài LAB': 'exercise',
} as const

const extractClassCode = (courseName: string): string => {
  const match = /\s-\s(\w+)$/.exec(courseName)
  return match?.[1] || ''
}

export const transformMaterialDocumentToDocument = (
  doc: DocumentChildDto,
  courseClass: MaterialViewDto
): Document => {
  return {
    id: doc.documentId,
    title: doc.fileTitle,
    subject: courseClass.courseName,
    date: formatDate(doc.created),
    type: TYPE_MAPPING[doc.documentType] || 'document',
    classCode: extractClassCode(courseClass.courseName),
    courseClassId: courseClass.courseClassId,
    documentType: doc.documentType,
    description: doc.description,
    downloadUrl: doc.downloadUrl,
    previewUrl: doc.previewUrl,
  }
}

export const transformMaterialsToDocuments = (materials: MaterialViewDto[]): Document[] => {
  const documents: Document[] = []

  for (const courseClass of materials) {
    if (!courseClass.documents || courseClass.documents.length === 0) continue
    
    for (const doc of courseClass.documents) {
      documents.push(transformMaterialDocumentToDocument(doc, courseClass))
    }
  }

  return documents
}

export const getCourseClassesOptions = (materials: MaterialViewDto[]) => {
  return materials.map((courseClass) => ({
    id: courseClass.courseClassId,
    name: courseClass.courseName,
  }))
}

// Transform InstructorDocumentDto to Document (flat list)
export const transformDocumentDtoToDocument = (doc: InstructorDocumentDto): Document => {
  return {
    id: doc.documentId,
    title: doc.fileTitle,
    subject: doc.courseName,
    date: formatDate(doc.created),
    type: TYPE_MAPPING[doc.documentType] || 'document',
    classCode: extractClassCode(doc.courseName),
    courseClassId: doc.courseClassId,
    documentType: doc.documentType,
    description: doc.description,
    downloadUrl: doc.downloadUrl,
    previewUrl: doc.previewUrl,
  }
}

export const transformDocumentsToDocuments = (documents: InstructorDocumentDto[]): Document[] => {
  return documents.map(transformDocumentDtoToDocument)
}

