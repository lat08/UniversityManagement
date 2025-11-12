'use client';

import { useState, useMemo, memo } from 'react';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { Monitor } from 'lucide-react';
import BookingModal from './BookingModal';
import type { Room } from '../lib/stores/roomBookingStore';
import { 
  ROOM_TYPE_LABELS, 
  ROOM_STATUS_LABELS,
  ROOM_TYPE_COLORS,
  ROOM_STATUS_COLORS,
} from '../lib/types/room.types';

const RoomImage = memo(({ src, alt }: { src: string | null; alt: string }) => {
  const [imageError, setImageError] = useState(false);

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
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
});

RoomImage.displayName = 'RoomImage';

const RoomCard = memo(({ room, index, onBookRoom }: { 
  room: Room; 
  index: number; 
  onBookRoom: (room: Room) => void;
}) => {
  const roomTypeBadge = useMemo(() => ({
    text: ROOM_TYPE_LABELS[room.roomType] || 'Không xác định',
    color: ROOM_TYPE_COLORS[room.roomType] || 'bg-gray-100 text-gray-800'
  }), [room.roomType]);

  const roomStatusBadge = useMemo(() => ({
    text: ROOM_STATUS_LABELS[room.roomStatus] || 'Không xác định',
    color: ROOM_STATUS_COLORS[room.roomStatus] || 'bg-gray-100 text-gray-800'
  }), [room.roomStatus]);

  const isDisabled = room.roomStatus === 'inactive' || room.roomStatus === 'maintenance';

  return (
    <Card
      className="overflow-hidden border border-gray-200 bg-white animate-fade-up hover:shadow-lg transition-shadow duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative w-full h-[230px] overflow-hidden">
        <RoomImage src={room.imageUrl} alt={room.roomName} />
        
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <Badge className={`${roomTypeBadge.color} px-3 py-1 text-xs font-medium rounded-md shadow-md`}>
            {roomTypeBadge.text}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <Badge className={`${roomStatusBadge.color} px-3 py-1 text-xs font-medium rounded-md shadow-md`}>
            {roomStatusBadge.text}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[#0B5FCC] mb-1">
            {room.roomName}
          </h3>
          <p className="text-sm text-gray-900">{room.roomCode}</p>
        </div>

        <div className="border-t border-gray-200"></div>

        <div className="grid grid-cols-2 gap-6">
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

          <div className="flex flex-col space-y-2 w-full">
            <p className="text-sm text-gray-700 mb-2 text-center">Tiện ích</p>
            {room.amenities && room.amenities.length > 0 ? (
              <div className="flex flex-col items-center gap-2 w-full max-h-[120px] overflow-y-auto">
                {room.amenities.slice(0, 3).map((amenity) => (
                  <Badge
                    key={amenity.amenityId}
                    className="text-xs bg-blue-50 text-[#0B5FCC] border-0 px-2 py-1 w-full flex justify-center pointer-events-none"
                    title={amenity.amenityName}
                  >
                    {amenity.amenityName.length > 15 
                      ? amenity.amenityName.substring(0, 15) + '...'
                      : amenity.amenityName
                    }
                  </Badge>
                ))}
                {room.amenities.length > 3 && (
                  <Badge className="text-xs bg-gray-50 text-gray-600 border-0 px-2 py-1 w-full flex justify-center pointer-events-none">
                    +{room.amenities.length - 3} tiện ích khác
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center">Không có</p>
            )}
          </div>
        </div>

        <Button
          onClick={() => onBookRoom(room)}
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
});

RoomCard.displayName = 'RoomCard';

const SkeletonCard = memo(() => (
  <Card className="animate-pulse overflow-hidden border border-gray-200">
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
));

SkeletonCard.displayName = 'SkeletonCard';

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
  const setSelectedRoom = useRoomBookingStore((state) => state.setSelectedRoom);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const paginationPages = useMemo(() => {
    if (!pagination) return [];
    
    return Array.from({ length: pagination.totalPages }, (_, i) => i + 1).filter(page => {
      const showPage = 
        page === 1 ||
        page === pagination.totalPages ||
        (page >= currentPage - 1 && page <= currentPage + 1);
      return showPage;
    });
  }, [pagination, currentPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Kết quả: Tìm thấy <span className="font-semibold">{pagination?.totalItems || rooms.length}</span> phòng học
          {pagination && ` (Trang ${pagination.currentPage}/${pagination.totalPages})`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {rooms.map((room, index) => (
          <RoomCard
            key={room.roomId}
            room={room}
            index={index}
            onBookRoom={handleBookRoom}
          />
        ))}
      </div>

      {rooms.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <Monitor className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Không tìm thấy phòng nào</p>
          <p className="text-sm mt-2">Vui lòng thử điều chỉnh bộ lọc của bạn</p>
        </div>
      )}

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
            {paginationPages.map((page, idx) => {
              const showEllipsis = 
                idx > 0 && 
                paginationPages[idx - 1] !== page - 1;

              return (
                <div key={page} className="flex items-center gap-2">
                  {showEllipsis && <span className="px-2">...</span>}
                  <Button
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
                </div>
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

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
