'use client';

import { memo, useMemo } from 'react';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Dropdown } from '@/app/components/ui/dropdown';
import { ROOM_TYPE_LABELS, ROOM_STATUS_LABELS } from '../lib/types/room.types';
import { useBuildings } from '@/lib/hooks/useCommonData';

const createDropdownOptions = (labels: Record<string, string>) => [
  { value: '', label: 'Tất cả' },
  ...Object.entries(labels).map(([key, label]) => ({ value: key, label }))
];

function RoomFilters() {
  const capacity = useRoomBookingStore((state) => state.tempFilters.capacity);
  const buildingCode = useRoomBookingStore((state) => state.tempFilters.buildingCode);
  const roomType = useRoomBookingStore((state) => state.tempFilters.roomType);
  const roomStatus = useRoomBookingStore((state) => state.tempFilters.roomStatus);
  const setTempFilters = useRoomBookingStore((state) => state.setTempFilters);
  const applyFilters = useRoomBookingStore((state) => state.applyFilters);
  const { data: buildings } = useBuildings();

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'capacity' && value) {
      const numValue = Number.parseInt(value);
      if (numValue > 1000) {
        value = '1000';
      }
    }
    setTempFilters({ [key]: value });
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const buildingOptions = useMemo(() => [
    { value: '', label: 'Tất cả' },
    ...(buildings?.map(b => ({ 
      value: b.buildingCode, 
      label: `${b.buildingName} (${b.buildingCode})` 
    })) || [])
  ], [buildings]);

  const roomTypeOptions = useMemo(() => createDropdownOptions(ROOM_TYPE_LABELS), []);
  const statusOptions = useMemo(() => createDropdownOptions(ROOM_STATUS_LABELS), []);

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {/* Sức chứa tối thiểu */}
      <div className="relative">
        <label className="block text-sm font-medium text-[#0053AD] mb-2">Sức chứa tối thiểu</label>
        <input
          type="number"
          value={capacity || ''}
          onChange={(e) => handleFilterChange('capacity', e.target.value)}
          onKeyDown={(e) => {
            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          placeholder="Nhập số lượng người"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none focus:border-gray-600 bg-white text-gray-900 text-sm transition-colors"
          min="1"
          max="1000"
        />
      </div>

      {/* Vị trí (Tòa nhà) Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#0053AD] mb-2">Cơ sở</label>
        <Dropdown
          options={buildingOptions}
          value={buildingCode || ''}
          placeholder="Tất cả"
          onChange={(value) => handleFilterChange('buildingCode', value)}
        />
      </div>

      {/* Loại phòng Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#0053AD] mb-2">Loại phòng</label>
        <Dropdown
          options={roomTypeOptions}
          value={roomType || ''}
          placeholder="Tất cả"
          onChange={(value) => handleFilterChange('roomType', value)}
        />
      </div>

      {/* Trạng thái Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#0053AD] mb-2">Trạng thái</label>
        <Dropdown
          options={statusOptions}
          value={roomStatus || ''}
          placeholder="Tất cả"
          onChange={(value) => handleFilterChange('roomStatus', value)}
        />
      </div>
    </div>
  );
}

export default memo(RoomFilters);

