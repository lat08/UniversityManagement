'use client';

import { useState, Suspense, useMemo, useEffect } from 'react';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { Tabs } from '@/app/components/ui/tabs';
import { useRooms, useUserBookings } from './lib/hooks/useRoomBooking';
import { useRoomBookingStore } from './lib/stores/roomBookingStore';
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
  
  const roomsPageSize = 12;
  const historyPageSize = 10;
  
  const filters = useRoomBookingStore((state) => state.filters);
  
  const { data: roomsData, isLoading: roomsLoading } = useRooms(roomsPage, roomsPageSize);
  const { data: bookingsData, isLoading: bookingsLoading } = useUserBookings(historyPage, historyPageSize);

  useEffect(() => {
    setRoomsPage(1);
  }, [filters.capacity, filters.buildingCode, filters.roomType, filters.roomStatus]);

  useEffect(() => {
    setHistoryPage(1);
  }, [filters.bookingStatus, filters.roomType, filters.buildingCode, filters.minStudentCount, filters.maxStudentCount]);

  const tabItems = useMemo(() => tabs.map(tab => ({ key: tab.key, label: tab.label })), []);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Phòng chức năng</h1>
        <p className="text-xs lg:text-sm text-gray-500">Đăng ký sử dụng phòng chức năng</p>
      </div>

      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'rooms' ? (
        <div className="space-y-4 lg:space-y-6">
          <Suspense fallback={<div className="h-20 animate-pulse bg-gray-100 rounded-lg" />}>
            <RoomFilters />
          </Suspense>

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
          <Suspense fallback={<div className="h-20 animate-pulse bg-gray-100 rounded-lg" />}>
            <BookingHistoryFilters />
          </Suspense>
          
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
