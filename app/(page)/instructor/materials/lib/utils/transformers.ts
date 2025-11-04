import { CourseClassMaterials, MaterialDocument } from "../type"
import { Document } from "../../components/DocumentCard"
import { formatDate } from "@/lib/utils/format"

/**
 * Transform API response to Document format for components
 */
export const transformMaterialsToDocuments = (materials: CourseClassMaterials[]): Document[] => {
  const documents: Document[] = []

  for (const courseClass of materials) {
    for (const doc of courseClass.documents) {
      documents.push(transformMaterialDocumentToDocument(doc, courseClass))
    }
  }

  return documents
}

/**
 * Transform single MaterialDocument to Document
 */
export const transformMaterialDocumentToDocument = (
  doc: MaterialDocument,
  courseClass: CourseClassMaterials
): Document => {
  // Parse document type to match component format
  const typeMapping: Record<string, "slide" | "document" | "exercise"> = {
    'Slide': 'slide',
    'Tài liệu': 'document',
    'Bài tập': 'exercise',
    'Bài LAB': 'exercise', // Map "Bài LAB" to exercise
  }


  // Extract class code from course name if possible
  // Example: "Lập trình web - 230PM" -> "230PM"
  const extractClassCode = (courseName: string): string => {
    const match = courseName.match(/\s-\s(\w+)$/)
    return match ? match[1] : ''
  }

  return {
    id: doc.documentId,
    title: doc.fileTitle,
    subject: courseClass.courseName,
    date: formatDate(doc.created),
    type: typeMapping[doc.documentType] || 'document',
    classCode: extractClassCode(courseClass.courseName),
    // Store additional data for edit/delete operations
    courseClassId: courseClass.courseClassId,
    documentType: doc.documentType,
    description: doc.description,
    downloadUrl: doc.downloadUrl,
    previewUrl: doc.previewUrl,
  }
}

/**
 * Get unique course classes from materials
 */
export const getCourseClassesOptions = (materials: CourseClassMaterials[]) => {
  return materials.map((courseClass) => ({
    id: courseClass.courseClassId,
    name: courseClass.courseName,
  }))
}

