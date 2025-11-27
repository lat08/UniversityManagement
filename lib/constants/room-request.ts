import type { RoomRequestStatus } from '@/lib/types/room-request';

export const ROOM_REQUEST_STATUS_META: Record<
  RoomRequestStatus,
  {
    readonly labelKey: string;
    readonly badgeClass: string;
  }
> = {
  pending: {
    labelKey: 'status.pending',
    badgeClass: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
  },
  confirmed: {
    labelKey: 'status.confirmed',
    badgeClass: 'bg-green-50 text-green-700 ring-green-100',
  },
  rejected: {
    labelKey: 'status.rejected',
    badgeClass: 'bg-red-50 text-red-700 ring-red-100',
  },
  cancelled: {
    labelKey: 'status.cancelled',
    badgeClass: 'bg-gray-100 text-gray-600 ring-gray-200',
  },
};

export const ROOM_REQUEST_STATUS_OPTIONS: Array<{ value: RoomRequestStatus | 'all'; labelKey: string }> = [
  { value: 'all', labelKey: 'filters.status.all' },
  ...Object.entries(ROOM_REQUEST_STATUS_META).map(([value, meta]) => ({
    value: value as RoomRequestStatus,
    labelKey: meta.labelKey,
  })),
];






