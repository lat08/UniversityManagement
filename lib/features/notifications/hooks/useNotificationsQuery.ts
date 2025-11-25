import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { notificationApi } from "@/lib/api/notification";
import { NotificationQueryParams, NotificationType, NotificationReadStatus } from "@/lib/types/notification";
import { queryKeys } from "@/lib/api/queryKeys";

const PAGE_SIZE = 10;

interface UseNotificationsQueryOptions {
  notificationType: NotificationType;
  readStatus: NotificationReadStatus;
  role?: string;
  searchTerm?: string;
  page?: number;
}

export const useNotificationsQuery = (options: UseNotificationsQueryOptions) => {
  const { notificationType, readStatus, role, searchTerm, page = 1 } = options;
  const queryClient = useQueryClient();
  const translationNamespace = role === "Instructor" ? "instructor.notification" : "student.notification";
  const t = useTranslations(translationNamespace);

  const params: NotificationQueryParams = {
    PageIndex: page,
    PageSize: PAGE_SIZE,
    Role: role,
  };
  
  if (notificationType && notificationType !== "all") {
    params.NotificationType = notificationType;
  }

  if (searchTerm?.trim()) {
    params.SearchTerm = searchTerm.trim();
  }

  if (readStatus !== "all") {
    params.IsRead = readStatus === "read";
  }

  const query = useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: async () => {
      const response = await notificationApi.getNotifications(params);
      
      if (!response.isSuccess) {
        throw new Error(response.resultMessage || t('error.title'));
      }

      // Prefetch next page for smoother pagination
      if (response.data.notifications.hasNextPage) {
        const nextParams = { ...params, PageIndex: page + 1 };
        void queryClient.prefetchQuery({
          queryKey: queryKeys.notifications.list(nextParams),
          queryFn: async () => {
            const nextResponse = await notificationApi.getNotifications(nextParams);
            return nextResponse.data.notifications; // Return processed data, not raw response
          },
        });
      }

      return response.data.notifications;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes for notification list
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Always get fresh on focus
    retry: 2,
  });

  return {
    notifications: Array.isArray(query.data?.data) ? query.data.data : [],
    totalPages: query.data?.totalPages ?? 1,
    totalCount: query.data?.totalCount ?? 0,
    currentPage: query.data?.page ?? page,
    pageSize: PAGE_SIZE,
    hasNextPage: query.data?.hasNextPage ?? false,
    hasPreviousPage: query.data?.hasPreviousPage ?? false,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
};
