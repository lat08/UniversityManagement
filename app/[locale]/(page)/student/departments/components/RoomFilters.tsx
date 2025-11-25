'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRoomBookingStore } from '../lib/stores/roomBookingStore';
import { Dropdown } from '@/app/components/ui/dropdown';
import { ROOM_TYPE_LABELS, ROOM_STATUS_LABELS, type RoomStatus, type RoomType } from '@/lib/types/room';
import { useBuildings } from '@/lib/hooks/useCommonData';

function RoomFilters() {
  const t = useTranslations('student.departments');
  const capacity = useRoomBookingStore((state) => state.tempFilters.capacity);
  const buildingCode = useRoomBookingStore((state) => state.tempFilters.buildingCode);
  const roomType = useRoomBookingStore((state) => state.tempFilters.roomType);
  const roomStatus = useRoomBookingStore((state) => state.tempFilters.roomStatus);
  const setTempFilters = useRoomBookingStore((state) => state.setTempFilters);
  const applyFilters = useRoomBookingStore((state) => state.applyFilters);
  const { data: buildings } = useBuildings();

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'capacity' && value) {
      const numValue = Number.parseInt(value);
      if (numValue > 1000) {
        value = '1000';
      }
    }
    setTempFilters({ [key]: value });
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const buildingOptions = useMemo(
    () => [
      { value: '', label: t('filters.all') },
      ...(buildings?.map((b) => ({
        value: b.buildingCode,
        label: t('filters.buildingOption', { name: b.buildingName, code: b.buildingCode }),
      })) || []),
    ],
    [buildings, t],
  );

  const roomTypeOptions = useMemo(() => {
    const entries = Object.keys(ROOM_TYPE_LABELS) as RoomType[];
    return [
      { value: '', label: t('filters.all') },
      ...entries.map((key) => ({
        value: key,
        label: t(`roomTypes.${key}`),
      })),
    ];
  }, [t]);

  const statusOptions = useMemo(() => {
    const entries = Object.keys(ROOM_STATUS_LABELS) as RoomStatus[];
    return [
      { value: '', label: t('filters.all') },
      ...entries.map((key) => ({
        value: key,
        label: t(`roomStatuses.${key}`),
      })),
    ];
  }, [t]);

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {/* Sức chứa tối thiểu */}
      <div className="relative">
        <label className="block text-sm font-medium text-[#0053AD] mb-2">{t('filters.capacityLabel')}</label>
        <input
          type="number"
          value={capacity || ''}
          onChange={(e) => handleFilterChange('capacity', e.target.value)}
          onKeyDown={(e) => {
            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          placeholder={t('filters.capacityPlaceholder')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none focus:border-gray-600 bg-white text-gray-900 text-sm transition-colors"
          min="1"
          max="1000"
        />
      </div>

      {/* Vị trí (Tòa nhà) Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#0053AD] mb-2">{t('filters.buildingLabel')}</label>
        <Dropdown
          options={buildingOptions}
          value={buildingCode || ''}
          placeholder={t('filters.all')}
          onChange={(value) => handleFilterChange('buildingCode', value)}
        />
      </div>

      {/* Loại phòng Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#0053AD] mb-2">{t('filters.roomTypeLabel')}</label>
        <Dropdown
          options={roomTypeOptions}
          value={roomType || ''}
          placeholder={t('filters.all')}
          onChange={(value) => handleFilterChange('roomType', value)}
        />
      </div>

      {/* Trạng thái Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#0053AD] mb-2">{t('filters.roomStatusLabel')}</label>
        <Dropdown
          options={statusOptions}
          value={roomStatus || ''}
          placeholder={t('filters.all')}
          onChange={(value) => handleFilterChange('roomStatus', value)}
        />
      </div>
    </div>
  );
}

export default memo(RoomFilters);

