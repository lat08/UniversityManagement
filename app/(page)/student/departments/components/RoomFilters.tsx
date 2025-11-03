'use client';

import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Search } from 'lucide-react';
import { Dropdown } from '@/app/components/ui/dropdown';
import { ROOM_TYPE_LABELS, ROOM_STATUS_LABELS } from '../lib/types/room.types';

interface RoomFiltersProps {
  onSearch: () => void;
}

export default function RoomFilters({ onSearch }: RoomFiltersProps) {
  const tempFilters = useRoomBookingStore((state) => state.tempFilters);
  const setTempFilters = useRoomBookingStore((state) => state.setTempFilters);
  const applyFilters = useRoomBookingStore((state) => state.applyFilters);
  const rooms = useRoomBookingStore((state) => state.rooms) || [];

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters({ [key]: value });
    setTimeout(() => {
      applyFilters();
      onSearch();
    }, 0);
  };

  const uniqueBuildings = rooms 
    ? Array.from(new Map(rooms.map(room => [room.building.buildingId, room.building])).values())
    : [];

  const buildingOptions = [
    { value: '', label: 'Tất cả' },
    ...uniqueBuildings.map(b => ({ 
      value: b.buildingId, 
      label: `${b.buildingName} (${b.buildingCode})` 
    }))
  ];

  const roomTypeOptions = [
    { value: '', label: 'Tất cả' },
    ...Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => ({ value: key, label }))
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    ...Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => ({ value: key, label }))
  ];

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {/* Sức chứa tối thiểu */}
      <div className="relative">
        <label className="block text-sm font-medium text-[#0053AD] mb-2">Sức chứa tối thiểu</label>
        <input
          type="number"
          value={tempFilters.capacity || ''}
          onChange={(e) => handleFilterChange('capacity', e.target.value)}
          placeholder="Nhập số lượng người"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none focus:border-gray-600 bg-white text-gray-900 text-sm transition-colors"
          min="1"
        />
      </div>

      {/* Vị trí (Tòa nhà) Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#0053AD] mb-2">Cơ sở</label>
        <Dropdown
          options={buildingOptions}
          value={tempFilters.buildingId || ''}
          placeholder="Tất cả"
          onChange={(value) => handleFilterChange('buildingId', value)}
        />
      </div>

      {/* Loại phòng Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#0053AD] mb-2">Khoa</label>
        <Dropdown
          options={roomTypeOptions}
          value={tempFilters.roomType || ''}
          placeholder="Tất cả"
          onChange={(value) => handleFilterChange('roomType', value)}
        />
      </div>

      {/* Trạng thái Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#0053AD] mb-2">Trạng thái</label>
        <Dropdown
          options={statusOptions}
          value={tempFilters.roomStatus || ''}
          placeholder="Tất cả"
          onChange={(value) => handleFilterChange('roomStatus', value)}
        />
      </div>
    </div>
  );
}

