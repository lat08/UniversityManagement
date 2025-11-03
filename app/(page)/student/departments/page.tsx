'use client';

import { useState } from 'react';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { Tabs } from '@/app/components/ui/tabs';
import { useRooms, useUserBookings } from './lib/hooks/useRoomBooking';
import { useRoomBookingStore } from './lib/stores/roomBookingStore';
import RoomFilters from './components/RoomFilters';
import RoomList from './components/RoomList';
import BookingHistory from './components/BookingHistory';

const tabs = [
  { key: 'rooms', label: 'Danh sách các phòng chức năng' },
  { key: 'history', label: 'Lịch sử đăng ký' },
] as const;

export default function RoomBookingPage() {
  usePageTitle('Phòng chức năng');
  const [activeTab, setActiveTab] = useState<'rooms' | 'history'>('rooms');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const applyFilters = useRoomBookingStore((state) => state.applyFilters);
  
  const { data, isLoading: roomsLoading, refetch: refetchRooms } = useRooms(currentPage, pageSize);
  const { data: userBookings, isLoading: bookingsLoading } = useUserBookings();
  
  const rooms = data?.rooms || [];
  const pagination = data?.pagination;

  const handleSearch = () => {
    applyFilters();
    if (activeTab === 'rooms') {
      refetchRooms();
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Phòng chức năng</h1>
        <p className="text-xs lg:text-sm text-gray-500">Đăng ký sử dụng phòng chức năng</p>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabs.map(tab => ({ key: tab.key, label: tab.label }))}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {/* Content based on active tab */}
      {activeTab === 'rooms' ? (
        <div className="space-y-4 lg:space-y-6">
          {/* Filters */}
          <RoomFilters onSearch={handleSearch} />

          {/* Room List */}
          <RoomList 
            rooms={rooms} 
            isLoading={roomsLoading}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <BookingHistory bookings={userBookings || []} isLoading={bookingsLoading} />
      )}
    </div>
  );
}
