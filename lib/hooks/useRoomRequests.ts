import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRoomRequests,
  getRoomRequestStats,
  getRoomRequestDetail,
  approveRoomRequest,
  rejectRoomRequest,
  cancelRoomRequest,
  bulkApproveRoomRequests,
  bulkRejectRoomRequests,
} from '@/lib/api/room-request';
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
} from '@/lib/types/room-request';
import { queryKeys } from '@/lib/api/queryKeys';
import { toast } from 'react-hot-toast';

/**
 * Hook to get list of room requests with filters and pagination
 */
export const useRoomRequestsList = (params: RoomRequestQueryParams) =>
  useQuery<RoomRequestListResponse>({
    queryKey: queryKeys.roomRequests.list(params),
    queryFn: () => getRoomRequests(params),
    placeholderData: keepPreviousData,
  });

/**
 * Hook to get room request statistics
 */
export const useRoomRequestStats = () =>
  useQuery<RoomRequestStats>({
    queryKey: queryKeys.roomRequests.stats(),
    queryFn: () => getRoomRequestStats(),
  });

/**
 * Hook to get room request detail by ID
 */
export const useRoomRequestDetail = (id: string | null) =>
  useQuery<RoomRequestRecord>({
    queryKey: id ? queryKeys.roomRequests.detail(id) : ['roomRequests', 'detail', 'idle'],
    queryFn: () => getRoomRequestDetail(id as string),
    enabled: Boolean(id),
  });

/**
 * Hook to approve a room request
 */
export const useApproveRoomRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApproveRequestPayload }) =>
      approveRoomRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomRequests.all });
      toast.success('Duyệt đơn đăng ký thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể duyệt đơn đăng ký');
    },
  });
};

/**
 * Hook to reject a room request
 */
export const useRejectRoomRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectRequestPayload }) =>
      rejectRoomRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomRequests.all });
      toast.success('Từ chối đơn đăng ký thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể từ chối đơn đăng ký');
    },
  });
};

/**
 * Hook to cancel an approved room request (admin only)
 */
export const useCancelRoomRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CancelRequestPayload }) =>
      cancelRoomRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomRequests.all });
      toast.success('Hủy đơn đăng ký thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể hủy đơn đăng ký');
    },
  });
};

/**
 * Hook to bulk approve room requests
 */
export const useBulkApproveRoomRequests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkApprovePayload) => bulkApproveRoomRequests(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomRequests.all });
      toast.success(`Đã duyệt ${data.approvedCount} đơn đăng ký thành công`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể duyệt nhiều đơn đăng ký');
    },
  });
};

/**
 * Hook to bulk reject room requests
 */
export const useBulkRejectRoomRequests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkRejectPayload) => bulkRejectRoomRequests(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomRequests.all });
      toast.success(`Đã từ chối ${data.rejectedCount} đơn đăng ký thành công`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể từ chối nhiều đơn đăng ký');
    },
  });
};






