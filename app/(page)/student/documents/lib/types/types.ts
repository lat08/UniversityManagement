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
