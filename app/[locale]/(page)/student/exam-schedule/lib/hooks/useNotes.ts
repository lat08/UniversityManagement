import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import { examScheduleApi } from '../api/examScheduleApi';
import toast from 'react-hot-toast';

const DEFAULT_PARAMS = { pageNumber: 1, pageSize: 100, sortOrder: 'desc' as const };

export const useNotes = () => {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: queryKeys.notes.list(DEFAULT_PARAMS),
    queryFn: async () => {
      const response = await examScheduleApi.getNotes(DEFAULT_PARAMS);
      return response.success ? response.data.notes : [];
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: examScheduleApi.createNote,
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list(DEFAULT_PARAMS) });
      const previousNotes = queryClient.getQueryData(queryKeys.notes.list(DEFAULT_PARAMS));

      queryClient.setQueryData(queryKeys.notes.list(DEFAULT_PARAMS), (old: unknown) => {
        const notes = Array.isArray(old) ? old : [];
        return [{
          noteId: `temp-${Date.now()}`,
          studentId: '',
          content: newNote.content,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        }, ...notes];
      });

      return { previousNotes };
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.list(DEFAULT_PARAMS), context.previousNotes);
      }
      toast.error(error instanceof Error ? error.message : 'Tạo ghi chú thất bại');
    },
    onSuccess: () => {
      toast.success('Tạo ghi chú thành công');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      examScheduleApi.updateNote(noteId, { content }),
    onMutate: async ({ noteId, content }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list(DEFAULT_PARAMS) });
      const previousNotes = queryClient.getQueryData(queryKeys.notes.list(DEFAULT_PARAMS));

      queryClient.setQueryData(queryKeys.notes.list(DEFAULT_PARAMS), (old: unknown) => {
        const notes = Array.isArray(old) ? old : [];
        return notes.map(note =>
          note.noteId === noteId
            ? { ...note, content, updatedAt: new Date().toISOString() }
            : note
        );
      });

      return { previousNotes };
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.list(DEFAULT_PARAMS), context.previousNotes);
      }
      toast.error(error instanceof Error ? error.message : 'Cập nhật ghi chú thất bại');
    },
    onSuccess: () => {
      toast.success('Cập nhật ghi chú thành công');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: examScheduleApi.deleteNote,
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.list(DEFAULT_PARAMS) });
      const previousNotes = queryClient.getQueryData(queryKeys.notes.list(DEFAULT_PARAMS));

      queryClient.setQueryData(queryKeys.notes.list(DEFAULT_PARAMS), (old: unknown) => {
        const notes = Array.isArray(old) ? old : [];
        return notes.filter(note => note.noteId !== noteId);
      });

      return { previousNotes };
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.list(DEFAULT_PARAMS), context.previousNotes);
      }
      toast.error(error instanceof Error ? error.message : 'Xóa ghi chú thất bại');
    },
    onSuccess: () => {
      toast.success('Xóa ghi chú thành công');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });

  return {
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    isError: notesQuery.isError,
    createNote: createMutation.mutateAsync,
    updateNote: updateMutation.mutateAsync,
    deleteNote: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
