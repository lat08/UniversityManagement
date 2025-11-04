import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { NotificationType } from "@/lib/types/notification";

export const useNotificationParams = () => {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const idParam = searchParams.get('id');
  
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (idParam) {
      setExpandedNotificationId(idParam);
    }
  }, [idParam]);

  const getInitialFilter = (): NotificationType => {
    if (typeParam && (typeParam === 'event' || typeParam === 'tuition' || typeParam === 'schedule' || typeParam === 'important')) {
      return typeParam as NotificationType;
    }
    return "all";
  };

  return {
    expandedNotificationId,
    initialFilter: getInitialFilter(),
    notificationIdFromParams: idParam
  };
};
