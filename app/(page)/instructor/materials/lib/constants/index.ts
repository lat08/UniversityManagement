// API Endpoints
export const MATERIALS_API = {
  GET_MATERIALS: '/v1/materials/GetMaterials',
  GET_DOCUMENT_TYPES: '/v1/materials/student/document-types',
  UPLOAD_MATERIAL: '/v1/materials/instructor/UploadMaterial',
  UPDATE_MATERIAL: '/v1/materials/instructor/UpdateMaterial',
  DELETE_MATERIAL: '/v1/materials/instructor/DeleteMaterial',
} as const;

// Document Type Labels
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'Slide': 'Slide',
  'Tài liệu': 'Tài liệu',
  'Bài tập': 'Bài tập',
  'Bài LAB': 'Bài LAB',
};

// Document Type Colors
export const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  'Slide': 'bg-blue-500 text-white',
  'Tài liệu': 'bg-yellow-400 text-gray-900',
  'Bài tập': 'bg-red-500 text-white',
  'Bài LAB': 'bg-green-500 text-white',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_NUMBER = 1;

