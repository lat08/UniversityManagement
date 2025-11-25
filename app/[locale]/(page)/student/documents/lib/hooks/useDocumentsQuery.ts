import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';
import type { GetMaterialsParams, GetMaterialsResponse } from '../types/types';
import { DOCUMENTS_STALE_TIME, DOCUMENTS_CACHE_TIME } from '../constants';

const DOCUMENTS_QUERY_KEY = 'student-documents';

const normalizeParams = (params: GetMaterialsParams): Record<string, string | number> => {
  const normalized: Record<string, string | number> = {};
  
  if (params.keyword) normalized.keyword = params.keyword;
  if (params.documentType) normalized.documentType = params.documentType;
  if (params.semesterId) normalized.semesterId = params.semesterId;
  if (params.subjectId) normalized.subjectId = params.subjectId;
  if (params.pageNumber) normalized.pageNumber = params.pageNumber;
  if (params.pageSize) normalized.pageSize = params.pageSize;
  
  return normalized;
};

export const documentsKeys = {
  all: [DOCUMENTS_QUERY_KEY] as const,
  lists: () => [...documentsKeys.all, 'list'] as const,
  list: (params: GetMaterialsParams) => [...documentsKeys.lists(), normalizeParams(params)] as const,
  types: () => [...documentsKeys.all, 'types'] as const,
};

export const useDocumentsQuery = (
  params: GetMaterialsParams
): UseQueryResult<GetMaterialsResponse, Error> => {
  return useQuery({
    queryKey: documentsKeys.list(params),
    queryFn: () => {
      return documentsApi.getMaterials(params);
    },
    staleTime: DOCUMENTS_STALE_TIME,
    gcTime: DOCUMENTS_CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: true,
  });
};

export const useDocumentTypesQuery = () => {
  return useQuery({
    queryKey: documentsKeys.types(),
    queryFn: documentsApi.getDocumentTypes,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
