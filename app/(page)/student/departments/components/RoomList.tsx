'use client';

import { useState } from 'react';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { Monitor } from 'lucide-react';
import Image from 'next/image';
import BookingModal from './BookingModal';
import type { Room } from '../lib/stores/roomBookingStore';
import { 
  ROOM_TYPE_LABELS, 
  ROOM_STATUS_LABELS,
  ROOM_TYPE_COLORS,
  ROOM_STATUS_COLORS,
  type RoomType,
  type RoomStatus
} from '../lib/types/room.types';

// Image component with error handling
const RoomImage = ({ src, alt }: { src: string | null; alt: string }) => {
  const [imageError, setImageError] = useState(false);

  // Check if src is a valid URL
  const isValidUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!src || !isValidUrl(src) || imageError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
        <Monitor className="h-20 w-20 text-blue-200" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => setImageError(true)}
      unoptimized={!src.includes('supabase')}
    />
  );
};

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function RoomList({ rooms, isLoading, pagination, currentPage, onPageChange }: RoomListProps) {
  const filters = useRoomBookingStore((state) => state.filters);
  const setSelectedRoom = useRoomBookingStore((state) => state.setSelectedRoom);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const getRoomTypeBadge = (roomType: RoomType) => {
    return {
      text: ROOM_TYPE_LABELS[roomType] || 'Không xác định',
      color: ROOM_TYPE_COLORS[roomType] || 'bg-gray-100 text-gray-800'
    };
  };

  const getRoomStatusBadge = (roomStatus: RoomStatus) => {
    return {
      text: ROOM_STATUS_LABELS[roomStatus] || 'Không xác định',
      color: ROOM_STATUS_COLORS[roomStatus] || 'bg-gray-100 text-gray-800'
    };
  };

  // Filter rooms based on filters
  const filteredRooms = rooms.filter((room) => {
    if (filters.capacity && room.capacity < parseInt(filters.capacity)) return false;
    if (filters.buildingId && room.building.buildingId !== filters.buildingId) return false;
    if (filters.roomType && room.roomType !== filters.roomType) return false;
    if (filters.roomStatus && room.roomStatus !== filters.roomStatus) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse overflow-hidden border border-gray-200">
            <div className="h-[230px] bg-gray-200"></div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="border-t border-gray-200"></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex flex-col items-center space-y-2 w-full">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Kết quả: Tìm thấy <span className="font-semibold">{pagination?.totalItems || filteredRooms.length}</span> phòng học
          {pagination && ` (Trang ${pagination.currentPage}/${pagination.totalPages})`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredRooms.map((room) => {
          const roomTypeBadge = getRoomTypeBadge(room.roomType);
          const roomStatusBadge = getRoomStatusBadge(room.roomStatus);
          const isDisabled = room.roomStatus === 'inactive' || room.roomStatus === 'maintenance';

          return (
            <Card
              key={room.roomId}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white"
            >
              {/* Room Image */}
              <div className="relative w-full h-[230px] overflow-hidden">
                <RoomImage src={room.imageUrl} alt={room.roomName} />
                
                {/* Status Badges on Image - Positioned separately */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge className={`${roomTypeBadge.color} px-3 py-1 text-xs font-medium rounded-md shadow-md`}>
                    {roomTypeBadge.text}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <Badge className={`${roomStatusBadge.color} px-3 py-1 text-xs font-medium rounded-md shadow-md`}>
                    {roomStatusBadge.text}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Room Name and Code */}
                <div>
                  <h3 className="text-xl font-bold text-[#0B5FCC] mb-1">
                    {room.roomName}
                  </h3>
                  <p className="text-sm text-gray-900">{room.roomCode}</p>
                </div>

                {/* Separator Line */}
                <div className="border-t border-gray-200"></div>

                {/* Details and Amenities - 2 Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Details */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Sức chứa</p>
                      <p className="text-sm font-bold text-gray-900">{room.capacity} người</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Vị trí</p>
                      <p className="text-sm font-bold text-gray-900">{room.building.buildingName}</p>
                      <p className="text-xs text-gray-500">{room.building.address}</p>
                    </div>
                  </div>

                  {/* Right Column - Amenities */}
                  <div className="flex flex-col space-y-2 w-full">
                    <p className="text-sm text-gray-700 mb-2 text-center">Tiện ích</p>
                    {room.amenities && room.amenities.length > 0 ? (
                      <div className="flex flex-col items-center gap-2 w-full max-h-[120px] overflow-y-auto">
                        {room.amenities.slice(0, 3).map((amenity) => (
                          <Badge
                            key={amenity.amenityId}
                            className="text-xs bg-blue-50 text-[#0B5FCC] border-0 px-2 py-1 w-full flex justify-center"
                            title={amenity.amenityName}
                          >
                            {amenity.amenityName.length > 15 
                              ? amenity.amenityName.substring(0, 15) + '...'
                              : amenity.amenityName
                            }
                          </Badge>
                        ))}
                        {room.amenities.length > 3 && (
                          <Badge className="text-xs bg-gray-50 text-gray-600 border-0 px-2 py-1 w-full flex justify-center">
                            +{room.amenities.length - 3} tiện ích khác
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center">Không có</p>
                    )}
                  </div>
                </div>

                {/* Book Button */}
                <Button
                  onClick={() => handleBookRoom(room)}
                  disabled={isDisabled}
                  className={`w-full ${
                    isDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#0B5FCC] hover:bg-[#0a4fab] text-white'
                  } font-medium py-2.5 rounded-lg transition-colors`}
                >
                  {isDisabled ? 'Không khả dụng' : 'Đăng ký'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRooms.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <Monitor className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Không tìm thấy phòng nào</p>
          <p className="text-sm mt-2">Vui lòng thử điều chỉnh bộ lọc của bạn</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            className="px-4 py-2"
          >
            Trang trước
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage = 
                page === 1 ||
                page === pagination.totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              const showEllipsis = 
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < pagination.totalPages - 2);

              if (showEllipsis) {
                return <span key={page} className="px-2">...</span>;
              }

              if (!showPage) return null;

              return (
                <Button
                  key={page}
                  onClick={() => onPageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  className={`px-4 py-2 ${
                    currentPage === page
                      ? 'bg-[#0B5FCC] text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            variant="outline"
            className="px-4 py-2"
          >
            Trang sau
          </Button>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
