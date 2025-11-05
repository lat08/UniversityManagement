import { api } from '@/lib/api/client';
import type { 
  CreateBookingRequest, 
  BookingApiResponse, 
  CancelBookingResponse,
  RoomAvailabilityResponse 
} from '../types/room.types';

export const createRoomBooking = async (bookingData: CreateBookingRequest): Promise<BookingApiResponse> => {
  const response = await api.post<BookingApiResponse>('/v1/function-rooms/bookings', bookingData);
  return response.data;
};

export const cancelRoomBooking = async (bookingId: string): Promise<CancelBookingResponse> => {
  const response = await api.put<CancelBookingResponse>(`/v1/function-rooms/bookings/${bookingId}/cancel`);
  return response.data;
};

export const getRoomAvailability = async (roomId: string, date: string): Promise<RoomAvailabilityResponse> => {
  const response = await api.get<RoomAvailabilityResponse>(
    `/v1/function-rooms/rooms/${roomId}/availability`,
    { params: { date } }
  );
  return response.data;
};
