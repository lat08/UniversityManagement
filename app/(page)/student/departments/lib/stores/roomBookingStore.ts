import { create } from 'zustand';
import type { RoomType, RoomStatus } from '../types/room.types';

export type Room = {
	roomId: string;
	roomCode: string;
	roomName: string;
	capacity: number;
	roomType: RoomType;
	roomStatus: RoomStatus;
	imageUrl: string | null;
	building: {
		buildingId: string;
		buildingName: string;
		buildingCode: string;
		address: string;
	};
	amenities: {
		amenityId: string;
		amenityName: string;
	}[];
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

export type RoomFilters = {
	capacity: string;
	buildingId: string;
	roomType: string;
	roomStatus: string;
};

export type RoomBookingState = {
	rooms: Room[];
	bookingSlots: BookingSlot[];
	userBookings: UserBooking[];
	selectedDate: string | null;
	selectedTimeSlot: string | null;
	selectedRoom: Room | null;
	filters: RoomFilters;
	isLoading: boolean;
	error: string | null;
};

type RoomBookingActions = {
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	setRooms: (rooms: Room[]) => void;
	setBookingSlots: (slots: BookingSlot[]) => void;
	setUserBookings: (bookings: UserBooking[]) => void;
	setSelectedDate: (date: string | null) => void;
	setSelectedTimeSlot: (timeSlot: string | null) => void;
	setSelectedRoom: (room: Room | null) => void;
	setFilters: (filters: Partial<RoomFilters>) => void;
	addUserBooking: (booking: UserBooking) => void;
	updateUserBooking: (id: string, updates: Partial<UserBooking>) => void;
	removeUserBooking: (id: string) => void;
	clearSelection: () => void;
};

const initialState: RoomBookingState = {
	rooms: [],
	bookingSlots: [],
	userBookings: [],
	selectedDate: null,
	selectedTimeSlot: null,
	selectedRoom: null,
	filters: {
		capacity: '',
		buildingId: '',
		roomType: '',
		roomStatus: '',
	},
	isLoading: false,
	error: null,
};

export const useRoomBookingStore = create<RoomBookingState & RoomBookingActions>((set) => ({
	...initialState,
	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	setRooms: (rooms) => set({ rooms }),
	setBookingSlots: (bookingSlots) => set({ bookingSlots }),
	setUserBookings: (userBookings) => set({ userBookings }),
	setSelectedDate: (selectedDate) => set({ selectedDate }),
	setSelectedTimeSlot: (selectedTimeSlot) => set({ selectedTimeSlot }),
	setSelectedRoom: (selectedRoom) => set({ selectedRoom }),
	setFilters: (newFilters) =>
		set((state) => ({
			filters: { ...state.filters, ...newFilters },
		})),
	addUserBooking: (booking) =>
		set((state) => ({
			userBookings: [...state.userBookings, booking],
		})),
	updateUserBooking: (id, updates) =>
		set((state) => ({
			userBookings: state.userBookings.map((booking) =>
				booking.id === id ? { ...booking, ...updates } : booking
			),
		})),
	removeUserBooking: (id) =>
		set((state) => ({
			userBookings: state.userBookings.filter((booking) => booking.id !== id),
		})),
	clearSelection: () =>
		set({
			selectedDate: null,
			selectedTimeSlot: null,
			selectedRoom: null,
		}),
}));

