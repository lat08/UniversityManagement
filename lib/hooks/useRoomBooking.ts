import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoomBookingStore, type Room, type BookingSlot, type UserBooking } from '../store/roomBookingStore';

// Mock data - sẽ thay thế bằng API calls thực tế
const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Phòng máy tính 1',
    capacity: 40,
    location: 'Tòa Lewis',
    status: 'available',
    equipment: ['Máy tính', 'Máy chiếu', 'Bảng trắng'],
    description: 'Phòng máy tính hiện đại với 40 máy tính'
  },
  {
    id: '2',
    name: 'Phòng thí nghiệm',
    capacity: 20,
    location: 'Tòa Lewis',
    status: 'available',
    equipment: ['Thiết bị thí nghiệm', 'Máy chiếu', 'Bảng trắng'],
    description: 'Phòng thí nghiệm với đầy đủ thiết bị'
  },
  {
    id: '3',
    name: 'Phòng họp lớn',
    capacity: 100,
    location: 'Tòa Lewis',
    status: 'full',
    equipment: ['Thiết bị âm thanh', 'Máy chiếu', 'Bảng trắng'],
    description: 'Phòng họp lớn cho các sự kiện'
  }
];

const mockUserBookings: UserBooking[] = [
  {
    id: '1',
    roomId: '1',
    roomName: 'Phòng học nhóm 1',
    date: '2025-10-10',
    startTime: '13:30',
    endTime: '15:00',
    status: 'confirmed',
    studentCount: 10
  }
];

// Query keys
export const roomBookingKeys = {
  all: ['roomBooking'] as const,
  rooms: () => [...roomBookingKeys.all, 'rooms'] as const,
  bookingSlots: (date?: string) => [...roomBookingKeys.all, 'bookingSlots', date] as const,
  userBookings: () => [...roomBookingKeys.all, 'userBookings'] as const,
};

// Hooks
export const useRooms = () => {
  const setRooms = useRoomBookingStore((state) => state.setRooms);
  
  return useQuery({
    queryKey: roomBookingKeys.rooms(),
    queryFn: async (): Promise<Room[]> => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setRooms(mockRooms);
      return mockRooms;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBookingSlots = (date?: string) => {
  const setBookingSlots = useRoomBookingStore((state) => state.setBookingSlots);
  
  return useQuery({
    queryKey: roomBookingKeys.bookingSlots(date),
    queryFn: async (): Promise<BookingSlot[]> => {
      // Mock API call
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
  const setUserBookings = useRoomBookingStore((state) => state.setUserBookings);
  
  return useQuery({
    queryKey: roomBookingKeys.userBookings(),
    queryFn: async (): Promise<UserBooking[]> => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 400));
      setUserBookings(mockUserBookings);
      return mockUserBookings;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Mutations
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const setLoading = useRoomBookingStore((state) => state.setLoading);
  const setError = useRoomBookingStore((state) => state.setError);
  const addUserBooking = useRoomBookingStore((state) => state.addUserBooking);

  return useMutation({
    mutationFn: async (bookingData: Omit<UserBooking, 'id' | 'status'>) => {
      setLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBooking: UserBooking = {
        ...bookingData,
        id: Date.now().toString(),
        status: 'confirmed'
      };
      
      addUserBooking(newBooking);
      return newBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomBookingKeys.userBookings() });
      queryClient.invalidateQueries({ queryKey: roomBookingKeys.bookingSlots() });
      setLoading(false);
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const setLoading = useRoomBookingStore((state) => state.setLoading);
  const setError = useRoomBookingStore((state) => state.setError);
  const removeUserBooking = useRoomBookingStore((state) => state.removeUserBooking);

  return useMutation({
    mutationFn: async (bookingId: string) => {
      setLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      removeUserBooking(bookingId);
      return bookingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomBookingKeys.userBookings() });
      queryClient.invalidateQueries({ queryKey: roomBookingKeys.bookingSlots() });
      setLoading(false);
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    },
  });
};

