'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Bell, Clock, CheckCircle2, XCircle, Calendar, Filter, ChevronDown, ChevronUp, X, Edit2, CircleCheck } from 'lucide-react';
import { Dropdown, DropdownSearch, SearchInput, Button, Input } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { commonApi } from '@/lib/api/common';
import type { Faculty, Department, Class, Instructor, Student } from '@/lib/types/common';
import { NOTIFICATION_TYPE_OPTIONS, SENDING_METHOD_OPTIONS } from './lib/types/types';
import { AddNotificationModal } from './components/AddNotificationModal';
import { EditNotificationModal } from './components/EditNotificationModal';
import { SendNotificationModal } from './components/SendNotificationModal';
import { ArchiveNotificationModal } from './components/ArchiveNotificationModal';
import { CancelNotificationModal } from './components/CancelNotificationModal';
import { ViewNotificationDetailModal } from './components/ViewNotificationDetailModal';
import { BulkEditNotificationModal } from './components/BulkEditNotificationModal';
import { NotificationActionsMenu } from './components/NotificationActionsMenu';
import { NotificationStatCard } from './components/NotificationStatCard';
import { ResizableTable, ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable';
import { TableSkeleton } from '@/app/(page)/admin/student-profile/components/LoadingSkeleton';
import { useNotifications } from './lib/hooks/useNotifications';
import { 
  getStatusDisplay, 
  getNotificationTypeDisplay, 
  getTargetTypeDisplay, 
  getSendingMethodDisplay,
  STATUS_OPTIONS 
} from './lib/types/types';
import type { Notification, NotificationStatus } from './lib/types/types';

const STAT_CARDS = [
  { 
    key: 'total', 
    label: 'Tổng thông báo', 
    bgColor: 'bg-[#FFDDAA]',
    iconColor: 'text-[#CC8800]',
    Icon: Bell
  },
  { 
    key: 'pending', 
    label: 'Đang chờ', 
    bgColor: 'bg-[#FFF4CC]',
    iconColor: 'text-[#CCAA00]',
    Icon: Clock
  },
  { 
    key: 'sent', 
    label: 'Đã gửi', 
    bgColor: 'bg-[#CCEECC]',
    iconColor: 'text-[#44AA44]',
    Icon: CheckCircle2
  },
  { 
    key: 'cancelled', 
    label: 'Đã hủy', 
    bgColor: 'bg-[#FFBBAA]',
    iconColor: 'text-[#CC4444]',
    Icon: XCircle
  },
] as const;

export default function NotificationManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTargetType, setSelectedTargetType] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Advanced filters
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedNotificationType, setSelectedNotificationType] = useState<string>('');
  const [selectedSendingMethod, setSelectedSendingMethod] = useState<string>('');
  
  // Data for advanced filters
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingAdvancedData, setLoadingAdvancedData] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewDetailModalOpen, setIsViewDetailModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
  const [actionNotification, setActionNotification] = useState<Notification | null>(null);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<Set<string>>(new Set());

  const { notifications, loading, currentPage, totalCount, totalPages, stats, fetchNotifications, setCurrentPage } = useNotifications();

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'title', label: 'Tiêu đề', width: 250, minWidth: 200, align: 'left', visible: true, required: true },
    { key: 'notificationType', label: 'Loại', width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'targetType', label: 'Đối tượng', width: 180, minWidth: 150, align: 'left', visible: true },
    { key: 'sendingMethod', label: 'Phương thức', width: 140, minWidth: 120, align: 'center', visible: true },
    { key: 'totalRecipients', label: 'Người nhận', width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'status', label: 'Trạng thái', width: 140, minWidth: 120, align: 'center', visible: true },
    { key: 'scheduledDate', label: 'Ngày lên lịch', width: 180, minWidth: 150, align: 'left', visible: true },
    { key: 'createdAt', label: 'Ngày tạo', width: 180, minWidth: 150, align: 'left', visible: true },
    { key: 'actions', label: 'Thao tác', width: 140, minWidth: 100, align: 'center', visible: true, required: true },
  ]);

  // Load advanced filter data
  useEffect(() => {
    const loadAdvancedData = async () => {
      if (!isAdvancedFilterOpen) return;
      
      setLoadingAdvancedData(true);
      try {
        // Load faculties - limit to 15 items (search available)
        const facultiesRes = await commonApi.getFaculties();
        if (facultiesRes.success && facultiesRes.data) {
          setFaculties(facultiesRes.data.slice(0, 15));
        }
        
        // Load departments (if faculty is selected) - limit to 15 items (search available)
        if (selectedFaculty) {
          const departmentsRes = await commonApi.getDepartments({ facultyId: selectedFaculty });
          if (departmentsRes.success && departmentsRes.data) {
            setDepartments(departmentsRes.data.slice(0, 15));
          }
        } else {
          const departmentsRes = await commonApi.getDepartments();
          if (departmentsRes.success && departmentsRes.data) {
            setDepartments(departmentsRes.data.slice(0, 15));
          }
        }
        
        // Load classes (if department is selected) - limit to 15 items (search available)
        if (selectedDepartment) {
          const classesRes = await commonApi.getClasses({ departmentId: selectedDepartment });
          if (classesRes.success && classesRes.data) {
            setClasses(classesRes.data.slice(0, 15));
          }
        } else if (selectedFaculty) {
          const classesRes = await commonApi.getClasses({ facultyId: selectedFaculty });
          if (classesRes.success && classesRes.data) {
            setClasses(classesRes.data.slice(0, 15));
          }
        } else {
          const classesRes = await commonApi.getClasses();
          if (classesRes.success && classesRes.data) {
            setClasses(classesRes.data.slice(0, 15));
          }
        }
        
        // Load instructors - limit to 15 items (search available)
        const instructorsRes = await commonApi.getInstructors();
        if (instructorsRes.success && instructorsRes.data) {
          setInstructors(instructorsRes.data.slice(0, 15));
        }
        
        // Load students - limit to 15 items (search available)
        const studentsRes = await commonApi.getStudents({ 
          pageNumber: 1, 
          pageSize: 15 // Reduced from 100 to 15
        });
        if (studentsRes.success && studentsRes.data) {
          setStudents(studentsRes.data);
        }
      } catch (error) {
        console.error('Error loading advanced filter data:', error);
      } finally {
        setLoadingAdvancedData(false);
      }
    };
    
    loadAdvancedData();
  }, [isAdvancedFilterOpen, selectedFaculty, selectedDepartment]);

  // Reset department when faculty changes
  useEffect(() => {
    if (selectedFaculty) {
      setSelectedDepartment('');
      setSelectedClass('');
    }
  }, [selectedFaculty]);

  // Reset class when department changes
  useEffect(() => {
    if (selectedDepartment) {
      setSelectedClass('');
    }
  }, [selectedDepartment]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setCurrentPage]);

  useEffect(() => {
    fetchNotifications({
      pageIndex: currentPage,
      pageSize: 20,
      searchTerm: searchKeyword || undefined,
      status: (selectedStatus || undefined) as NotificationStatus | undefined,
      targetType: (selectedTargetType || undefined) as 'all' | 'student' | 'instructor' | undefined,
    });
  }, [currentPage, searchKeyword, selectedStatus, selectedTargetType, fetchNotifications]);

  // Filter notifications on client side with all filters
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filter by date range (createdAt)
    if (startDate || endDate) {
      filtered = filtered.filter((notification) => {
        if (!notification.createdAt) return false;
        
        const notificationDate = new Date(notification.createdAt);
        notificationDate.setHours(0, 0, 0, 0);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (notificationDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (notificationDate > end) return false;
        }
        
        return true;
      });
    }

    // Filter by notification type
    if (selectedNotificationType) {
      filtered = filtered.filter((notification) => 
        notification.notificationType === selectedNotificationType
      );
    }

    // Filter by sending method
    if (selectedSendingMethod) {
      filtered = filtered.filter((notification) => 
        notification.sendingMethod === selectedSendingMethod
      );
    }

    // Filter by target type and specific target
    if (selectedFaculty || selectedDepartment || selectedClass || selectedInstructor || selectedStudent) {
      filtered = filtered.filter((notification) => {
        // Check if notification matches selected filters
        if (selectedFaculty && notification.targetType === 'faculty' && notification.targetId === selectedFaculty) {
          return true;
        }
        if (selectedDepartment && notification.targetType === 'department' && notification.targetId === selectedDepartment) {
          return true;
        }
        if (selectedClass && notification.targetType === 'class' && notification.targetId === selectedClass) {
          return true;
        }
        if (selectedInstructor && notification.targetType === 'instructor' && notification.targetId === selectedInstructor) {
          return true;
        }
        if (selectedStudent && notification.targetType === 'student' && notification.targetId === selectedStudent) {
          return true;
        }
        
        // If we have filters but notification doesn't match, exclude it
        // But keep notifications that target "all" or broader groups
        if (selectedFaculty || selectedDepartment || selectedClass) {
          // For faculty/department/class filters, only show exact matches or broader targets
          return ['all', 'all_students', 'all_instructors'].includes(notification.targetType);
        }
        
        return false;
      });
    }

    return filtered;
  }, [
    notifications, 
    startDate, 
    endDate, 
    selectedNotificationType, 
    selectedSendingMethod,
    selectedFaculty,
    selectedDepartment,
    selectedClass,
    selectedInstructor,
    selectedStudent
  ]);

  // Check if any advanced filters are active
  const hasActiveAdvancedFilters = useMemo(() => {
    return !!(
      selectedFaculty ||
      selectedDepartment ||
      selectedClass ||
      selectedInstructor ||
      selectedStudent ||
      selectedNotificationType ||
      selectedSendingMethod
    );
  }, [
    selectedFaculty,
    selectedDepartment,
    selectedClass,
    selectedInstructor,
    selectedStudent,
    selectedNotificationType,
    selectedSendingMethod
  ]);

  // Reset all advanced filters
  const resetAdvancedFilters = useCallback(() => {
    setSelectedFaculty('');
    setSelectedDepartment('');
    setSelectedClass('');
    setSelectedInstructor('');
    setSelectedStudent('');
    setSelectedNotificationType('');
    setSelectedSendingMethod('');
    setCurrentPage(1);
  }, [setCurrentPage]);

  const statValues = useMemo(() => ({
    total: stats.totalNotifications,
    pending: stats.pendingNotifications,
    sent: stats.sentNotifications,
    cancelled: stats.cancelledNotifications,
  }), [stats]);

  const handleViewClick = useCallback((notification: Notification) => {
    setViewingNotification(notification);
    setIsViewDetailModalOpen(true);
  }, []);

  const handleEditClick = useCallback((notification: Notification) => {
    setEditingNotification(notification);
    setIsEditModalOpen(true);
  }, []);

  const handleSendClick = useCallback((notification: Notification) => {
    setActionNotification(notification);
    setIsSendModalOpen(true);
  }, []);

  const handleArchiveClick = useCallback((notification: Notification) => {
    setActionNotification(notification);
    setIsArchiveModalOpen(true);
  }, []);

  const handleCancelClick = useCallback((notification: Notification) => {
    setActionNotification(notification);
    setIsCancelModalOpen(true);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedNotificationIds.size === filteredNotifications.length) {
      setSelectedNotificationIds(new Set());
    } else {
      setSelectedNotificationIds(new Set(filteredNotifications.map(n => n.scheduleId)));
    }
  }, [filteredNotifications, selectedNotificationIds.size]);

  const handleSelectOne = useCallback((notificationId: string) => {
    setSelectedNotificationIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchNotifications({
      pageIndex: currentPage,
      pageSize: 20,
      searchTerm: searchKeyword || undefined,
      status: (selectedStatus || undefined) as NotificationStatus | undefined,
      targetType: (selectedTargetType || undefined) as 'all' | 'student' | 'instructor' | undefined,
    });
  }, [currentPage, searchKeyword, selectedStatus, selectedTargetType, fetchNotifications]);

  const renderNotificationRow = useCallback((notification: Notification, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(notification.status);
    const typeDisplay = getNotificationTypeDisplay(notification.notificationType || 'event');
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    // Calculate isCompact once at the beginning to avoid scope issues
    const isCompact = parseFloat(cellStyle.paddingX) < 20;
    const isSelected = selectedNotificationIds.has(notification.scheduleId);

    return (
      <>
        {visibleColumns.map((column) => {
          const widthPercent = (column as { widthPercent?: number }).widthPercent || 
            (baseTotalWidth > 0 ? (column.width / baseTotalWidth) * 100 : 100 / visibleColumns.length);
          
          const cellPaddingStyle = {
            width: `${widthPercent}%`,
            paddingLeft: cellStyle.paddingX,
            paddingRight: cellStyle.paddingX,
            paddingTop: cellStyle.paddingY,
            paddingBottom: cellStyle.paddingY,
          };

          switch (column.key) {
            case 'checkbox':
              return (
                <td key="checkbox" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(notification.scheduleId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'title':
              return (
                <td key="title" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {notification.title}
                </td>
              );
            case 'notificationType':
              const typeFontSize = isCompact ? '0.65rem' : '0.75rem';
              const typePadding = isCompact ? '0.125rem 0.375rem' : '0.25rem 0.5rem';
              return (
                <td key="notificationType" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <span className={`text-center font-medium rounded ${typeDisplay.color}`} style={{ 
                      padding: typePadding,
                      fontSize: typeFontSize,
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap',
                    }}>
                      {typeDisplay.label}
                    </span>
                  </div>
                </td>
              );
            case 'targetType':
              return (
                <td key="targetType" className="text-gray-700" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getTargetTypeDisplay(notification.targetType)}
                  {notification.targetValue && (
                    <span className="text-gray-500 text-xs ml-1">({notification.targetValue})</span>
                  )}
                </td>
              );
            case 'sendingMethod':
              return (
                <td key="sendingMethod" className="text-gray-700 text-center" style={cellPaddingStyle}>
                  {getSendingMethodDisplay(notification.sendingMethod)}
                </td>
              );
            case 'totalRecipients':
              return (
                <td key="totalRecipients" className="text-gray-700 text-center" style={cellPaddingStyle}>
                  {notification.totalRecipients || 0}
                </td>
              );
            case 'status':
              const statusFontSize = isCompact ? '0.65rem' : '0.75rem';
              const statusPadding = isCompact ? '0.125rem 0.375rem' : '0.25rem 0.5rem';
              return (
                <td key="status" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <span className={`text-center font-medium rounded ${statusDisplay.color}`} style={{ 
                      padding: statusPadding,
                      fontSize: statusFontSize,
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap',
                    }}>
                      {statusDisplay.label}
                    </span>
                  </div>
                </td>
              );
            case 'scheduledDate':
              return (
                <td key="scheduledDate" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {notification.scheduledDate ? new Date(notification.scheduledDate).toLocaleString('vi-VN') : '-'}
                </td>
              );
            case 'createdAt':
              return (
                <td key="createdAt" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : '-'}
                </td>
              );
            case 'actions':
              return (
                <td key="actions" style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}>
                  <NotificationActionsMenu
                    notification={notification}
                    onView={() => handleViewClick(notification)}
                    onEdit={() => handleEditClick(notification)}
                    onSend={() => handleSendClick(notification)}
                    onArchive={() => handleArchiveClick(notification)}
                    onCancel={() => handleCancelClick(notification)}
                    compact={(column.width || 0) < 120}
                  />
                </td>
              );
            default:
              return null;
          }
        })}
      </>
    );
  }, [handleEditClick, handleSendClick, handleArchiveClick, handleCancelClick, handleSelectOne, selectedNotificationIds]);

  const statusOptions = [...STATUS_OPTIONS];
  const targetTypeOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'all', label: 'Tất cả người dùng' },
    { value: 'student', label: 'Sinh viên' },
    { value: 'instructor', label: 'Giảng viên' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Thông báo</h1>
        <p className="text-gray-600 mt-1">Quản lý và gửi thông báo đến người dùng</p>
      </div>

      {/* Stats Cards */}
      {loading && notifications.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
          {STAT_CARDS.map((card, index) => {
            const value = statValues[card.key as keyof typeof statValues];
            return (
              <NotificationStatCard
                key={index}
                label={card.label}
                value={value}
                Icon={card.Icon}
                bgColor={card.bgColor}
                iconColor={card.iconColor}
              />
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          {/* Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Danh sách Thông báo
              </h2>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                <Plus className="w-4 h-4" />
                Tạo thông báo
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedNotificationIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  Đã chọn {selectedNotificationIds.size} thông báo
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkEditModalOpen(true)}
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh sửa toàn bộ
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedNotificationIds(new Set())}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  Bỏ chọn
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-4">
            {/* First Row: Search and Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {/* Search Input */}
              <div className="sm:col-span-2">
                <SearchInput
                  placeholder="Tìm kiếm theo tiêu đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Dropdown */}
              <Dropdown
                options={statusOptions}
                value={selectedStatus || ''}
                placeholder="Tất cả trạng thái"
                onChange={(value) => {
                  setSelectedStatus(value);
                  setCurrentPage(1);
                }}
              />

              {/* Target Type Dropdown */}
              <Dropdown
                options={targetTypeOptions}
                value={selectedTargetType || ''}
                placeholder="Tất cả đối tượng"
                onChange={(value) => {
                  setSelectedTargetType(value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Second Row: Date Range Filter and Advanced Filter Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Từ ngày
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Đến ngày
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  min={startDate || undefined}
                  className="w-full"
                />
              </div>
              {(startDate || endDate) && (
                <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setCurrentPage(1);
                    }}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Xóa bộ lọc ngày
                  </Button>
                </div>
              )}
              {/* Advanced Filter Button */}
              <div className={`sm:col-span-2 ${(startDate || endDate) ? 'lg:col-span-1' : 'lg:col-span-2'} flex items-end`}>
                <Button
                  variant="outline"
                  onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                  className={`w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 ${hasActiveAdvancedFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Lọc nâng cao</span>
                  {hasActiveAdvancedFilters && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      Đang lọc
                    </span>
                  )}
                  {isAdvancedFilterOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Advanced Filters Content */}
            {isAdvancedFilterOpen && (
              <div className="border-t border-gray-200 pt-4 mt-4 animate-in slide-in-from-top-2 duration-200">

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Notification Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Loại thông báo
                      </label>
                      <Dropdown
                        options={[
                          { value: '', label: 'Tất cả' },
                          ...NOTIFICATION_TYPE_OPTIONS
                        ]}
                        value={selectedNotificationType || ''}
                        placeholder="Chọn loại thông báo"
                        onChange={(value) => {
                          setSelectedNotificationType(value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    {/* Sending Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phương thức gửi
                      </label>
                      <Dropdown
                        options={[
                          { value: '', label: 'Tất cả' },
                          ...SENDING_METHOD_OPTIONS
                        ]}
                        value={selectedSendingMethod || ''}
                        placeholder="Chọn phương thức"
                        onChange={(value) => {
                          setSelectedSendingMethod(value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    {/* Faculty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Khoa/Viện
                      </label>
                      {loadingAdvancedData ? (
                        <div className="text-sm text-gray-500 py-2">Đang tải...</div>
                      ) : (
                        <DropdownSearch
                          options={[
                            { value: '', label: 'Tất cả' },
                            ...faculties.map(f => ({ value: f.facultyId, label: f.facultyName }))
                          ]}
                          value={selectedFaculty || ''}
                          placeholder="Chọn khoa/viện"
                          searchPlaceholder="Tìm kiếm khoa/viện..."
                          onChange={(value) => {
                            setSelectedFaculty(value);
                            setCurrentPage(1);
                          }}
                        />
                      )}
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Bộ môn
                      </label>
                      {loadingAdvancedData ? (
                        <div className="text-sm text-gray-500 py-2">Đang tải...</div>
                      ) : (
                        <DropdownSearch
                          options={[
                            { value: '', label: 'Tất cả' },
                            ...departments.map(d => ({ value: d.departmentId, label: d.departmentName }))
                          ]}
                          value={selectedDepartment || ''}
                          placeholder="Chọn bộ môn"
                          searchPlaceholder="Tìm kiếm bộ môn..."
                          onChange={(value) => {
                            setSelectedDepartment(value);
                            setCurrentPage(1);
                          }}
                          disabled={!selectedFaculty && departments.length === 0}
                        />
                      )}
                    </div>

                    {/* Class */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Lớp học
                      </label>
                      {loadingAdvancedData ? (
                        <div className="text-sm text-gray-500 py-2">Đang tải...</div>
                      ) : (
                        <DropdownSearch
                          options={[
                            { value: '', label: 'Tất cả' },
                            ...classes.map(c => {
                              const parts = [c.className];
                              if (c.classCode) {
                                parts.unshift(`[${c.classCode}]`);
                              }
                              if (c.departmentName) {
                                parts.push(`- ${c.departmentName}`);
                              }
                              return { 
                                value: c.classId, 
                                label: parts.join(' ') 
                              };
                            })
                          ]}
                          value={selectedClass || ''}
                          placeholder="Chọn lớp học"
                          searchPlaceholder="Tìm kiếm lớp học..."
                          onChange={(value) => {
                            setSelectedClass(value);
                            setCurrentPage(1);
                          }}
                        />
                      )}
                    </div>

                    {/* Instructor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Giảng viên
                      </label>
                      {loadingAdvancedData ? (
                        <div className="text-sm text-gray-500 py-2">Đang tải...</div>
                      ) : (
                        <DropdownSearch
                          options={[
                            { value: '', label: 'Tất cả' },
                            ...instructors.map(i => ({ 
                              value: i.instructorId || i.id || i.userId || '', 
                              label: i.instructorName || i.fullName || i.name || i.instructorCode || i.code || 'Không có tên' 
                            }))
                          ]}
                          value={selectedInstructor || ''}
                          placeholder="Chọn giảng viên"
                          searchPlaceholder="Tìm kiếm giảng viên..."
                          onChange={(value) => {
                            setSelectedInstructor(value);
                            setCurrentPage(1);
                          }}
                        />
                      )}
                    </div>

                    {/* Student */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Sinh viên
                      </label>
                      {loadingAdvancedData ? (
                        <div className="text-sm text-gray-500 py-2">Đang tải...</div>
                      ) : (
                        <DropdownSearch
                          options={[
                            { value: '', label: 'Tất cả' },
                            ...students.map(s => {
                              const value = s.studentId || s.id || s.userId || '';
                              const name = s.fullName || s.name || 'Không có tên';
                              const code = s.studentCode || s.code || s.id || 'N/A';
                              return { 
                                value, 
                                label: `${name} (${code})` 
                              };
                            })
                          ]}
                          value={selectedStudent || ''}
                          placeholder="Chọn sinh viên"
                          searchPlaceholder="Tìm kiếm sinh viên..."
                          onChange={(value) => {
                            setSelectedStudent(value);
                            setCurrentPage(1);
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Reset Button */}
                  {hasActiveAdvancedFilters && (
                    <div className="flex justify-end pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={resetAdvancedFilters}
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Xóa tất cả bộ lọc nâng cao
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            <ResizableTable
              columns={resizableColumns}
              data={filteredNotifications}
              renderRow={(notification, visibleColumns, cellStyle) => (
                <tr key={notification.scheduleId} className="hover:bg-gray-50 transition-colors">
                  {renderNotificationRow(notification, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage="Không có dữ liệu"
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={filteredNotifications.length > 0 && selectedNotificationIds.size === filteredNotifications.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedNotificationIds.size > 0 && selectedNotificationIds.size < filteredNotifications.length;
                    }
                  }}
                />
              )}
            />
          </div>
        </div>

        {/* Pagination */}
        <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={
              startDate || endDate || hasActiveAdvancedFilters 
                ? filteredNotifications.length 
                : totalCount
            }
            pageSize={20}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modals */}
      <AddNotificationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <ViewNotificationDetailModal
        isOpen={isViewDetailModalOpen}
        onClose={() => {
          setIsViewDetailModalOpen(false);
          setViewingNotification(null);
        }}
        notification={viewingNotification}
      />

      <EditNotificationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingNotification(null);
        }}
        notification={editingNotification}
        onSuccess={handleRefresh}
      />

      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => {
          setIsSendModalOpen(false);
          setActionNotification(null);
        }}
        notification={actionNotification}
        onSuccess={handleRefresh}
      />

      <ArchiveNotificationModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setActionNotification(null);
        }}
        notification={actionNotification}
        onSuccess={handleRefresh}
      />

      <CancelNotificationModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setActionNotification(null);
        }}
        notification={actionNotification}
        onSuccess={handleRefresh}
      />

      <BulkEditNotificationModal
        isOpen={isBulkEditModalOpen}
        onClose={() => {
          setIsBulkEditModalOpen(false);
          setSelectedNotificationIds(new Set());
        }}
        selectedNotificationIds={Array.from(selectedNotificationIds)}
        onSuccess={() => {
          setSelectedNotificationIds(new Set());
          handleRefresh();
        }}
      />
    </div>
  );
}

