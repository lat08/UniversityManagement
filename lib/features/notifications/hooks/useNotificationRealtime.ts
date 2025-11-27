import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { NotificationApiItem } from "@/lib/types/notification";

interface SignalRNotificationEvent {
  type: 'new' | 'read' | 'deleted';
  notificationId?: string;
  notification?: NotificationApiItem;
  role?: string;
}

interface UseNotificationRealtimeOptions {
  role?: string;
  enabled?: boolean;
}

/**
 * Hook for real-time notification updates via SignalR
 * Syncs with React Query cache for instant UI updates
 */
export const useNotificationRealtime = (options: UseNotificationRealtimeOptions = {}) => {
  const { role, enabled = true } = options;
  const queryClient = useQueryClient();
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // TODO: Initialize SignalR connection
    // const connection = new HubConnectionBuilder()
    //   .withUrl("/notificationHub")
    //   .withAutomaticReconnect({
    //     nextRetryDelayInMilliseconds: () => {
    //       reconnectAttempts.current++;
    //       if (reconnectAttempts.current > maxReconnectAttempts) return null;
    //       return Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    //     }
    //   })
    //   .build();

    const handleNotificationEvent = (event: SignalRNotificationEvent) => {
      switch (event.type) {
        case 'new': {
          // Invalidate list to show new notification
          void queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.lists(),
          });
          
          // Update unread counts optimistically
          queryClient.setQueryData(
            queryKeys.notifications.unreadCounts(role),
            (old: { all: number; event: number; tuition: number; schedule: number; important: number } | undefined) => {
              if (!old || !event.notification) return old;
              
              const notifType = event.notification.notificationType;
              return {
                ...old,
                all: old.all + 1,
                [notifType]: (old[notifType as keyof typeof old] as number) + 1,
              };
            }
          );
          
          // Dispatch custom event for header bell
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('notifications:realtime:new', { 
              detail: event 
            }));
          }
          break;
        }
        
        case 'read': {
          // Update notification in cache
          if (event.notificationId) {
            queryClient.setQueriesData(
              { queryKey: queryKeys.notifications.lists() },
              (old: { data: NotificationApiItem[] } | undefined) => {
                if (!old?.data) return old;
                
                return {
                  ...old,
                  data: old.data.map((notification) =>
                    notification.scheduleId === event.notificationId
                      ? { ...notification, isRead: true }
                      : notification
                  ),
                };
              }
            );
            
            // Update unread counts
            void queryClient.invalidateQueries({
              queryKey: queryKeys.notifications.unreadCounts(role),
            });
          }
          break;
        }
        
        case 'deleted': {
          // Remove from cache
          if (event.notificationId) {
            queryClient.setQueriesData(
              { queryKey: queryKeys.notifications.lists() },
              (old: { data: NotificationApiItem[] } | undefined) => {
                if (!old?.data) return old;
                
                return {
                  ...old,
                  data: old.data.filter(n => n.scheduleId !== event.notificationId),
                };
              }
            );
          }
          break;
        }
      }
    };

    // TODO: Register SignalR event handlers
    // connection.on('NotificationReceived', handleNotificationEvent);
    // connection.on('NotificationRead', handleNotificationEvent);
    // connection.on('NotificationDeleted', handleNotificationEvent);

    // TODO: Start connection
    // connection.start()
    //   .then(() => {
    //     reconnectAttempts.current = 0;
    //   })
    //   .catch(err => {
    //     // Handle connection error
    //   });

    // Fallback: Listen to custom window events from other sources
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SignalRNotificationEvent>;
      handleNotificationEvent(customEvent.detail);
    };

    window.addEventListener('notifications:signalr:event', handleCustomEvent);

    return () => {
      // TODO: Cleanup SignalR
      // connection.stop();
      window.removeEventListener('notifications:signalr:event', handleCustomEvent);
    };
  }, [enabled, role, queryClient]);

  return {
    isConnected: true, // TODO: Return actual connection state
    reconnectAttempts: reconnectAttempts.current,
  };
};
