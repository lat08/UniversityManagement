'use client';

import { useState, useEffect } from 'react';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Search, ChevronDown } from 'lucide-react';
import { ROOM_TYPE_LABELS, ROOM_STATUS_LABELS } from '../lib/types/room.types';

interface RoomFiltersProps {
  onSearch: () => void;
}

export default function RoomFilters({ onSearch }: RoomFiltersProps) {
  const tempFilters = useRoomBookingStore((state) => state.tempFilters);
  const setTempFilters = useRoomBookingStore((state) => state.setTempFilters);
  const applyFilters = useRoomBookingStore((state) => state.applyFilters);
  const rooms = useRoomBookingStore((state) => state.rooms) || [];

  const [isBuildingOpen, setIsBuildingOpen] = useState(false);
  const [isRoomTypeOpen, setIsRoomTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters({ [key]: value });
    // Apply filters immediately and trigger search
    setTimeout(() => {
      applyFilters();
      onSearch();
    }, 0);
  };

  // Get unique buildings from rooms data
  const uniqueBuildings = rooms 
    ? Array.from(new Map(rooms.map(room => [room.building.buildingId, room.building])).values())
    : [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      const buildingDropdown = target.closest('[data-dropdown="building"]');
      const roomTypeDropdown = target.closest('[data-dropdown="roomType"]');
      const statusDropdown = target.closest('[data-dropdown="status"]');
      
      if (!buildingDropdown && !roomTypeDropdown && !statusDropdown) {
        setIsBuildingOpen(false);
        setIsRoomTypeOpen(false);
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedBuildingName = () => {
    if (!tempFilters.buildingId) return "Tất cả";
    const building = uniqueBuildings.find(b => b.buildingId === tempFilters.buildingId);
    return building ? `${building.buildingName} (${building.buildingCode})` : "Tất cả";
  };

  const getSelectedRoomTypeName = () => {
    if (!tempFilters.roomType) return "Tất cả";
    return ROOM_TYPE_LABELS[tempFilters.roomType as keyof typeof ROOM_TYPE_LABELS] || "Tất cả";
  };

  const getSelectedStatusName = () => {
    if (!tempFilters.roomStatus) return "Tất cả";
    return ROOM_STATUS_LABELS[tempFilters.roomStatus as keyof typeof ROOM_STATUS_LABELS] || "Tất cả";
  };

  return (
    <div className="mb-4 flex gap-4 items-stretch w-full">
      {/* Sức chứa tối thiểu */}
      <div className="relative flex-1">
        <input
          type="number"
          value={tempFilters.capacity || ''}
          onChange={(e) => handleFilterChange('capacity', e.target.value)}
          placeholder="Sức chứa tối thiểu"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none focus:border-gray-600 bg-white text-gray-900 text-sm transition-colors h-full"
          min="1"
        />
      </div>

      {/* Vị trí (Tòa nhà) Dropdown */}
      <div className="relative flex-1 dropdown-container" data-dropdown="building">
        <button 
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full"
          onClick={() => {
            setIsBuildingOpen(!isBuildingOpen);
            setIsRoomTypeOpen(false);
            setIsStatusOpen(false);
          }}
        >
          <span className="text-sm text-gray-900">
            {getSelectedBuildingName()}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
        </button>
        {isBuildingOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
              onClick={() => {
                handleFilterChange('buildingId', '');
                setIsBuildingOpen(false);
              }}
            >
              Tất cả
            </button>
            {uniqueBuildings.map((building) => (
              <button
                key={building.buildingId}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                onClick={() => {
                  handleFilterChange('buildingId', building.buildingId);
                  setIsBuildingOpen(false);
                }}
              >
                {building.buildingName} ({building.buildingCode})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loại phòng Dropdown */}
      <div className="relative flex-1 dropdown-container" data-dropdown="roomType">
        <button 
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full"
          onClick={() => {
            setIsRoomTypeOpen(!isRoomTypeOpen);
            setIsBuildingOpen(false);
            setIsStatusOpen(false);
          }}
        >
          <span className="text-sm text-gray-900">
            {getSelectedRoomTypeName()}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
        </button>
        {isRoomTypeOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
              onClick={() => {
                handleFilterChange('roomType', '');
                setIsRoomTypeOpen(false);
              }}
            >
              Tất cả
            </button>
            {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                onClick={() => {
                  handleFilterChange('roomType', key);
                  setIsRoomTypeOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trạng thái Dropdown */}
      <div className="relative flex-1 dropdown-container" data-dropdown="status">
        <button 
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full"
          onClick={() => {
            setIsStatusOpen(!isStatusOpen);
            setIsBuildingOpen(false);
            setIsRoomTypeOpen(false);
          }}
        >
          <span className="text-sm text-gray-900">
            {getSelectedStatusName()}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
        </button>
        {isStatusOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg"
              onClick={() => {
                handleFilterChange('roomStatus', '');
                setIsStatusOpen(false);
              }}
            >
              Tất cả
            </button>
            {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors last:rounded-b-lg"
                onClick={() => {
                  handleFilterChange('roomStatus', key);
                  setIsStatusOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

