import { useState, useCallback } from "react";
import { notificationApi } from "@/lib/api/notification";

export const useMarkAllAsRead = (role?: string) => {
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  const markAllAsRead = useCallback(async () => {
    try {
      setMarkingAllAsRead(true);
      const response = await notificationApi.markAllAsRead(role);
      
      if (response.isSuccess) {
        // Notify other parts of the app (e.g., header bell) to refresh unread count
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notifications:updated', { detail: { source: 'markAllAsRead', role: response.data.role } }))
        }
        return true;
      }
      return false;
    } catch (err: unknown) {
      console.error('Error marking all as read:', err);
      return false;
    } finally {
      setMarkingAllAsRead(false);
    }
  }, [role]);

  return { markingAllAsRead, markAllAsRead };
};
