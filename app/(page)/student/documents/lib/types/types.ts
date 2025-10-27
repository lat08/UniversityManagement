export interface Document {
  id: string
  name: string
  size: string
  date: string
  type: 'pdf' | 'zip' | 'pptx'
}

export interface DocumentSection {
  title: string
  subtitle: string
  fileCount: number
  documents: Document[]
}

// API Types - Individual document
export interface DocumentItem {
  documentId: string
  fileTitle: string
  fileType: string
  fileSize: number
  description: string
  filePath: string
  previewUrl: string
  downloadUrl: string
  created: string
}

// Course group with documents
export interface CourseGroup {
  courseClassId: string
  courseName: string
  uploadedById: string
  uploadedByName: string
  documents: DocumentItem[]
}

export interface DocumentsApiResponse {
  success: boolean
  total: number
  data: CourseGroup[]
}