"use client";

import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export function useThemeSignalR() {
  const { loadThemes, setCurrentTheme } = useThemeStore();

  useEffect(() => {
    let connection: HubConnection | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const startConnection = async () => {
      try {
        const signalREnabled = process.env.NEXT_PUBLIC_ENABLE_SIGNALR !== 'false';
        if (!signalREnabled) return;

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5001/edu/api';
        const backendUrl = apiBaseUrl.replace('/edu/api', '');
        
        connection = new HubConnectionBuilder()
          .withUrl(`${backendUrl}/edu/api/theme-hub`, {
            skipNegotiation: false,
            withCredentials: true,
            transport: 1,
          })
          .configureLogging(LogLevel.Error)
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              if (retryContext.previousRetryCount < 3) {
                return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount + 1), 10000);
              }
              return null;
            }
          })
          .build();

        connection.onreconnected(() => {
          connection?.invoke('JoinThemeGroup').catch(() => {});
        });

        connection.onclose(() => {});

        await connection.start();

        connection.on('ReceiveThemeUpdate', (themeData: { themes?: unknown[]; type?: string; theme?: unknown }) => {
          try {
            if (themeData.themes) loadThemes(themeData.themes as never);
            if (themeData.theme) setCurrentTheme(themeData.theme as never);
          } catch {
            // Silently handle errors
          }
        });

        connection.on('ReceiveThemeConfigUpdate', () => {
          // Reserved for future use
        });

        await connection.invoke('JoinThemeGroup');
        
      } catch {
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            if (!connection || connection.state === 'Disconnected') {
              startConnection().catch(() => {});
            }
          }, 5000);
        }
      }
    };

    const stopConnection = async () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      if (connection) {
        try {
          if (connection.state === 'Connected') {
            await connection.invoke('LeaveThemeGroup').catch(() => {});
          }
          await connection.stop().catch(() => {});
        } catch {
          // Silently handle errors
        }
        connection = null;
      }
    };

    // Start connection on mount
    startConnection().catch(() => {
      // Error already handled in startConnection
    });

    // Cleanup on unmount
    return () => {
      stopConnection();
    };
  }, [loadThemes, setCurrentTheme]);

  return {
    // You can expose connection methods here if needed
    isConnected: false, // This would be managed by state if needed
  };
}

