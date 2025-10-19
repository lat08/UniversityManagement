'use client';

import { useRooms, useUserBookings } from './lib/hooks/useRoomBooking';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import BookingForm from './components/BookingForm';
import RoomList from './components/RoomList';
import BookingHistory from './components/BookingHistory';

export default function RoomBookingPage() {
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const { data: userBookings, isLoading: bookingsLoading } = useUserBookings();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Phòng chức năng</h1>
        <p className="text-xs lg:text-sm text-gray-500">Đăng ký sử dụng phòng chức năng</p>
      </div>

      <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Booking Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Thông tin đăng ký
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BookingForm />
            </CardContent>
            <hr className="border-gray-200" />
          </Card>
        </div>

        {/* Right Column - Room List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-500 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Danh sách phòng chức năng
                </span>
                <ChevronRight className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RoomList rooms={rooms || []} isLoading={roomsLoading} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking History - Separate Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs lg:text-sm font-medium text-gray-500 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Lịch đã đăng ký
            </span>
            <ChevronRight className="h-4 w-4" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BookingHistory bookings={userBookings || []} isLoading={bookingsLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
