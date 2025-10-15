import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Room = {
  id: string;
  name: string;
  capacity: number;
  location: string;
  status: 'available' | 'occupied' | 'full';
  equipment: string[];
  description?: string;
};

export type BookingSlot = {
  id: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  studentCount: number;
  maxCapacity: number;
  status: 'available' | 'booked' | 'cancelled';
};

export type UserBooking = {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  studentCount: number;
};

export type RoomBookingState = {
  rooms: Room[];
  bookingSlots: BookingSlot[];
  userBookings: UserBooking[];
  selectedDate: string | null;
  selectedTimeSlot: string | null;
  selectedRoom: Room | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: RoomBookingState = {
  rooms: [],
  bookingSlots: [],
  userBookings: [],
  selectedDate: null,
  selectedTimeSlot: null,
  selectedRoom: null,
  isLoading: false,
  error: null,
};

const roomBookingSlice = createSlice({
  name: 'roomBooking',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
    },
    setBookingSlots: (state, action: PayloadAction<BookingSlot[]>) => {
      state.bookingSlots = action.payload;
    },
    setUserBookings: (state, action: PayloadAction<UserBooking[]>) => {
      state.userBookings = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    setSelectedTimeSlot: (state, action: PayloadAction<string | null>) => {
      state.selectedTimeSlot = action.payload;
    },
    setSelectedRoom: (state, action: PayloadAction<Room | null>) => {
      state.selectedRoom = action.payload;
    },
    addUserBooking: (state, action: PayloadAction<UserBooking>) => {
      state.userBookings.push(action.payload);
    },
    updateUserBooking: (state, action: PayloadAction<{ id: string; updates: Partial<UserBooking> }>) => {
      const index = state.userBookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.userBookings[index] = { ...state.userBookings[index], ...action.payload.updates };
      }
    },
    removeUserBooking: (state, action: PayloadAction<string>) => {
      state.userBookings = state.userBookings.filter(booking => booking.id !== action.payload);
    },
    clearSelection: (state) => {
      state.selectedDate = null;
      state.selectedTimeSlot = null;
      state.selectedRoom = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setRooms,
  setBookingSlots,
  setUserBookings,
  setSelectedDate,
  setSelectedTimeSlot,
  setSelectedRoom,
  addUserBooking,
  updateUserBooking,
  removeUserBooking,
  clearSelection,
} = roomBookingSlice.actions;

export default roomBookingSlice.reducer;

