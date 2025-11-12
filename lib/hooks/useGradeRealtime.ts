import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { queryKeys } from '@/lib/api/queryKeys';
import { useAuthStore } from '@/lib/store/authStore';

interface GradeRealtimeEvent {
  courseClassId: string;
  versionNumber?: number;
  message?: string;
}

export const useGradeRealtime = (courseClassId?: string) => {
  const queryClient = useQueryClient();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const { accessToken } = useAuthStore();

  const handleGradeUpdated = useCallback((event: GradeRealtimeEvent) => {
    if (!courseClassId || event.courseClassId !== courseClassId) return;

    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.grades(event.courseClassId, 'draft'),
    });
  }, [courseClassId, queryClient]);

  const handleGradeSubmitted = useCallback((event: GradeRealtimeEvent) => {
    if (!courseClassId || event.courseClassId !== courseClassId) return;

    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.grades(event.courseClassId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.history(event.courseClassId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.courseClasses(),
    });

    toast.success(event.message || 'Bảng điểm đã được gửi duyệt');
  }, [courseClassId, queryClient]);

  const handleGradeApproved = useCallback((event: GradeRealtimeEvent) => {
    if (!courseClassId || event.courseClassId !== courseClassId) return;

    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.grades(event.courseClassId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.history(event.courseClassId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.courseClasses(),
    });

    toast.success(event.message || 'Bảng điểm đã được duyệt');
  }, [courseClassId, queryClient]);

  const handleGradeRejected = useCallback((event: GradeRealtimeEvent) => {
    if (!courseClassId || event.courseClassId !== courseClassId) return;

    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.grades(event.courseClassId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.history(event.courseClassId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.instructorGrades.courseClasses(),
    });

    toast.error(event.message || 'Bảng điểm đã bị từ chối');
  }, [courseClassId, queryClient]);

  const connectWithExponentialBackoff = useCallback(async () => {
    if (!accessToken) return;

    try {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/edu/api', '')}/gradeHub`, {
          accessTokenFactory: () => accessToken,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= maxReconnectAttempts) {
              return null;
            }
            return Math.min(
              baseReconnectDelay * Math.pow(2, retryContext.previousRetryCount),
              30000
            );
          },
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connection.on('GradeUpdated', handleGradeUpdated);
      connection.on('GradeSubmitted', handleGradeSubmitted);
      connection.on('GradeApproved', handleGradeApproved);
      connection.on('GradeRejected', handleGradeRejected);

      connection.onreconnecting(() => {
        reconnectAttemptsRef.current += 1;
      });

      connection.onreconnected(() => {
        reconnectAttemptsRef.current = 0;
        if (courseClassId) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.instructorGrades.grades(courseClassId),
          });
        }
      });

      connection.onclose(() => {
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWithExponentialBackoff();
          }, delay);
        }
      });

      await connection.start();
      connectionRef.current = connection;
      reconnectAttemptsRef.current = 0;
    } catch {
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connectWithExponentialBackoff();
        }, delay);
      }
    }
  }, [
    accessToken,
    courseClassId,
    handleGradeUpdated,
    handleGradeSubmitted,
    handleGradeApproved,
    handleGradeRejected,
    queryClient,
  ]);

  useEffect(() => {
    connectWithExponentialBackoff();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [connectWithExponentialBackoff]);

  return {
    isConnected: connectionRef.current?.state === signalR.HubConnectionState.Connected,
  };
};
