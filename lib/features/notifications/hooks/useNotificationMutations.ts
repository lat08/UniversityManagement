import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification";
import { queryKeys } from "@/lib/api/queryKeys";
import { NotificationApiItem } from "@/lib/types/notification";

interface UseNotificationMutationsOptions {
  role?: string;
  onSuccess?: () => void;
}

// Type matching the actual React Query cache structure from API response
interface NotificationListCacheData {
  data: NotificationApiItem[];
  totalPages: number;
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const useNotificationMutations = (options: UseNotificationMutationsOptions = {}) => {
  const { role, onSuccess } = options;
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCounts(role) });

      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ 
        queryKey: queryKeys.notifications.lists() 
      });
      const previousCounts = queryClient.getQueryData(
        queryKeys.notifications.unreadCounts(role)
      );

      // Optimistically update notification lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (old: NotificationListCacheData | undefined) => {
          if (!old?.data || !Array.isArray(old.data)) return old;
          
          return {
            ...old,
            data: old.data.map((notification: NotificationApiItem) =>
              notification.scheduleId === id
                ? { ...notification, isRead: true }
                : notification
            ),
          };
        }
      );

      // Optimistically update unread counts
      queryClient.setQueryData(
        queryKeys.notifications.unreadCounts(role),
        (old: { all: number; event: number; tuition: number; schedule: number; important: number } | undefined) => {
          if (!old || old.all === 0) return old;
          
          // Find notification type to decrement correct counter
          let notificationType: string | null = null;
          queryClient.getQueriesData({ queryKey: queryKeys.notifications.lists() }).forEach(([, data]) => {
            if (data && typeof data === 'object' && 'data' in data) {
              const listData = data as NotificationListCacheData;
              if (Array.isArray(listData.data)) {
                const notif = listData.data.find((n: NotificationApiItem) => n.scheduleId === id);
                if (notif && !notif.isRead) {
                  notificationType = notif.notificationType;
                }
              }
            }
          });

          if (!notificationType) return old;

          return {
            ...old,
            all: Math.max(0, old.all - 1),
            [notificationType]: Math.max(0, (old[notificationType as keyof typeof old] as number) - 1),
          };
        }
      );

      return { previousLists, previousCounts };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousCounts) {
        queryClient.setQueryData(
          queryKeys.notifications.unreadCounts(role),
          context.previousCounts
        );
      }
    },
    onSuccess: () => {
      // Dispatch custom event for header bell
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notifications:updated'));
      }
      onSuccess?.();
    },
    onSettled: () => {
      // Only invalidate to mark as stale, don't refetch automatically
      // This prevents notifications from disappearing when marked as read with "unread" filter
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.lists(),
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.unreadCounts(role),
        refetchType: 'none',
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(role),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      const previousData = {
        lists: queryClient.getQueriesData({ queryKey: queryKeys.notifications.lists() }),
        counts: queryClient.getQueryData(queryKeys.notifications.unreadCounts(role)),
      };

      // Optimistically mark all as read
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (old: NotificationListCacheData | undefined) => {
          if (!old?.data || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((notification: NotificationApiItem) => ({
              ...notification,
              isRead: true,
            })),
          };
        }
      );

      // Set all counts to 0
      queryClient.setQueryData(
        queryKeys.notifications.unreadCounts(role),
        {
          all: 0,
          event: 0,
          tuition: 0,
          schedule: 0,
          important: 0,
        }
      );

      return previousData;
    },
    onError: (_err, _variables, context) => {
      if (context?.lists) {
        context.lists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.counts) {
        queryClient.setQueryData(
          queryKeys.notifications.unreadCounts(role),
          context.counts
        );
      }
    },
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notifications:updated'));
      }
      onSuccess?.();
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all,
        refetchType: 'none',
      });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
