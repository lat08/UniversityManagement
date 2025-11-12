import { useSearchParams } from "next/navigation";
import { NotificationReadStatus, NotificationType } from "@/lib/types/notification";

export const useNotificationParams = () => {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const idParam = searchParams.get('id');
  const readStatusParam = searchParams.get('readStatus');

  const getInitialFilter = (): NotificationType => {
    if (typeParam && (typeParam === 'event' || typeParam === 'tuition' || typeParam === 'schedule' || typeParam === 'important')) {
      return typeParam as NotificationType;
    }
    return "all";
  };

  const getInitialReadStatusFilter = (): NotificationReadStatus => {
    if (idParam) {
      return "all";
    }
    
    if (readStatusParam === 'unread' || readStatusParam === 'read') {
      return readStatusParam as NotificationReadStatus;
    }
    return "all";
  };

  return {
    expandedNotificationId: idParam,
    initialFilter: getInitialFilter(),
    initialReadStatusFilter: getInitialReadStatusFilter(),
    notificationIdFromParams: idParam,
    hasNotificationTarget: Boolean(idParam),
  };
};
