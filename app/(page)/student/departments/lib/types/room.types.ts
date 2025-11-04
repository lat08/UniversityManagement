export interface RoomApiResponse {
  success: boolean;
  message: string;
  data: {
    items: RoomApiData[];
    pageNumber?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
  };
}

export interface RoomApiData {
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
}

// Room Types
export type RoomType = 
  | 'exam'
  | 'lecture_hall'
  | 'classroom'
  | 'computer_lab'
  | 'laboratory'
  | 'meeting_room'
  | 'gym_room'
  | 'swimming_pool'
  | 'music_room'
  | 'art_room'
  | 'library_room'
  | 'self_study_room'
  | 'dorm_room';

export type RoomStatus = 'active' | 'inactive' | 'maintenance';

// Room Type Labels in Vietnamese
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  exam: 'Phòng thi',
  lecture_hall: 'Giảng đường',
  classroom: 'Phòng học',
  computer_lab: 'Phòng máy tính',
  laboratory: 'Phòng thí nghiệm',
  meeting_room: 'Phòng họp',
  gym_room: 'Phòng gym',
  swimming_pool: 'Hồ bơi',
  music_room: 'Phòng âm nhạc',
  art_room: 'Phòng mỹ thuật',
  library_room: 'Phòng thư viện',
  self_study_room: 'Phòng tự học',
  dorm_room: 'Phòng ký túc xá',
};

// Room Status Labels in Vietnamese
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngừng hoạt động',
  maintenance: 'Bảo trì',
};

// Room Type Badge Colors
export const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  exam: 'bg-red-600 text-white',
  lecture_hall: 'bg-purple-600 text-white',
  classroom: 'bg-blue-600 text-white',
  computer_lab: 'bg-cyan-600 text-white',
  laboratory: 'bg-green-600 text-white',
  meeting_room: 'bg-indigo-600 text-white',
  gym_room: 'bg-orange-600 text-white',
  swimming_pool: 'bg-sky-600 text-white',
  music_room: 'bg-pink-600 text-white',
  art_room: 'bg-fuchsia-600 text-white',
  library_room: 'bg-teal-600 text-white',
  self_study_room: 'bg-amber-600 text-white',
  dorm_room: 'bg-slate-600 text-white',
};

// Room Status Badge Colors
export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  active: 'bg-green-600 text-white',
  inactive: 'bg-gray-500 text-white',
  maintenance: 'bg-yellow-600 text-white',
};

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface CreateBookingRequest {
  roomId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  studentCount: number;
}

export interface BookingApiResponse {
  success: boolean;
  message: string;
  data: BookingData[];
}

export interface BookingData {
  bookingId: string;
  bookingCode?: string;
  roomId: string;
  roomName: string;
  roomCode: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  studentCount: number;
  bookingStatus: BookingStatus;
  createdAt: string;
  building: {
    buildingId: string;
    buildingName: string;
    buildingCode: string;
    address: string;
  };
}

// Booking Status Labels
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã hoàn thành',
};

// Booking Status Colors
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-500 text-white',
  confirmed: 'bg-blue-600 text-white',
  cancelled: 'bg-gray-500 text-white',
  completed: 'bg-green-600 text-white',
};

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  data: unknown;
}
