import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification";
import { queryKeys } from "@/lib/api/queryKeys";

export interface UnreadCounts {
  all: number;
  event: number;
  tuition: number;
  schedule: number;
  important: number;
}

export const useUnreadCounts = (role?: string) => {
  const query = useQuery({
    queryKey: queryKeys.notifications.unreadCounts(role),
    queryFn: async () => {
      const response = await notificationApi.getUnreadCountByCategory(role);
      
      if (!response.isSuccess) {
        throw new Error("Failed to fetch unread counts");
      }

      return {
        all: response.data.countByCategory.total,
        event: response.data.countByCategory.event,
        tuition: response.data.countByCategory.tuition,
        schedule: response.data.countByCategory.schedule,
        important: response.data.countByCategory.important,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: {
      all: 0,
      event: 0,
      tuition: 0,
      schedule: 0,
      important: 0,
    },
  });

  return { 
    unreadCounts: query.data ?? {
      all: 0,
      event: 0,
      tuition: 0,
      schedule: 0,
      important: 0,
    },
    isLoading: query.isPending,
    isFetching: query.isFetching,
    refetchUnreadCounts: query.refetch,
  };
};
