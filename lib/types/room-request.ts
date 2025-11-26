/**
 * Types for Admin Room Request Management
 */

export type RoomRequestStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface RoomRequestRecord {
  bookingId: string;
  bookingCode?: string;
  roomId: string;
  roomName: string;
  roomCode: string;
  roomType: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  studentCount: number;
  bookingStatus: RoomRequestStatus;
  createdAt: string;
  updatedAt?: string;
  building: {
    buildingId: string;
    buildingName: string;
    buildingCode: string;
    address?: string;
  };
  bookedByUser: {
    userId: string;
    fullName: string;
    studentCode?: string;
    email?: string;
    className?: string;
  };
  reviewedByUser?: {
    userId: string;
    fullName: string;
  };
  rejectionReason?: string;
  approvalNote?: string;
}

export interface RoomRequestQueryParams {
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
  bookingStatus?: RoomRequestStatus;
  roomType?: string;
  buildingCode?: string;
  bookingDateFrom?: string;
  bookingDateTo?: string;
}

export interface RoomRequestStats {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
  cancelled: number;
}

export interface ApproveRequestPayload {
  note?: string;
}

export interface RejectRequestPayload {
  reason: string;
}

export interface CancelRequestPayload {
  reason: string;
}

export interface BulkApprovePayload {
  bookingIds: string[];
  note?: string;
}

export interface BulkRejectPayload {
  bookingIds: string[];
  reason: string;
}

export interface RoomRequestListResponse {
  items: RoomRequestRecord[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface RoomRequestStatsResponse {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
  cancelled: number;
}






