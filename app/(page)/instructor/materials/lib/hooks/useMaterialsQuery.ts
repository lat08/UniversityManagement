import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { materialsApi } from '../api/materialsApi'
import { queryKeys } from '@/lib/api/queryKeys'
import { ApiResponse, PagedResult, MaterialViewDto, DocumentTypeDto, InstructorCourseClassDto, GetMaterialsParams } from '../type'

export const useMaterialsQuery = (
  params?: GetMaterialsParams
): UseQueryResult<ApiResponse<PagedResult<MaterialViewDto[]>>, Error> => {
  return useQuery({
    queryKey: queryKeys.materials.list(params || {}),
    queryFn: () => materialsApi.getMaterials(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}

export const useDocumentTypesQuery = (): UseQueryResult<ApiResponse<DocumentTypeDto[]>, Error> => {
  return useQuery({
    queryKey: queryKeys.materials.documentTypes(),
    queryFn: () => materialsApi.getDocumentTypes(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useInstructorCourseClassesQuery = (
  semesterId?: string
): UseQueryResult<ApiResponse<InstructorCourseClassDto[]>, Error> => {
  return useQuery({
    queryKey: queryKeys.materials.courseClasses(semesterId),
    queryFn: () => materialsApi.getInstructorCourseClasses(semesterId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
