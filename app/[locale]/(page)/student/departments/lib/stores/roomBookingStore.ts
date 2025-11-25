import { create } from 'zustand';
import type { RoomApiData } from '../types/room.types';

export type Room = RoomApiData;

export type RoomFilters = {
  capacity: string;
  buildingCode: string;
  roomType: string;
  roomStatus: string;
  bookingStatus: string;
  minStudentCount: string;
  maxStudentCount: string;
};

export type RoomBookingState = {
  rooms: Room[];
  selectedRoom: Room | null;
  filters: RoomFilters;
  tempFilters: RoomFilters;
};

type RoomBookingActions = {
  setRooms: (rooms: Room[]) => void;
  setSelectedRoom: (room: Room | null) => void;
  setFilters: (filters: Partial<RoomFilters>) => void;
  setTempFilters: (filters: Partial<RoomFilters>) => void;
  applyFilters: () => void;
  clearSelection: () => void;
};

const initialFilters: RoomFilters = {
  capacity: '',
  buildingCode: '',
  roomType: '',
  roomStatus: '',
  bookingStatus: '',
  minStudentCount: '',
  maxStudentCount: '',
};

const initialState: RoomBookingState = {
  rooms: [],
  selectedRoom: null,
  filters: { ...initialFilters },
  tempFilters: { ...initialFilters },
};

export const useRoomBookingStore = create<RoomBookingState & RoomBookingActions>((set) => ({
  ...initialState,
  setRooms: (rooms) => set({ rooms }),
  setSelectedRoom: (selectedRoom) => set({ selectedRoom }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setTempFilters: (newFilters) =>
    set((state) => ({
      tempFilters: { ...state.tempFilters, ...newFilters },
    })),
  applyFilters: () =>
    set((state) => ({
      filters: { ...state.tempFilters },
    })),
  clearSelection: () =>
    set({
      selectedRoom: null,
    }),
}));

