import { useState, useCallback } from "react";
import { notificationApi } from "@/lib/api/notification";

export const useMarkAllAsRead = () => {
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  const markAllAsRead = useCallback(async () => {
    try {
      setMarkingAllAsRead(true);
      const response = await notificationApi.markAllAsRead();
      
      if (response.isSuccess) {
        return true;
      }
      return false;
    } catch (err: unknown) {
      console.error('Error marking all as read:', err);
      return false;
    } finally {
      setMarkingAllAsRead(false);
    }
  }, []);

  return { markingAllAsRead, markAllAsRead };
};
