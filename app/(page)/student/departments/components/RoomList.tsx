'use client';

import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { Users, MapPin, Monitor, Check } from 'lucide-react';
import type { Room } from '../lib/stores/roomBookingStore';

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
}

export default function RoomList({ rooms, isLoading }: RoomListProps) {
  const selectedRoom = useRoomBookingStore((state) => state.selectedRoom);
  const setSelectedRoom = useRoomBookingStore((state) => state.setSelectedRoom);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room.id === selectedRoom?.id ? null : room);
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'available':
        return 'bg-[#4E8EE1] text-white';
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800';
      case 'full':
        return 'bg-[#DEE9FF] text-[#4E8EE1]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Room['status']) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'occupied':
        return 'Có sẵn';
      case 'full':
        return 'Đã đặt';
      default:
        return 'Không xác định';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <Card
          key={room.id}
          className={`${
            selectedRoom?.id === room.id
              ? 'ring-2 ring-[#4E8EE1] border-[#4E8EE1]'
              : 'border-gray-200'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{room.name}</h3>
                  <Badge className={getStatusColor(room.status)}>
                    {getStatusText(room.status)}
                  </Badge>
                  {selectedRoom?.id === room.id && (
                    <Check className="h-4 w-4 text-[#4E8EE1]" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{room.capacity} người</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{room.location}</span>
                  </div>
                </div>

                {room.equipment && room.equipment.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {room.equipment.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white text-black border-gray-300">
                        <Monitor className="h-3 w-3 mr-1" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}

              </div>

              <Button
                variant={selectedRoom?.id === room.id ? "default" : "outline"}
                size="sm"
                disabled={room.status === 'full'}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleRoomSelect(room);
                }}
                className={`cursor-pointer transition-colors ${
                  selectedRoom?.id === room.id 
                    ? "bg-[#4E8EE1] hover:bg-[#4E8EE1]/80 text-white" 
                    : "bg-[#4E8EE1] hover:bg-[#4E8EE1]/80 text-white border-[#4E8EE1] hover:border-[#4E8EE1]/80"
                }`}
              >
                {selectedRoom?.id === room.id ? 'Đã chọn' : 'Đăng ký'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {rooms.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Không có phòng nào khả dụng</p>
        </div>
      )}
    </div>
  );
}
