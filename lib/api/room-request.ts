/**
 * @fileoverview API functions for Admin Room Request Management
 */

import { api } from './client';
import type {
  RoomRequestQueryParams,
  RoomRequestRecord,
  RoomRequestStats,
  ApproveRequestPayload,
  RejectRequestPayload,
  CancelRequestPayload,
  BulkApprovePayload,
  BulkRejectPayload,
  RoomRequestListResponse,
  RoomRequestStatsResponse,
} from '@/lib/types/room-request';

/**
 * @api GET /v1/function-rooms/admin/bookings
 * @description Get list of all room requests with filters and pagination
 * @param {RoomRequestQueryParams} params - Query parameters
 * @returns {Promise<RoomRequestListResponse>} List of room requests
 * @auth Required (Admin)
 */
export const getRoomRequests = async (
  params: RoomRequestQueryParams,
): Promise<RoomRequestListResponse> => {
  const response = await api.get<{ success: boolean; data: RoomRequestListResponse }>(
    '/v1/function-rooms/admin/bookings',
    { params },
  );
  return response.data.data;
};

/**
 * @api GET /v1/function-rooms/admin/bookings/stats
 * @description Get room request statistics
 * @returns {Promise<RoomRequestStats>} Statistics data
 * @auth Required (Admin)
 */
export const getRoomRequestStats = async (): Promise<RoomRequestStats> => {
  const response = await api.get<{ success: boolean; data: RoomRequestStatsResponse }>(
    '/v1/function-rooms/admin/bookings/stats',
  );
  return response.data.data;
};

/**
 * @api GET /v1/function-rooms/admin/bookings/{id}
 * @description Get room request detail by ID
 * @param {string} id - Booking ID
 * @returns {Promise<RoomRequestRecord>} Room request detail
 * @auth Required (Admin)
 */
export const getRoomRequestDetail = async (id: string): Promise<RoomRequestRecord> => {
  const response = await api.get<{ success: boolean; data: RoomRequestRecord }>(
    `/v1/function-rooms/admin/bookings/${id}`,
  );
  return response.data.data;
};

/**
 * @api PUT /v1/function-rooms/admin/bookings/{id}/approve
 * @description Approve a room request
 * @param {string} id - Booking ID
 * @param {ApproveRequestPayload} payload - Approval payload with optional note
 * @returns {Promise<void>}
 * @auth Required (Admin)
 */
export const approveRoomRequest = async (
  id: string,
  payload: ApproveRequestPayload,
): Promise<void> => {
  await api.put(`/v1/function-rooms/admin/bookings/${id}/approve`, payload);
};

/**
 * @api PUT /v1/function-rooms/admin/bookings/{id}/reject
 * @description Reject a room request
 * @param {string} id - Booking ID
 * @param {RejectRequestPayload} payload - Rejection payload with required reason
 * @returns {Promise<void>}
 * @auth Required (Admin)
 */
export const rejectRoomRequest = async (
  id: string,
  payload: RejectRequestPayload,
): Promise<void> => {
  await api.put(`/v1/function-rooms/admin/bookings/${id}/reject`, payload);
};

/**
 * @api PUT /v1/function-rooms/admin/bookings/{id}/cancel
 * @description Cancel an approved room request (admin only)
 * @param {string} id - Booking ID
 * @param {CancelRequestPayload} payload - Cancellation payload with required reason
 * @returns {Promise<void>}
 * @auth Required (Admin)
 */
export const cancelRoomRequest = async (
  id: string,
  payload: CancelRequestPayload,
): Promise<void> => {
  await api.put(`/v1/function-rooms/admin/bookings/${id}/cancel`, payload);
};

/**
 * @api PUT /v1/function-rooms/admin/bookings/bulk-approve
 * @description Approve multiple room requests
 * @param {BulkApprovePayload} payload - Bulk approval payload
 * @returns {Promise<{ approvedCount: number }>}
 * @auth Required (Admin)
 */
export const bulkApproveRoomRequests = async (
  payload: BulkApprovePayload,
): Promise<{ approvedCount: number }> => {
  const response = await api.put<{ success: boolean; data: { approvedCount: number } }>(
    '/v1/function-rooms/admin/bookings/bulk-approve',
    payload,
  );
  return response.data.data;
};

/**
 * @api PUT /v1/function-rooms/admin/bookings/bulk-reject
 * @description Reject multiple room requests
 * @param {BulkRejectPayload} payload - Bulk rejection payload
 * @returns {Promise<{ rejectedCount: number }>}
 * @auth Required (Admin)
 */
export const bulkRejectRoomRequests = async (
  payload: BulkRejectPayload,
): Promise<{ rejectedCount: number }> => {
  const response = await api.put<{ success: boolean; data: { rejectedCount: number } }>(
    '/v1/function-rooms/admin/bookings/bulk-reject',
    payload,
  );
  return response.data.data;
};






