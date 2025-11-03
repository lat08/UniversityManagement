import { create } from 'zustand';
import type { RoomApiData } from '../types/room.types';

export type Room = RoomApiData;

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

export type RoomFilters = {
	capacity: string;
	buildingId: string;
	roomType: string;
	roomStatus: string;
};

export type RoomBookingState = {
	rooms: Room[];
	bookingSlots: BookingSlot[];
	selectedDate: string | null;
	selectedTimeSlot: string | null;
	selectedRoom: Room | null;
	filters: RoomFilters;
	tempFilters: RoomFilters;
	isLoading: boolean;
	error: string | null;
};

type RoomBookingActions = {
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	setRooms: (rooms: Room[]) => void;
	setBookingSlots: (slots: BookingSlot[]) => void;
	setSelectedDate: (date: string | null) => void;
	setSelectedTimeSlot: (timeSlot: string | null) => void;
	setSelectedRoom: (room: Room | null) => void;
	setFilters: (filters: Partial<RoomFilters>) => void;
	setTempFilters: (filters: Partial<RoomFilters>) => void;
	applyFilters: () => void;
	clearSelection: () => void;
};

const initialFilters: RoomFilters = {
	capacity: '',
	buildingId: '',
	roomType: '',
	roomStatus: '',
};

const initialState: RoomBookingState = {
	rooms: [],
	bookingSlots: [],
	selectedDate: null,
	selectedTimeSlot: null,
	selectedRoom: null,
	filters: { ...initialFilters },
	tempFilters: { ...initialFilters },
	isLoading: false,
	error: null,
};

export const useRoomBookingStore = create<RoomBookingState & RoomBookingActions>((set) => ({
	...initialState,
	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	setRooms: (rooms) => set({ rooms }),
	setBookingSlots: (bookingSlots) => set({ bookingSlots }),
	setSelectedDate: (selectedDate) => set({ selectedDate }),
	setSelectedTimeSlot: (selectedTimeSlot) => set({ selectedTimeSlot }),
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
			selectedDate: null,
			selectedTimeSlot: null,
			selectedRoom: null,
		}),
}));

