'use client';

import { useState } from 'react';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { Tabs } from '@/app/components/ui/tabs';
import { useRooms, useUserBookings } from './lib/hooks/useRoomBooking';
import RoomFilters from './components/RoomFilters';
import RoomList from './components/RoomList';
import BookingHistory from './components/BookingHistory';
import BookingHistoryFilters from './components/BookingHistoryFilters';

const tabs = [
  { key: 'rooms', label: 'Danh sách các phòng chức năng' },
  { key: 'history', label: 'Lịch sử đăng ký' },
] as const;

export default function RoomBookingPage() {
  usePageTitle('Phòng chức năng');
  const [activeTab, setActiveTab] = useState<'rooms' | 'history'>('rooms');
  const [roomsPage, setRoomsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [roomsPageSize] = useState(12);
  const [historyPageSize] = useState(10);
  
  const { data: roomsData, isLoading: roomsLoading } = useRooms(roomsPage, roomsPageSize);
  const { data: bookingsData, isLoading: bookingsLoading } = useUserBookings(historyPage, historyPageSize);

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
          <RoomFilters />

          {/* Room List */}
          <RoomList 
            rooms={roomsData?.rooms || []} 
            isLoading={roomsLoading}
            pagination={roomsData?.pagination}
            currentPage={roomsPage}
            onPageChange={setRoomsPage}
          />
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-6">
          {/* Filters */}
          <BookingHistoryFilters />
          
          {/* Booking History */}
          <BookingHistory 
            bookings={bookingsData?.bookings || []} 
            isLoading={bookingsLoading}
            pagination={bookingsData?.pagination}
            currentPage={historyPage}
            onPageChange={setHistoryPage}
          />
        </div>
      )}
    </div>
  );
}
