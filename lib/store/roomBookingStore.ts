import { create } from 'zustand';

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

type RoomBookingActions = {
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	setRooms: (rooms: Room[]) => void;
	setBookingSlots: (slots: BookingSlot[]) => void;
	setUserBookings: (bookings: UserBooking[]) => void;
	setSelectedDate: (date: string | null) => void;
	setSelectedTimeSlot: (timeSlot: string | null) => void;
	setSelectedRoom: (room: Room | null) => void;
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

