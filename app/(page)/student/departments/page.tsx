'use client';

import { useState } from 'react';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useRooms, useUserBookings } from './lib/hooks/useRoomBooking';
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
  
  const { data, isLoading: roomsLoading } = useRooms(currentPage, pageSize);
  const { data: userBookings, isLoading: bookingsLoading } = useUserBookings();
  
  const rooms = data?.rooms || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Phòng chức năng</h1>
        <p className="text-xs lg:text-sm text-gray-500">Đăng ký sử dụng phòng chức năng</p>
      </div>

      {/* Tabs - Design giống trang thông báo */}
      <div className="overflow-hidden">
        <div className="flex w-full border border-[var(--border)] rounded-lg bg-[var(--muted)] relative">
          {/* Active tab background slider */}
          <div 
            className="absolute top-0 bottom-0 bg-[var(--primary)] rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
            style={{
              width: `${100 / tabs.length}%`,
              left: `${tabs.findIndex(t => t.key === activeTab) * (100 / tabs.length)}%`,
              transform: 'translateX(0)'
            }}
          />
          
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.key;

            return (
              <div key={tab.key} className="flex-1 relative z-10">
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full cursor-pointer px-6 py-3 text-sm font-semibold flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "text-[var(--primary-foreground)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="relative z-100">{tab.label}</span>
                </button>
                
                {/* Divider - chỉ hiển thị khi tab không được chọn và không phải tab cuối */}
                {!isActive && index < tabs.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-[var(--border)] transition-opacity duration-300"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'rooms' ? (
        <div className="space-y-4 lg:space-y-6">
          {/* Filters */}
          <RoomFilters />

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
