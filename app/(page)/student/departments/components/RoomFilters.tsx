'use client';

import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Button } from '@/app/components/ui/button';
import { Search } from 'lucide-react';
import { ROOM_TYPE_LABELS, ROOM_STATUS_LABELS } from '../lib/types/room.types';

export default function RoomFilters() {
  const filters = useRoomBookingStore((state) => state.filters);
  const setFilters = useRoomBookingStore((state) => state.setFilters);
  // Không cần fetch lại toàn bộ rooms cho filter - sẽ dùng API riêng để lấy buildings
  const rooms = useRoomBookingStore((state) => state.rooms) || [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  const handleSearch = () => {
    // Logic tìm kiếm sẽ được implement sau
  };

  // Get unique buildings from rooms data
  const uniqueBuildings = rooms 
    ? Array.from(new Map(rooms.map(room => [room.building.buildingId, room.building])).values())
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Sức chứa tối thiểu */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Sức chứa tối thiểu
          </label>
          <input
            type="number"
            value={filters.capacity || ''}
            onChange={(e) => handleFilterChange('capacity', e.target.value)}
            placeholder="Nhập số lượng người"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FCC] bg-white text-gray-900 text-sm"
            min="1"
          />
        </div>

        {/* Tòa nhà */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Tòa nhà
          </label>
          <select
            value={filters.buildingId}
            onChange={(e) => handleFilterChange('buildingId', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FCC] bg-white text-gray-900 text-sm"
          >
            <option value="">Tất cả</option>
            {uniqueBuildings.map((building) => (
              <option key={building.buildingId} value={building.buildingId}>
                {building.buildingName} ({building.buildingCode})
              </option>
            ))}
          </select>
        </div>

        {/* Loại phòng */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Loại phòng
          </label>
          <select
            value={filters.roomType}
            onChange={(e) => handleFilterChange('roomType', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FCC] bg-white text-gray-900 text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={filters.roomStatus}
            onChange={(e) => handleFilterChange('roomStatus', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FCC] bg-white text-gray-900 text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button
            onClick={handleSearch}
            className="w-full bg-[#0B5FCC] hover:bg-[#0a4fab] text-white font-medium px-8 py-2.5 rounded-lg transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
}

