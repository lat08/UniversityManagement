import { api } from '@/lib/api/client';
import type { RoomApiResponse, CreateBookingRequest, BookingApiResponse, CancelBookingResponse } from '../types/room.types';
export const createRoomBooking = async (bookingData: CreateBookingRequest): Promise<BookingApiResponse> => {
  const response = await api.post<BookingApiResponse>('/v1/function-rooms/bookings', bookingData);
  return response.data;
};

export const cancelRoomBooking = async (bookingId: string): Promise<CancelBookingResponse> => {
  const response = await api.put<CancelBookingResponse>(`/v1/function-rooms/bookings/${bookingId}/cancel`);
  return response.data;
};

