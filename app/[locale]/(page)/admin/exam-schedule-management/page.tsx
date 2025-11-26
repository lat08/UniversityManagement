'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, FileDown, Trash2, X, CircleCheck } from 'lucide-react';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { useTranslations } from 'next-intl';
import { Pagination } from '@/app/components/ui/pagination';
import { AddExamScheduleModal } from './components/AddExamScheduleModal';
import { EditExamScheduleModal } from './components/EditExamScheduleModal';
import { ViewExamScheduleDetailModal } from './components/ViewExamScheduleDetailModal';
import { ConfirmPublishModal } from './components/ConfirmPublishModal';
import { ConfirmCancelModal } from './components/ConfirmCancelModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { BulkCancelModal } from './components/BulkCancelModal';
import { BulkPublishModal } from './components/BulkPublishModal';
import { BulkDeleteModal } from './components/BulkDeleteModal';
import { ExportExcelModal } from './components/ExportExcelModal';
import { ExamScheduleActionsMenu } from './components/ExamScheduleActionsMenu';
import { ResizableTable, ResizableColumn } from '@/app/[locale]/(page)/admin/student-profile/components/ResizableTable';
import { TableSkeleton } from '@/app/[locale]/(page)/admin/student-profile/components/LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { useExamSchedules } from './lib/hooks/useExamSchedules';
import { examSchedulesApi } from './lib/api/examSchedulesApi';
import { commonApi } from '@/lib/api/common';
import { getStatusDisplay, STATUS_OPTIONS, getExamFormatLabel } from './lib/types/types';
import type { ExamSchedule, ExamScheduleDetail, CourseClass } from './lib/types/types';
import type { Semester } from '@/lib/types/common';

export default function ExamScheduleManagementPage() {
  const t = useTranslations('admin.examScheduleManagement');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubjectName, setSearchSubjectName] = useState('');
  const [searchClassName, setSearchClassName] = useState('');
  const [searchRoomCode, setSearchRoomCode] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkCancelModalOpen, setIsBulkCancelModalOpen] = useState(false);
  const [isBulkPublishModalOpen, setIsBulkPublishModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingExamSchedule, setEditingExamSchedule] = useState<ExamScheduleDetail | null>(null);
  const [viewingExamScheduleId, setViewingExamScheduleId] = useState<string | null>(null);
  const [publishingExamSchedule, setPublishingExamSchedule] = useState<ExamSchedule | null>(null);
  const [cancellingExamSchedule, setCancellingExamSchedule] = useState<ExamSchedule | null>(null);
  const [deletingExamSchedule, setDeletingExamSchedule] = useState<ExamSchedule | null>(null);
  const [selectedExamScheduleIds, setSelectedExamScheduleIds] = useState<Set<string>>(new Set());
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [currentSemesterInfo, setCurrentSemesterInfo] = useState<Semester | null>(null);

  const { examSchedules, loading, currentPage, totalCount, totalPages, fetchExamSchedules, setCurrentPage } = useExamSchedules();

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'subjectCode', label: t('columns.subjectCode'), width: 100, minWidth: 80, align: 'left', visible: true, required: true },
    { key: 'subjectName', label: t('columns.subjectName'), width: 200, minWidth: 150, align: 'left', visible: true, required: true },
    { key: 'className', label: t('columns.className'), width: 120, minWidth: 100, align: 'left', visible: true },
    { key: 'examDate', label: t('columns.examDate'), width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'examTime', label: t('columns.examTime'), width: 100, minWidth: 80, align: 'center', visible: true },
    { key: 'roomCode', label: t('columns.roomCode'), width: 120, minWidth: 100, align: 'left', visible: true },
    { key: 'examFormat', label: t('columns.examFormat'), width: 150, minWidth: 120, align: 'left', visible: true },
    { key: 'status', label: t('columns.status'), width: 140, minWidth: 120, align: 'center', visible: true },
    { key: 'actions', label: t('columns.actions'), width: 100, minWidth: 80, align: 'center', visible: true, required: true },
  ]);

  // Load semesters and classes
  useEffect(() => {
    loadCommonData();
  }, []);

  const resolveCurrentSemester = (items: Semester[]): Semester | null => {
    if (!Array.isArray(items) || items.length === 0) return null;
    const today = new Date();
    const normalized = items
      .map((semester) => {
        const start = semester.startDate ? new Date(semester.startDate) : null;
        const end = semester.endDate ? new Date(semester.endDate) : null;
        return start && end ? { raw: semester, start, end } : null;
      })
      .filter((entry): entry is { raw: Semester; start: Date; end: Date } => entry !== null)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const running = normalized.find(
      (semester) => today >= semester.start && today <= semester.end
    );
    if (running) return running.raw;

    const upcoming = normalized.find((semester) => semester.start > today);
    if (upcoming) return upcoming.raw;

    const past = [...normalized].reverse().find((semester) => semester.start <= today);
    if (past) return past.raw;

    return items[0];
  };

  const formatSemesterRange = (semester: Semester | null) => {
    if (!semester?.startDate || !semester?.endDate) return '';
    const start = new Date(semester.startDate).toLocaleDateString('vi-VN');
    const end = new Date(semester.endDate).toLocaleDateString('vi-VN');
    return `${start} - ${end}`;
  };

  const loadCommonData = async () => {
    try {
      const [semestersRes, courseClassesRes] = await Promise.all([
        commonApi.getSemesters(),
        commonApi.getCourseClassesBySubject(), // Get all course classes without subjectId filter
      ]);
      if (semestersRes.success) {
        const semesterData = semestersRes.data || [];
        setSemesters(semesterData);
        const defaultSemester = resolveCurrentSemester(semesterData);
        setCurrentSemesterInfo(defaultSemester);
        setSelectedSemester((prev) => prev || defaultSemester?.semesterId || '');
      }
      if (courseClassesRes.success) setCourseClasses(courseClassesRes.data || []);
    } catch {
      // Silent fail
    }
  };

  const handleJumpToCurrentSemester = useCallback(() => {
    if (!currentSemesterInfo) return;
    setSelectedSemester(currentSemesterInfo.semesterId);
    setCurrentPage(1);
  }, [currentSemesterInfo, setCurrentPage]);

  // Combine all search terms into one searchKeyword
  useEffect(() => {
    const timer = setTimeout(() => {
      const searchTerms: string[] = [];
      if (searchQuery.trim()) searchTerms.push(searchQuery.trim());
      if (searchSubjectName.trim()) searchTerms.push(searchSubjectName.trim());
      if (searchClassName.trim()) searchTerms.push(searchClassName.trim());
      if (searchRoomCode.trim()) searchTerms.push(searchRoomCode.trim());
      
      // Combine all search terms - backend will search across all fields
      const combinedSearch = searchTerms.length > 0 ? searchTerms.join(' ') : '';
      setSearchKeyword(combinedSearch);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchSubjectName, searchClassName, searchRoomCode, setCurrentPage]);

  useEffect(() => {
    fetchExamSchedules({
      pageNumber: currentPage,
      pageSize: 20,
      searchTerm: searchKeyword || undefined,
      semesterId: selectedSemester || undefined,
      courseClassId: selectedClass || undefined,
      status: (selectedStatus as 'scheduled' | 'published' | 'cancelled' | 'completed' | undefined) || undefined,
    });
  }, [currentPage, searchKeyword, selectedSemester, selectedClass, selectedStatus, fetchExamSchedules]);

  const handleViewClick = useCallback((examSchedule: ExamSchedule) => {
    setViewingExamScheduleId(examSchedule.id);
    setIsViewModalOpen(true);
  }, []);

  const handleEditClick = useCallback((examSchedule: ExamSchedule) => {
    if (examSchedule.status !== 'scheduled') {
      toast.error(t('canOnlyEditReady'));
      return;
    }
    examSchedulesApi.getById(examSchedule.id).then((detail) => {
      setEditingExamSchedule(detail);
      setIsEditModalOpen(true);
    }).catch(() => {
      toast.error(t('loadError'));
    });
  }, [t]);

  const handlePublishClick = useCallback((examSchedule: ExamSchedule) => {
    setPublishingExamSchedule(examSchedule);
    setIsPublishModalOpen(true);
  }, []);

  const handleCancelClick = useCallback((examSchedule: ExamSchedule) => {
    setCancellingExamSchedule(examSchedule);
    setIsCancelModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((examSchedule: ExamSchedule) => {
    setDeletingExamSchedule(examSchedule);
    setIsDeleteModalOpen(true);
  }, []);

  const handlePublishConfirm = async () => {
    if (!publishingExamSchedule) return;
    const res = await examSchedulesApi.publish({ ids: [publishingExamSchedule.id] });
    if (res.success) {
      toast.success('Công bố lịch thi thành công');
      fetchExamSchedules({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        semesterId: selectedSemester || undefined,
        courseClassId: selectedClass || undefined,
        status: (selectedStatus as 'scheduled' | 'published' | 'cancelled' | 'completed' | undefined) || undefined,
      });
    } else {
      toast.error(res.message || 'Công bố lịch thi thất bại');
    }
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancellingExamSchedule) return;
    const res = await examSchedulesApi.cancel({ ids: [cancellingExamSchedule.id], reason });
    if (res.success) {
      toast.success('Hủy lịch thi thành công');
      fetchExamSchedules({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        semesterId: selectedSemester || undefined,
        courseClassId: selectedClass || undefined,
        status: (selectedStatus as 'scheduled' | 'published' | 'cancelled' | 'completed' | undefined) || undefined,
      });
    } else {
      toast.error(res.message || 'Hủy lịch thi thất bại');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExamSchedule) return;
    const res = await examSchedulesApi.delete({ ids: [deletingExamSchedule.id] });
    if (res.success) {
      toast.success('Xóa lịch thi thành công');
      fetchExamSchedules({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        semesterId: selectedSemester || undefined,
        courseClassId: selectedClass || undefined,
        status: (selectedStatus as 'scheduled' | 'published' | 'cancelled' | 'completed' | undefined) || undefined,
      });
    } else {
      toast.error(res.message || 'Xóa lịch thi thất bại');
    }
  };

  const handleSelectAll = useCallback(() => {
    if (selectedExamScheduleIds.size === examSchedules.length) {
      setSelectedExamScheduleIds(new Set());
    } else {
      setSelectedExamScheduleIds(new Set(examSchedules.map((es) => es.id)));
    }
  }, [examSchedules, selectedExamScheduleIds.size]);

  const handleSelectOne = useCallback((examScheduleId: string) => {
    setSelectedExamScheduleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(examScheduleId)) {
        newSet.delete(examScheduleId);
      } else {
        newSet.add(examScheduleId);
      }
      return newSet;
    });
  }, []);

  const hasCancelledSelected = useCallback(() => {
    return examSchedules.some(
      (schedule) => selectedExamScheduleIds.has(schedule.id) && schedule.status === 'cancelled'
    );
  }, [examSchedules, selectedExamScheduleIds]);

  const handleOpenBulkPublishModal = useCallback(() => {
    if (hasCancelledSelected()) {
      toast.error('Không thể công bố lịch thi đã bị hủy. Vui lòng bỏ chọn các lịch thi này.');
      return;
    }
    setIsBulkPublishModalOpen(true);
  }, [hasCancelledSelected]);

  const handleBulkPublish = async () => {
    if (hasCancelledSelected()) {
      toast.error('Không thể công bố lịch thi đã bị hủy. Vui lòng bỏ chọn các lịch thi này.');
      return;
    }
    const ids = Array.from(selectedExamScheduleIds);
    const res = await examSchedulesApi.publish({ ids });
    if (res.success) {
      toast.success(res.message || `Đã công bố ${ids.length} lịch thi`);
      setSelectedExamScheduleIds(new Set());
      setIsBulkPublishModalOpen(false);
      fetchExamSchedules({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        semesterId: selectedSemester || undefined,
        courseClassId: selectedClass || undefined,
        status: (selectedStatus as 'scheduled' | 'published' | 'cancelled' | 'completed' | undefined) || undefined,
      });
    } else {
      toast.error(res.message || 'Công bố hàng loạt thất bại');
    }
  };

  const handleBulkCancel = async (reason: string) => {
    const ids = Array.from(selectedExamScheduleIds);
    const res = await examSchedulesApi.cancel({ ids, reason });
    if (res.success) {
      toast.success(res.message || `Đã hủy ${ids.length} lịch thi`);
      setSelectedExamScheduleIds(new Set());
      setIsBulkCancelModalOpen(false);
      fetchExamSchedules({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        semesterId: selectedSemester || undefined,
        courseClassId: selectedClass || undefined,
        status: (selectedStatus as 'scheduled' | 'published' | 'cancelled' | 'completed' | undefined) || undefined,
      });
    } else {
      toast.error(res.message || 'Hủy hàng loạt thất bại');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedExamScheduleIds);
    const res = await examSchedulesApi.delete({ ids });
    if (res.success) {
      toast.success(res.message || `Đã xóa ${ids.length} lịch thi`);
      setSelectedExamScheduleIds(new Set());
      setIsBulkDeleteModalOpen(false);
      fetchExamSchedules({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchKeyword || undefined,
        semesterId: selectedSemester || undefined,
        courseClassId: selectedClass || undefined,
        status: (selectedStatus as 'scheduled' | 'published' | 'cancelled' | 'completed' | undefined) || undefined,
      });
    } else {
      toast.error(res.message || 'Xóa hàng loạt thất bại');
    }
  };

  const renderExamScheduleRow = useCallback((examSchedule: ExamSchedule, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(examSchedule.status || '');
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const isSelected = selectedExamScheduleIds.has(examSchedule.id);

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
                      onChange={() => handleSelectOne(examSchedule.id)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'subjectCode':
              return (
                <td key="subjectCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {examSchedule.subjectCode}
                </td>
              );
            case 'subjectName':
              return (
                <td key="subjectName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {examSchedule.subjectName}
                </td>
              );
            case 'className':
              return (
                <td key="className" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {examSchedule.courseClassCode}
                </td>
              );
            case 'examDate':
              return (
                <td key="examDate" className="text-gray-600 text-center" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {new Date(examSchedule.examDate).toLocaleDateString('vi-VN')}
                </td>
              );
            case 'examTime':
              return (
                <td key="examTime" className="text-gray-600 text-center" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {examSchedule.examTime}
                </td>
              );
            case 'roomCode':
              return (
                <td key="roomCode" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {examSchedule.roomCode}
                </td>
              );
            case 'examFormat':
              return (
                <td key="examFormat" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getExamFormatLabel(examSchedule.examFormat || '')}
                </td>
              );
            case 'status':
              const isCompact = parseFloat(cellStyle.paddingX) < 20;
              const statusFontSize = isCompact ? '0.65rem' : '0.75rem';
              const statusPadding = isCompact ? '0.125rem 0.375rem' : '0.25rem 0.5rem';
              return (
                <td key="status" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <span className={`inline-block text-center font-medium rounded-md ${statusDisplay.color}`} style={{
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
            case 'actions':
              return (
                <td key="actions" style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}>
                  <ExamScheduleActionsMenu
                    examSchedule={examSchedule}
                    onView={() => handleViewClick(examSchedule)}
                    onEdit={() => handleEditClick(examSchedule)}
                    onDelete={() => handleDeleteClick(examSchedule)}
                    onPublish={() => handlePublishClick(examSchedule)}
                    onCancel={() => handleCancelClick(examSchedule)}
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
  }, [handleViewClick, handleEditClick, handleDeleteClick, handlePublishClick, handleCancelClick, handleSelectOne, selectedExamScheduleIds]);

  const semesterOptions = [
    { value: '', label: 'Tất cả học kỳ' },
    ...semesters.map((s) => ({
      value: s.semesterId,
      label:
        currentSemesterInfo?.semesterId === s.semesterId
          ? `${s.semesterName} (Hiện tại)`
          : s.semesterName,
    })),
  ];

  const classOptions = [
    { value: '', label: 'Tất cả lớp' },
    ...courseClasses.map((cc) => {
      const id = cc.courseClassId || cc.id;
      if (!id) return null;
      const code = cc.courseClassCode || cc.code || '';
      const semesterName = cc.semesterName || '';
      const label = semesterName 
        ? `${code} - ${semesterName}`
        : code;
      return {
        value: id,
        label: label,
      };
    }).filter((opt): opt is { value: string; label: string } => opt !== null),
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Lịch thi</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin lịch thi các môn</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          {/* Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Danh sách Lịch thi
              </h2>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsExportModalOpen(true)}
                variant="outline"
                className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
              >
                <FileDown className="w-4 h-4" />
                Xuất Excel
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                <Plus className="w-4 h-4" />
                Thêm lịch thi
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Search Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Tìm kiếm</h3>
                {(searchQuery || searchSubjectName || searchClassName || searchRoomCode) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchSubjectName('');
                      setSearchClassName('');
                      setSearchRoomCode('');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Xóa tất cả
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {/* General Search */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <SearchInput
                    placeholder="Tìm kiếm chung (mã, giám thị...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Subject Name Search */}
                <div>
                  <SearchInput
                    placeholder="Tìm theo tên môn học"
                    value={searchSubjectName}
                    onChange={(e) => setSearchSubjectName(e.target.value)}
                  />
                </div>

                {/* Class Code Search */}
                <div>
                  <SearchInput
                    placeholder="Tìm theo mã lớp"
                    value={searchClassName}
                    onChange={(e) => setSearchClassName(e.target.value)}
                  />
                </div>

                {/* Room Code Search */}
                <div>
                  <SearchInput
                    placeholder="Tìm theo mã phòng thi"
                    value={searchRoomCode}
                    onChange={(e) => setSearchRoomCode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {/* Semester Dropdown */}
              <Dropdown
                options={semesterOptions}
                value={selectedSemester || ''}
                placeholder="Tất cả học kỳ"
                onChange={(value) => {
                  setSelectedSemester(value);
                  setCurrentPage(1);
                }}
              />

              {/* Class Dropdown */}
              <Dropdown
                options={classOptions}
                value={selectedClass || ''}
                placeholder="Tất cả lớp"
                onChange={(value) => {
                  setSelectedClass(value);
                  setCurrentPage(1);
                }}
              />

              {/* Status Dropdown */}
              <Dropdown
                options={STATUS_OPTIONS}
                value={selectedStatus || ''}
                placeholder="Tất cả trạng thái"
                onChange={(value) => {
                  setSelectedStatus(value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {currentSemesterInfo && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900">
                <div>
                  <span className="font-semibold">Học kỳ hiện tại:</span>{' '}
                  {currentSemesterInfo.semesterName}
                  {formatSemesterRange(currentSemesterInfo) && (
                    <span className="text-[11px] text-blue-700 ml-2">
                      ({formatSemesterRange(currentSemesterInfo)})
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleJumpToCurrentSemester}
                  disabled={selectedSemester === currentSemesterInfo.semesterId}
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                >
                  Xem học kỳ hiện tại
                </Button>
              </div>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {selectedExamScheduleIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#E8F4FF] border border-[#0053AD]/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-[#0053AD]" />
                <span className="text-sm font-medium text-[#0053AD]">
                  Đã chọn {selectedExamScheduleIds.size} lịch thi
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenBulkPublishModal}
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                >
                  Công bố
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkCancelModalOpen(true)}
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  Hủy lịch thi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa toàn bộ
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedExamScheduleIds(new Set())}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  Bỏ chọn
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            <ResizableTable
              columns={resizableColumns}
              data={examSchedules}
              renderRow={(examSchedule, visibleColumns, cellStyle) => (
                <tr key={examSchedule.id} className="hover:bg-gray-50 transition-colors">
                  {renderExamScheduleRow(examSchedule, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage="Không có dữ liệu"
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={examSchedules.length > 0 && selectedExamScheduleIds.size === examSchedules.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedExamScheduleIds.size > 0 && selectedExamScheduleIds.size < examSchedules.length;
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
            totalCount={totalCount}
            pageSize={20}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modals */}
      <AddExamScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchExamSchedules({
            pageNumber: currentPage,
            pageSize: 20,
            searchTerm: searchKeyword || undefined,
            semesterId: selectedSemester || undefined,
            courseClassId: selectedClass || undefined,
            status: (selectedStatus as 'scheduled' | 'published' | 'cancelled' | 'completed' | undefined) || undefined,
          });
        }}
      />

      <EditExamScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExamSchedule(null);
        }}
        examSchedule={editingExamSchedule}
        onSuccess={() => {
          fetchExamSchedules({
            pageNumber: currentPage,
            pageSize: 20,
            searchTerm: searchKeyword || undefined,
            semesterId: selectedSemester || undefined,
            courseClassId: selectedClass || undefined,
            status: (selectedStatus as 'scheduled' | 'published' | 'cancelled' | 'completed' | undefined) || undefined,
          });
        }}
      />

      <ViewExamScheduleDetailModal
        isOpen={isViewModalOpen}
        examScheduleId={viewingExamScheduleId}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingExamScheduleId(null);
        }}
      />

      <ConfirmPublishModal
        isOpen={isPublishModalOpen}
        subjectName={publishingExamSchedule?.subjectName}
        className={publishingExamSchedule?.courseClassCode}
        onClose={() => {
          setIsPublishModalOpen(false);
          setPublishingExamSchedule(null);
        }}
        onConfirm={handlePublishConfirm}
      />

      <ConfirmCancelModal
        isOpen={isCancelModalOpen}
        subjectName={cancellingExamSchedule?.subjectName}
        className={cancellingExamSchedule?.courseClassCode}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancellingExamSchedule(null);
        }}
        onConfirm={handleCancelConfirm}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        subjectName={deletingExamSchedule?.subjectName}
        className={deletingExamSchedule?.courseClassCode}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingExamSchedule(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <BulkPublishModal
        isOpen={isBulkPublishModalOpen}
        onClose={() => setIsBulkPublishModalOpen(false)}
        selectedCount={selectedExamScheduleIds.size}
        onConfirm={handleBulkPublish}
      />

      <BulkCancelModal
        isOpen={isBulkCancelModalOpen}
        onClose={() => setIsBulkCancelModalOpen(false)}
        selectedCount={selectedExamScheduleIds.size}
        onConfirm={handleBulkCancel}
      />

      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        selectedCount={selectedExamScheduleIds.size}
        onConfirm={handleBulkDelete}
      />

      <ExportExcelModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

