'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dropdown, Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { buildingsApi } from '../lib/api/buildingsApi';

interface BulkEditBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedBuildingIds: string[];
}

export const BulkEditBuildingModal = ({ isOpen, onClose, onSuccess, selectedBuildingIds }: BulkEditBuildingModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [buildingStatus, setBuildingStatus] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setBuildingStatus('');
      setAddress('');
      onClose();
    }
  }, [isSubmitting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, handleClose]);

  const statusOptions = [
    { value: '', label: 'Không thay đổi' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Ngừng hoạt động' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buildingStatus && !address) {
      toast.error('Vui lòng chọn ít nhất một trường để cập nhật');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: { buildingIds: string[]; buildingStatus?: 'active' | 'inactive'; address?: string } = {
        buildingIds: selectedBuildingIds,
      };

      if (buildingStatus) payload.buildingStatus = buildingStatus as 'active' | 'inactive';
      if (address) payload.address = address;

      const response = await buildingsApi.bulkUpdate(payload);

      if (response.success) {
        toast.success(`Đã cập nhật ${selectedBuildingIds.length} tòa nhà`);
        setBuildingStatus('');
        setAddress('');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || 'Cập nhật hàng loạt thất bại');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           'Đã xảy ra lỗi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa hàng loạt</h2>
              <p className="text-sm text-gray-600 mt-1">
                Đã chọn {selectedBuildingIds.length} tòa nhà
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Trạng thái
              </label>
              <Dropdown
                options={statusOptions}
                value={buildingStatus}
                placeholder="Chọn trạng thái"
                onChange={setBuildingStatus}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Địa chỉ
              </label>
              <Input
                placeholder="Nhập địa chỉ mới (để trống nếu không thay đổi)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

