import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { facultyApi } from "../api/facultiesApi"
import { CreateFacultyDto, UpdateFacultyDto, BulkEditFacultyDto } from "../types/types"
import { toast } from "react-hot-toast"
import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"

export function useFaculties() {
  const t = useTranslations('admin.divisionManagement')
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")

  const { data: faculties = [], isLoading, error, refetch } = useQuery({
    queryKey: ["faculties", searchQuery],
    queryFn: () => facultyApi.getAll(searchQuery),
    staleTime: 30000,
  })

  const { data: stats } = useQuery({
    queryKey: ["faculty-stats", faculties],
    queryFn: () => facultyApi.getStats(),
    enabled: faculties.length > 0,
  })


  const { data: divisions = [] } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => facultyApi.getDivisions(),
    staleTime: 3600000,
  })

  const { data: deans = [] } = useQuery({
    queryKey: ["deans"],
    queryFn: () => facultyApi.getDeans(),
    staleTime: 3600000,
  })

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const createMutation = useMutation({
    mutationFn: (data: CreateFacultyDto) => facultyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] })
      queryClient.invalidateQueries({ queryKey: ["faculty-stats"] })
      toast.success(t('hooks.createSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.createError'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFacultyDto }) =>
      facultyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] })
      queryClient.invalidateQueries({ queryKey: ["faculty-stats"] })
      toast.success(t('hooks.updateSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.updateError'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => facultyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] })
      queryClient.invalidateQueries({ queryKey: ["faculty-stats"] })
      toast.success(t('hooks.deleteSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.deleteError'))
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => facultyApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] })
      queryClient.invalidateQueries({ queryKey: ["faculty-stats"] })
      toast.success(t('hooks.bulkDeleteSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.bulkDeleteError'))
    },
  })

  const bulkEditMutation = useMutation({
    mutationFn: (data: BulkEditFacultyDto) => facultyApi.bulkEdit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] })
      queryClient.invalidateQueries({ queryKey: ["faculty-stats"] })
      toast.success(t('hooks.bulkEditSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('hooks.bulkEditError'))
    },
  })

  return {
    faculties,
    stats,
    divisions,
    deans,
    isLoading,
    error,
    refetch,
    searchQuery,
    handleSearch,
    createFaculty: createMutation.mutate,
    updateFaculty: updateMutation.mutate,
    deleteFaculty: deleteMutation.mutate,
    bulkDeleteFaculties: bulkDeleteMutation.mutate,
    bulkEditFaculties: bulkEditMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkEditing: bulkEditMutation.isPending,
  }
}
