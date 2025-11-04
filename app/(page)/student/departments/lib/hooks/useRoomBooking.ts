import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useRoomBookingStore, type BookingSlot } from '../stores/roomBookingStore';
import type { RoomApiResponse, BookingApiResponse, BookingData, CreateBookingRequest } from '../types/room.types';
import { createRoomBooking, cancelRoomBooking } from '../api/rooms.api';

// Query keys
export const roomBookingKeys = {
  all: ['roomBooking'] as const,
  rooms: (page?: number, pageSize?: number) => [...roomBookingKeys.all, 'rooms', page, pageSize] as const,
  bookingSlots: (date?: string) => [...roomBookingKeys.all, 'bookingSlots', date] as const,
  userBookings: () => [...roomBookingKeys.all, 'userBookings'] as const,
};

// Hooks
export const useRooms = (page: number = 1, pageSize: number = 10) => {
  const setRooms = useRoomBookingStore((state) => state.setRooms);
  const filters = useRoomBookingStore((state) => state.filters);
  
  return useQuery({
    queryKey: [...roomBookingKeys.rooms(page, pageSize), filters],
    queryFn: async () => {
      try {
        // Build params with filters
        const params: Record<string, string | number> = {
          pageNumber: page,
          pageSize: pageSize,
        };

        // Add filters to params
        if (filters.capacity) {
          params.minCapacity = Number.parseInt(filters.capacity);
        }
        if (filters.buildingId) {
          params.buildingId = filters.buildingId;
        }
        if (filters.roomType) {
          params.roomType = filters.roomType;
        }
        if (filters.roomStatus) {
          params.roomStatus = filters.roomStatus;
        }

        const response = await api.get<RoomApiResponse>('/v1/function-rooms/rooms', {
          params,
        });
        
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
      } catch (error) {
        console.error('Error fetching rooms:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBookingSlots = (date?: string) => {
  const setBookingSlots = useRoomBookingStore((state) => state.setBookingSlots);
  
  return useQuery({
    queryKey: roomBookingKeys.bookingSlots(date),
    queryFn: async (): Promise<BookingSlot[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockSlots: BookingSlot[] = [
        {
          id: '1',
          roomId: '1',
          date: date || '2025-10-14',
          startTime: '08:00',
          endTime: '10:00',
          studentCount: 0,
          maxCapacity: 40,
          status: 'available'
        },
        {
          id: '2',
          roomId: '1',
          date: date || '2025-10-14',
          startTime: '10:00',
          endTime: '12:00',
          studentCount: 25,
          maxCapacity: 40,
          status: 'available'
        }
      ];
      setBookingSlots(mockSlots);
      return mockSlots;
    },
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserBookings = () => {
  return useQuery({
    queryKey: roomBookingKeys.userBookings(),
    queryFn: async (): Promise<BookingData[]> => {
      try {
        const response = await api.get<BookingApiResponse>('/v1/function-rooms/my-bookings');
        
        if (response.data.success && response.data.data) {
          const bookings = response.data.data;
          // Sort by created date, newest first
          bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return bookings;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Mutations
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const setLoading = useRoomBookingStore((state) => state.setLoading);
  const setError = useRoomBookingStore((state) => state.setError);

  return useMutation({
    mutationFn: async (bookingData: CreateBookingRequest) => {
      setLoading(true);
      try {
        const response = await createRoomBooking(bookingData);
        return response;
      } catch (error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        const errorMessage = apiError?.response?.data?.message || 'Không thể tạo đăng ký phòng';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomBookingKeys.userBookings() });
      queryClient.invalidateQueries({ queryKey: roomBookingKeys.bookingSlots() });
      setLoading(false);
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const setLoading = useRoomBookingStore((state) => state.setLoading);
  const setError = useRoomBookingStore((state) => state.setError);

  return useMutation({
    mutationFn: async (bookingId: string) => {
      setLoading(true);
      try {
        const response = await cancelRoomBooking(bookingId);
        return response;
      } catch (error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        const errorMessage = apiError?.response?.data?.message || 'Không thể hủy đăng ký';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomBookingKeys.userBookings() });
      queryClient.invalidateQueries({ queryKey: roomBookingKeys.bookingSlots() });
      setLoading(false);
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
    },
  });
};

