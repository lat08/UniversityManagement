import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/queryKeys';
import { useRoomBookingStore } from '../stores/roomBookingStore';
import type { RoomApiResponse, BookingApiResponse, CreateBookingRequest } from '../types/room.types';
import { createRoomBooking, cancelRoomBooking } from '../api/rooms.api';

export const useRooms = (page: number = 1, pageSize: number = 10) => {
  const setRooms = useRoomBookingStore((state) => state.setRooms);
  const filters = useRoomBookingStore((state) => state.filters);
  
  return useQuery({
    queryKey: queryKeys.roomBooking.rooms.list({ page, pageSize, filters }),
    queryFn: async () => {
      const params: Record<string, string | number> = {
        pageNumber: page,
        pageSize,
      };

      if (filters.capacity) {
        params.minCapacity = Number.parseInt(filters.capacity);
      }
      if (filters.buildingCode) {
        params.buildingCode = filters.buildingCode;
      }
      if (filters.roomType) {
        params.roomType = filters.roomType;
      }
      if (filters.roomStatus) {
        params.roomStatus = filters.roomStatus;
      }

      const response = await api.get<RoomApiResponse>('/v1/function-rooms/rooms', { params });
      
      if (response.data.success && response.data.data.items) {
        const rooms = response.data.data.items;
        setRooms(rooms);
        
        const apiData = response.data.data;
        return {
          rooms,
          pagination: {
            currentPage: apiData.pageNumber || page,
            totalPages: apiData.totalPages || 1,
            totalItems: apiData.totalCount || rooms.length,
            pageSize: apiData.pageSize || pageSize,
          },
        };
      }
      
      return { rooms: [], pagination: undefined };
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });
};



export const useUserBookings = (page: number = 1, pageSize: number = 10) => {
  const filters = useRoomBookingStore((state) => state.filters);
  
  return useQuery({
    queryKey: queryKeys.roomBooking.bookings.my({ page, pageSize, filters }),
    queryFn: async () => {
      const params: Record<string, string | number> = {
        pageNumber: page,
        pageSize,
      };

      if (filters.bookingStatus) {
        params.bookingStatus = filters.bookingStatus;
      }
      if (filters.roomType) {
        params.roomType = filters.roomType;
      }
      if (filters.buildingCode) {
        params.buildingCode = filters.buildingCode;
      }
      if (filters.minStudentCount) {
        params.minStudentCount = Number.parseInt(filters.minStudentCount);
      }
      if (filters.maxStudentCount) {
        params.maxStudentCount = Number.parseInt(filters.maxStudentCount);
      }

      const response = await api.get<BookingApiResponse>('/v1/function-rooms/my-bookings', { params });
      
      if (response.data.success && response.data.data) {
        return {
          bookings: response.data.data.items,
          pagination: {
            currentPage: response.data.data.pageNumber,
            totalPages: response.data.data.totalPages,
            totalItems: response.data.data.totalCount,
            pageSize: response.data.data.pageSize,
          },
        };
      }
      
      return { bookings: [], pagination: undefined };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const clearSelection = useRoomBookingStore((state) => state.clearSelection);

  return useMutation({
    mutationFn: async (bookingData: CreateBookingRequest) => {
      const response = await createRoomBooking(bookingData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomBooking.bookings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.roomBooking.rooms.all() });
      clearSelection();
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError?.response?.data?.message || 'Không thể tạo đăng ký phòng';
      throw new Error(errorMessage);
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await cancelRoomBooking(bookingId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomBooking.bookings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.roomBooking.rooms.all() });
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError?.response?.data?.message || 'Không thể hủy đăng ký';
      throw new Error(errorMessage);
    },
  });
};

