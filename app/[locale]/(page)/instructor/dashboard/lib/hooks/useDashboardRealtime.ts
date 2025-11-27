"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { DashboardResponse } from "../types/types";

interface SignalRDashboardEvent {
  type: 'reminder' | 'schedule' | 'stats';
  data?: Partial<DashboardResponse>;
}

interface UseDashboardRealtimeOptions {
  enabled?: boolean;
}

export const useDashboardRealtime = (options: UseDashboardRealtimeOptions = {}) => {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleDashboardEvent = (event: SignalRDashboardEvent) => {
      switch (event.type) {
        case 'reminder': {
          if (event.data?.reminders) {
            queryClient.setQueryData<DashboardResponse>(
              queryKeys.dashboard.instructor(),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  reminders: event.data!.reminders!,
                };
              }
            );
          }
          break;
        }

        case 'schedule': {
          if (event.data?.weeklySchedule) {
            queryClient.setQueryData<DashboardResponse>(
              queryKeys.dashboard.instructor(),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  weeklySchedule: event.data!.weeklySchedule!,
                };
              }
            );
          }
          break;
        }

        case 'stats': {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.dashboard.instructor(),
          });
          break;
        }
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SignalRDashboardEvent>;
      handleDashboardEvent(customEvent.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('dashboard:signalr:event', handleCustomEvent);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('dashboard:signalr:event', handleCustomEvent);
      }
    };
  }, [enabled, queryClient]);

  return {
    isConnected: true,
    reconnectAttempts: reconnectAttempts.current,
  };
};
