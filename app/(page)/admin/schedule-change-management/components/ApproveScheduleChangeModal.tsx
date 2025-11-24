'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Dropdown, Input } from '@/app/components/ui';
import { X, Calendar, Clock, MapPin } from 'lucide-react';
import { format, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { toast } from 'react-hot-toast';
import { scheduleChangeApi } from '../lib/api/scheduleChangeApi';
import type { LeaveRequest, AvailableRoom, AvailabilityQuery } from '../lib/types/types';
import { CLASS_PERIODS, getPeriodLabel, getPeriodTimeRange } from '../lib/types/types';
import 'react-day-picker/dist/style.css';

interface ApproveScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  request: LeaveRequest | null;
}

export const ApproveScheduleChangeModal = ({
  isOpen,
  onClose,
  onSuccess,
  request,
}: ApproveScheduleChangeModalProps) => {
  const [makeupDate, setMakeupDate] = useState<Date | undefined>(undefined);
  const [dateInputValue, setDateInputValue] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [startPeriod, setStartPeriod] = useState<number>(0);
  const [endPeriod, setEndPeriod] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [reviewNote, setReviewNote] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const selectedRoomIdRef = useRef<string>('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, onClose]);

  // Initialize form with proposed schedule if available
  useEffect(() => {
    if (!isOpen) {
      setMakeupDate(undefined);
      setDateInputValue('');
      setStartPeriod(0);
      setEndPeriod(0);
      setSelectedRoomId('');
      selectedRoomIdRef.current = '';
      setReviewNote('');
      setAvailableRooms([]);
      setLoadingAvailability(false);
    } else if (request) {
      // If request has proposed schedule, pre-fill the form
      if (request.makeUpDate && request.startPeriod > 0 && request.endPeriod > 0) {
        const proposedDate = new Date(request.makeUpDate);
        setMakeupDate(proposedDate);
        setDateInputValue(format(proposedDate, 'dd/MM/yyyy'));
        setStartPeriod(request.startPeriod);
        setEndPeriod(request.endPeriod);
      } else {
        // Otherwise, set default periods from request
        setStartPeriod(request.startPeriod);
        setEndPeriod(request.endPeriod);
      }
    }
  }, [isOpen, request]);

  // Load availability when date and periods are selected
  useEffect(() => {
    // Only load if modal is open, we have all required data and request is valid
    if (!isOpen || !makeupDate || !request || !request.requestId || startPeriod <= 0 || endPeriod <= 0) {
      if (!isOpen || !makeupDate || startPeriod <= 0 || endPeriod <= 0) {
        setAvailableRooms([]);
        setSelectedRoomId('');
      }
      return;
    }

    let isMounted = true;

    const loadAvailability = async () => {
      setLoadingAvailability(true);
      if (isMounted) {
        setAvailableRooms([]);
      }

      try {
        const query: AvailabilityQuery = {
          makeupDate: format(makeupDate, 'yyyy-MM-dd'),
          startPeriod,
          endPeriod,
        };

        const result = await scheduleChangeApi.getAvailability(request.requestId, query);
        
        if (isMounted) {
          const rooms = result.rooms || [];
          setAvailableRooms(rooms);

          // If request has proposed room code and we haven't selected a room yet, try to find and select it
          if (request.makeUpRoomCode && !selectedRoomIdRef.current && rooms.length > 0) {
            const proposedRoom = rooms.find(r => 
              r.roomName.toLowerCase().includes(request.makeUpRoomCode.toLowerCase()) ||
              r.roomId.toLowerCase() === request.makeUpRoomCode.toLowerCase()
            );
            if (proposedRoom) {
              selectedRoomIdRef.current = proposedRoom.roomId;
              setSelectedRoomId(proposedRoom.roomId);
            }
          }
        }
      } catch (error) {
        if (!isMounted) return;
        
        // Only show error toast if it's not a validation/authentication error
        const apiError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
        const errorMessage = apiError?.response?.data?.message || apiError?.message || 'Không thể tải thông tin phòng trống';
        const status = apiError?.response?.status;
        
        // Don't show toast for 401/403 errors (authentication issues)
        if (status !== 401 && status !== 403) {
          console.error('Error loading availability:', error);
          // Only show error if user is actively interacting, not on initial load
          if (makeupDate && startPeriod > 0 && endPeriod > 0) {
            toast.error(errorMessage);
          }
        }
        
        setAvailableRooms([]);
      } finally {
        if (isMounted) {
          setLoadingAvailability(false);
        }
      }
    };

    // Add a small delay to avoid rapid successive calls
    const timeoutId = setTimeout(() => {
      loadAvailability();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isOpen, makeupDate, startPeriod, endPeriod, request?.requestId, request?.makeUpRoomCode]);

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);
    
    if (value.length === 10) {
      try {
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        if (!isNaN(parsedDate.getTime())) {
          setMakeupDate(parsedDate);
          setShowCalendar(false);
        }
      } catch {
        // Invalid date format
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setMakeupDate(date);
      setDateInputValue(format(date, 'dd/MM/yyyy'));
      setShowCalendar(false);
    }
  };

  // Handler to use proposed schedule - must be before early return
  const handleUseProposedSchedule = useCallback(() => {
    if (!request) return;
    const makeUpDate = request.makeUpDate ? new Date(request.makeUpDate) : null;
    if (makeUpDate && request.startPeriod > 0 && request.endPeriod > 0) {
      setMakeupDate(makeUpDate);
      setDateInputValue(format(makeUpDate, 'dd/MM/yyyy'));
      setStartPeriod(request.startPeriod);
      setEndPeriod(request.endPeriod);
      toast.success('Đã áp dụng lịch đề xuất');
    }
  }, [request]);

  const handleSubmit = async () => {
    if (!request) return;

    if (!makeupDate) {
      toast.error('Vui lòng chọn ngày dạy bù');
      return;
    }

    if (startPeriod <= 0 || endPeriod <= 0) {
      toast.error('Vui lòng chọn tiết học');
      return;
    }

    if (startPeriod > endPeriod) {
      toast.error('Tiết bắt đầu phải nhỏ hơn hoặc bằng tiết kết thúc');
      return;
    }

    // Validate period count matches cancelled periods
    const cancelledPeriodCount = request.cancelEndPeriod - request.cancelStartPeriod + 1;
    const makeupPeriodCount = endPeriod - startPeriod + 1;
    if (makeupPeriodCount !== cancelledPeriodCount) {
      toast.error(`Số tiết dạy bù (${makeupPeriodCount}) phải bằng số tiết hủy (${cancelledPeriodCount})`);
      return;
    }

    if (!selectedRoomId) {
      toast.error('Vui lòng chọn phòng học');
      return;
    }

    if (reviewNote && reviewNote.length > 500) {
      toast.error('Ghi chú không được vượt quá 500 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        makeupDate: format(makeupDate, 'yyyy-MM-dd'),
        startPeriod,
        endPeriod,
        roomId: selectedRoomId,
        reviewNote: reviewNote.trim() || undefined,
      };

      const response = await scheduleChangeApi.approve(request.requestId, payload);

      if (response.success) {
        toast.success('Duyệt yêu cầu thành công');
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || 'Duyệt yêu cầu thất bại');
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || 'Đã xảy ra lỗi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Early return after all hooks
  if (!isOpen || !request) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const periodOptions = CLASS_PERIODS.map((p) => ({
    value: p.period.toString(),
    label: `${p.label} (${p.startTime} - ${p.endTime})`,
  }));

  const cancelDate = new Date(request.cancelDate);
  const makeUpDate = request.makeUpDate ? new Date(request.makeUpDate) : null;
  const hasProposedSchedule = makeUpDate && request.startPeriod > 0 && request.endPeriod > 0;

  // Check if current form matches proposed schedule
  const isUsingProposedSchedule = 
    makeUpDate && 
    makeupDate && 
    format(makeupDate, 'yyyy-MM-dd') === format(makeUpDate, 'yyyy-MM-dd') &&
    startPeriod === request.startPeriod &&
    endPeriod === request.endPeriod;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Duyệt yêu cầu đổi lịch</h2>
              <p className="text-sm text-gray-600 mt-1">
                Phân công lịch dạy bù cho yêu cầu {request.requestCode}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Thông tin yêu cầu */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin yêu cầu</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Giảng viên:</span>
                <p className="text-gray-900 font-medium">{request.instructorName}</p>
              </div>
              <div>
                <span className="text-gray-600">Môn học:</span>
                <p className="text-gray-900 font-medium">{request.subjectName}</p>
              </div>
              <div>
                <span className="text-gray-600">Lớp:</span>
                <p className="text-gray-900 font-medium">{request.courseClassCode}</p>
              </div>
            </div>
          </div>

          {/* Lịch hiện tại */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Lịch hiện tại (sẽ hủy)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Ngày:</span>
                <p className="text-gray-900 font-medium">
                  {format(cancelDate, 'dd/MM/yyyy', { locale: vi })}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Phòng:</span>
                <p className="text-gray-900 font-medium">{request.oldRoomCode || '-'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Tiết học:</span>
                <p className="text-gray-900 font-medium">
                  {getPeriodLabel(request.cancelStartPeriod, request.cancelEndPeriod)} ({getPeriodTimeRange(request.cancelStartPeriod, request.cancelEndPeriod)})
                </p>
              </div>
            </div>
          </div>

          {/* Lịch đề xuất */}
          {hasProposedSchedule && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-900">Lịch đề xuất</h3>
                {!isUsingProposedSchedule && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseProposedSchedule}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Sử dụng lịch đề xuất
                  </Button>
                )}
                {isUsingProposedSchedule && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Đang sử dụng
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Ngày:</span>
                  <p className="text-blue-900 font-medium">
                    {format(makeUpDate, 'dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
                {request.makeUpRoomCode && (
                  <div>
                    <span className="text-blue-700">Phòng đề xuất:</span>
                    <p className="text-blue-900 font-medium">{request.makeUpRoomCode}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-blue-700">Tiết học:</span>
                  <p className="text-blue-900 font-medium">
                    {getPeriodLabel(request.startPeriod, request.endPeriod)} ({getPeriodTimeRange(request.startPeriod, request.endPeriod)})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chọn ngày dạy bù */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                Ngày dạy bù <span className="text-red-500">*</span>
              </label>
              {hasProposedSchedule && !isUsingProposedSchedule && (
                <button
                  type="button"
                  onClick={handleUseProposedSchedule}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Sử dụng ngày đề xuất
                </button>
              )}
            </div>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="dd/MM/yyyy"
                    value={dateInputValue}
                    onChange={(e) => handleDateInputChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="border-gray-300"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
              {showCalendar && (
                <div ref={calendarRef} className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
                  <DayPicker
                    mode="single"
                    selected={makeupDate}
                    onSelect={handleCalendarSelect}
                    locale={vi}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Chọn tiết học */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Tiết bắt đầu <span className="text-red-500">*</span>
                </label>
                {hasProposedSchedule && startPeriod !== request.startPeriod && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartPeriod(request.startPeriod);
                      if (endPeriod < request.startPeriod) {
                        setEndPeriod(request.endPeriod);
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Dùng đề xuất
                  </button>
                )}
              </div>
              <Dropdown
                options={periodOptions}
                value={startPeriod.toString()}
                placeholder="Chọn tiết bắt đầu"
                onChange={(value) => {
                  setStartPeriod(Number.parseInt(value));
                  if (endPeriod < Number.parseInt(value)) {
                    setEndPeriod(Number.parseInt(value));
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Tiết kết thúc <span className="text-red-500">*</span>
                </label>
                {hasProposedSchedule && endPeriod !== request.endPeriod && (
                  <button
                    type="button"
                    onClick={() => setEndPeriod(request.endPeriod)}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Dùng đề xuất
                  </button>
                )}
              </div>
              <Dropdown
                options={periodOptions.filter((p) => Number.parseInt(p.value) >= startPeriod)}
                value={endPeriod.toString()}
                placeholder="Chọn tiết kết thúc"
                onChange={(value) => setEndPeriod(Number.parseInt(value))}
              />
            </div>
          </div>

          {/* Chọn phòng học */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Phòng học <span className="text-red-500">*</span>
            </label>
            {loadingAvailability ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Đang tải danh sách phòng trống...</p>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  {makeupDate && startPeriod > 0 && endPeriod > 0
                    ? 'Không có phòng trống trong khung giờ đã chọn'
                    : 'Vui lòng chọn ngày và tiết học để xem danh sách phòng trống'}
                </p>
              </div>
            ) : (
              <Dropdown
                options={availableRooms.map((room) => ({
                  value: room.roomId,
                  label: `${room.roomName} (Sức chứa: ${room.capacity})`,
                }))}
                value={selectedRoomId}
                placeholder="Chọn phòng học"
                onChange={(value) => {
                  selectedRoomIdRef.current = value;
                  setSelectedRoomId(value);
                }}
              />
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Ghi chú (Tối đa 500 ký tự)
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Thêm ghi chú cho yêu cầu này"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053AD] focus:border-[#0053AD] resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewNote.length}/500 ký tự
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !makeupDate || !selectedRoomId || startPeriod <= 0 || endPeriod <= 0}
            className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
};

