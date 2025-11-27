import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '../api/departmentsApi';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  BulkEditDepartmentDto,
} from '../types/types';
import { toast } from 'react-hot-toast';
import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

export function useDepartments() {
  const t = useTranslations('admin.departmentManagement');
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyId, setFacultyId] = useState<string>('');
  const [curriculumId, setCurriculumId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['departments', searchQuery, facultyId, curriculumId, currentPage],
    queryFn: () =>
      departmentsApi.getAll({
        searchQuery: searchQuery || undefined,
        facultyId: facultyId || undefined,
        curriculumId: curriculumId || undefined,
        pageNumber: currentPage,
        pageSize,
      }),
    staleTime: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ['department-stats'],
    queryFn: () => departmentsApi.getStats(),
    staleTime: 60000,
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ['departments-faculties'],
    queryFn: () => departmentsApi.getFaculties(),
    staleTime: 3600000,
  });

  const { data: curricula = [] } = useQuery({
    queryKey: ['departments-curricula', facultyId],
    queryFn: () => departmentsApi.getCurricula(undefined, facultyId || undefined),
    staleTime: 3600000,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback(
    (filters: { facultyId?: string; curriculumId?: string }) => {
      if (filters.facultyId !== undefined) setFacultyId(filters.facultyId);
      if (filters.curriculumId !== undefined) setCurriculumId(filters.curriculumId);
      setCurrentPage(1);
    },
    []
  );

  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentDto) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-stats'] });
      toast.success(t('hooks.createSuccess'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.createError'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentDto }) =>
      departmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-stats'] });
      toast.success(t('hooks.updateSuccess'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.updateError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-stats'] });
      toast.success(t('hooks.deleteSuccess'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.deleteError'));
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => departmentsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-stats'] });
      toast.success(t('hooks.bulkDeleteSuccess'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.bulkDeleteError'));
    },
  });

  const bulkEditMutation = useMutation({
    mutationFn: (data: BulkEditDepartmentDto) => departmentsApi.bulkEdit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-stats'] });
      toast.success(t('hooks.bulkEditSuccess'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.bulkEditError'));
    },
  });

  return {
    departments: data?.items || [],
    pagination: data
      ? {
          currentPage: data.pageNumber,
          totalPages: data.totalPages,
          totalCount: data.totalCount,
          pageSize: data.pageSize,
        }
      : { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 20 },
    stats: stats || { total: 0, active: 0, inactive: 0 },
    faculties,
    curricula,
    isLoading,
    error,
    refetch,
    searchQuery,
    facultyId,
    curriculumId,
    currentPage,
    handleSearch,
    handleFilterChange,
    setCurrentPage,
    createDepartment: createMutation.mutate,
    updateDepartment: updateMutation.mutate,
    deleteDepartment: deleteMutation.mutate,
    bulkDeleteDepartments: bulkDeleteMutation.mutate,
    bulkEditDepartments: bulkEditMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkEditing: bulkEditMutation.isPending,
  };
}


