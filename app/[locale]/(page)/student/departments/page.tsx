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
import { useTranslations } from 'next-intl';

export default function RoomBookingPage() {
  const t = useTranslations('student.departments');
  usePageTitle(t('title'));
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

  const tabItems = useMemo(
    () => [
      { key: 'rooms' as const, label: t('tabs.rooms') },
      { key: 'history' as const, label: t('tabs.history') },
    ],
    [t],
  );

  const isInitialLoading = (activeTab === 'rooms' && roomsLoading) || (activeTab === 'history' && bookingsLoading);

  if (isInitialLoading && activeTab === 'rooms' && !roomsData) {
    return (
      <div key="room-booking-loading" className="animate-in fade-in duration-100 space-y-4 lg:space-y-6">
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div key="room-booking-content" className="animate-in fade-in duration-200 space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-xs lg:text-sm text-gray-500">{t('description')}</p>
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
