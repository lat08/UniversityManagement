import { api } from '@/lib/api/client';
import type { RoomApiResponse, CreateBookingRequest, BookingApiResponse } from '../types/room.types';

/**
 * Fetch all function rooms
 */
export const fetchRooms = async (): Promise<RoomApiResponse> => {
  try {
    const response = await api.get<RoomApiResponse>('/v1/function-rooms/rooms');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch rooms with filters
 */
export const fetchRoomsWithFilters = async (params: {
  buildingId?: string;
  roomType?: string;
  roomStatus?: string;
  minCapacity?: number;
}): Promise<RoomApiResponse> => {
  try {
    const response = await api.get<RoomApiResponse>('/v1/function-rooms/rooms', {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch room by ID
 */
export const fetchRoomById = async (roomId: string): Promise<RoomApiResponse> => {
  try {
    const response = await api.get<RoomApiResponse>(`/v1/function-rooms/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a room booking
 */
export const createRoomBooking = async (bookingData: CreateBookingRequest): Promise<BookingApiResponse> => {
  try {
    const response = await api.post<BookingApiResponse>('/v1/function-rooms/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel a room booking
 */
interface CancelBookingResponse {
  success: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export const cancelRoomBooking = async (bookingId: string): Promise<CancelBookingResponse> => {
  try {
    const response = await api.put<CancelBookingResponse>(`/v1/function-rooms/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

