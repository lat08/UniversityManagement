"use client";

import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export function useThemeSignalR() {
  const { loadThemes, setCurrentTheme } = useThemeStore();

  useEffect(() => {
    let connection: HubConnection | null = null;

    const startConnection = async () => {
      try {
        // Create SignalR connection
        // Use the same base URL as the API client
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5001/edu/api';
        // Extract the base URL without the /edu/api path for SignalR
        const backendUrl = apiBaseUrl.replace('/edu/api', '');
        
        connection = new HubConnectionBuilder()
          .withUrl(`${backendUrl}/edu/api/theme-hub`, {
            // Skip negotiation and use WebSockets directly for better performance
            skipNegotiation: false,
            withCredentials: true, // Include credentials for CORS
          }) // SignalR hub endpoint
          .configureLogging(LogLevel.Information)
          .withAutomaticReconnect([0, 2000, 5000, 10000]) // Retry delays
          .build();

        // Start connection
        await connection.start();

        // Listen for theme updates
        connection.on('ReceiveThemeUpdate', (themeData: { themes?: unknown[]; type?: string; theme?: unknown }) => {
          // Update themes in store
          if (themeData.themes) {
            loadThemes(themeData.themes as never);
          }
          
          // If this is a theme update with theme object, apply it
          if (themeData.theme) {
            setCurrentTheme(themeData.theme as never);
          }
        });

        // Listen for theme configuration changes
        connection.on('ReceiveThemeConfigUpdate', (configData: unknown) => {
          // Reload themes from server if needed
          void configData;
        });

        // Join theme group (for receiving updates)
        await connection.invoke('JoinThemeGroup');
        
      } catch (error) {
        // Silently handle connection errors
        void error;
      }
    };

    const stopConnection = async () => {
      if (connection) {
        try {
          await connection.invoke('LeaveThemeGroup');
          await connection.stop();
        } catch (error) {
          // Silently handle disconnection errors
          void error;
        }
      }
    };

    // Start connection on mount
    startConnection();

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

