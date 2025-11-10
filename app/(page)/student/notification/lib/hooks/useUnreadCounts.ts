import { useState, useEffect, useCallback } from "react";
import { notificationApi } from "@/lib/api/notification";

interface UnreadCounts {
  all: number;
  event: number;
  tuition: number;
  schedule: number;
  important: number;
}

export const useUnreadCounts = (role?: string) => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    all: 0,
    event: 0,
    tuition: 0,
    schedule: 0,
    important: 0
  });

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const response = await notificationApi.getUnreadCountByCategory(role);
      if (response.isSuccess) {
        setUnreadCounts({
          all: response.data.countByCategory.total,
          event: response.data.countByCategory.event,
          tuition: response.data.countByCategory.tuition,
          schedule: response.data.countByCategory.schedule,
          important: response.data.countByCategory.important
        });
      }
    } catch (err: unknown) {
      console.error('Error fetching unread counts:', err);
    }
  }, [role]);

  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  return { unreadCounts, refetchUnreadCounts: fetchUnreadCounts };
};
