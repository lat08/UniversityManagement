'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { useTranslations } from 'next-intl';
import { Tabs } from '@/app/components/ui/tabs';
import { Pagination } from '@/app/components/ui/pagination';
import { AddCourseModal } from './components/AddCourseModal';
import { EditCourseModal } from './components/EditCourseModal';
import { ViewCourseDetailModal } from './components/ViewCourseDetailModal';
import { AssignInstructorModal } from './components/AssignInstructorModal';
import { AddAssignmentModal } from './components/AddAssignmentModal';
import { EditAssignmentModal } from './components/EditAssignmentModal';
import { ViewAssignmentDetailModal } from './components/ViewAssignmentDetailModal';
import { CourseActionsMenu } from './components/CourseActionsMenu';
import { AssignmentActionsMenu } from './components/AssignmentActionsMenu';
import { ResizableTable, ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable';
import { TableSkeleton } from '@/app/(page)/admin/student-profile/components/LoadingSkeleton';
import { useCourses } from './lib/hooks/useCourses';
import { useFacultyAssignments } from './lib/hooks/useFacultyAssignments';
import { coursesApi } from './lib/api/coursesApi';
import { getStatusDisplay } from './lib/types/types';
import type { Course, FacultyAssignment, Batch, Major, Specialization, Subject, Instructor } from './lib/types/types';
import { format } from 'date-fns';

type TabKey = 'courses' | 'assignments';

export default function CourseManagementPage() {
  const t = useTranslations('admin.courseManagement');
  const [activeTab, setActiveTab] = useState<TabKey>('courses');
  
  // Course List state
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseSearchKeyword, setCourseSearchKeyword] = useState('');
  const [selectedCourseBatchId, setSelectedCourseBatchId] = useState('');
  const [selectedCourseMajorId, setSelectedCourseMajorId] = useState('');
  const [selectedCourseSpecializationId, setSelectedCourseSpecializationId] = useState('');
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isViewCourseModalOpen, setIsViewCourseModalOpen] = useState(false);
  const [isAssignInstructorModalOpen, setIsAssignInstructorModalOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [assigningCourse, setAssigningCourse] = useState<Course | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [courseBatches, setCourseBatches] = useState<Batch[]>([]);
  const [courseMajors, setCourseMajors] = useState<Major[]>([]);
  const [courseSpecializations, setCourseSpecializations] = useState<Specialization[]>([]);
  const [selectedCourseMajorIdForSpecialization, setSelectedCourseMajorIdForSpecialization] = useState<string>('');

  // Assignment List state
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState('');
  const [assignmentSearchKeyword, setAssignmentSearchKeyword] = useState('');
  const [selectedAssignmentSubjectId, setSelectedAssignmentSubjectId] = useState('');
  const [selectedAssignmentInstructorId, setSelectedAssignmentInstructorId] = useState('');
  const [selectedAssignmentBatchId, setSelectedAssignmentBatchId] = useState('');
  const [selectedAssignmentMajorId, setSelectedAssignmentMajorId] = useState('');
  const [selectedAssignmentSpecializationId, setSelectedAssignmentSpecializationId] = useState('');
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);
  const [isViewAssignmentModalOpen, setIsViewAssignmentModalOpen] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<FacultyAssignment | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<FacultyAssignment | null>(null);
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<Set<string>>(new Set());
  const [assignmentSubjects, setAssignmentSubjects] = useState<Subject[]>([]);
  const [assignmentInstructors, setAssignmentInstructors] = useState<Instructor[]>([]);
  const [assignmentBatches, setAssignmentBatches] = useState<Batch[]>([]);
  const [assignmentMajors, setAssignmentMajors] = useState<Major[]>([]);
  const [assignmentSpecializations, setAssignmentSpecializations] = useState<Specialization[]>([]);
  const [selectedAssignmentMajorIdForSpecialization, setSelectedAssignmentMajorIdForSpecialization] = useState<string>('');

  const { courses, loading: coursesLoading, currentPage: coursesCurrentPage, totalCount: coursesTotalCount, totalPages: coursesTotalPages, fetchCourses, setCurrentPage: setCoursesCurrentPage } = useCourses();
  const { assignments, loading: assignmentsLoading, currentPage: assignmentsCurrentPage, totalCount: assignmentsTotalCount, totalPages: assignmentsTotalPages, fetchAssignments, setCurrentPage: setAssignmentsCurrentPage } = useFacultyAssignments();

  // Course List columns
  const [courseResizableColumns, setCourseResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'courseCode', label: t('columns.courseCode'), width: 150, minWidth: 120, align: 'center', visible: true, required: true },
    { key: 'subjectName', label: t('columns.subjectName'), width: 200, minWidth: 150, align: 'center', visible: true, required: true },
    { key: 'lecturerName', label: t('columns.lecturerName'), width: 200, minWidth: 150, align: 'center', visible: true },
    { key: 'enrollment', label: t('columns.enrollment'), width: 100, minWidth: 80, align: 'center', visible: true },
    { key: 'semester', label: t('columns.semester'), width: 150, minWidth: 120, align: 'center', visible: true },
    { key: 'status', label: t('columns.status'), width: 160, minWidth: 140, align: 'center', visible: true },
    { key: 'actions', label: t('columns.actions'), width: 140, minWidth: 100, align: 'center', visible: true, required: true },
  ]);

  // Assignment List columns
  const [assignmentResizableColumns, setAssignmentResizableColumns] = useState<ResizableColumn[]>([
    { key: 'checkbox', label: '', width: 60, minWidth: 60, align: 'center', visible: true, required: true },
    { key: 'courseCode', label: t('columns.courseCode'), width: 150, minWidth: 120, align: 'center', visible: true, required: true },
    { key: 'courseName', label: t('columns.courseName'), width: 200, minWidth: 150, align: 'center', visible: true, required: true },
    { key: 'instructorName', label: t('columns.instructorName'), width: 200, minWidth: 150, align: 'center', visible: true },
    { key: 'effectiveDate', label: t('columns.effectiveDate'), width: 150, minWidth: 120, align: 'center', visible: true },
    { key: 'notes', label: t('columns.notes'), width: 200, minWidth: 150, align: 'center', visible: true },
    { key: 'actions', label: t('columns.actions'), width: 140, minWidth: 100, align: 'center', visible: true, required: true },
  ]);

  // Load filter options
  useEffect(() => {
    coursesApi.getBatches().then((res) => {
      if (res.success) {
        setCourseBatches(res.data);
        setAssignmentBatches(res.data);
      }
    });
    coursesApi.getMajors().then((res) => {
      if (res.success) {
        setCourseMajors(res.data);
        setAssignmentMajors(res.data);
      }
    });
    // Load specializations without filter initially
    coursesApi.getSpecializations().then((res) => {
      if (res.success) {
        setCourseSpecializations(res.data);
        setAssignmentSpecializations(res.data);
      }
    });
    coursesApi.getSubjects().then((res) => {
      if (res.success) setAssignmentSubjects(res.data);
    });
    coursesApi.getInstructors().then((res) => {
      if (res.success) setAssignmentInstructors(res.data);
    });
  }, []);

  // Load specializations when major is selected (Course List)
  useEffect(() => {
    if (selectedCourseMajorIdForSpecialization) {
      coursesApi.getSpecializations(selectedCourseMajorIdForSpecialization).then((res) => {
        if (res.success) {
          setCourseSpecializations(res.data);
          // Reset specialization selection when major changes
          setSelectedCourseSpecializationId('');
        }
      });
    } else {
      // Load all specializations when no major is selected (Tất cả ngành)
      coursesApi.getSpecializations().then((res) => {
        if (res.success) {
          setCourseSpecializations(res.data);
          // Don't reset specialization when switching to "Tất cả ngành" - keep user's selection
        }
      });
    }
  }, [selectedCourseMajorIdForSpecialization]);

  // Load specializations when major is selected (Assignment List)
  useEffect(() => {
    if (selectedAssignmentMajorIdForSpecialization) {
      coursesApi.getSpecializations(selectedAssignmentMajorIdForSpecialization).then((res) => {
        if (res.success) {
          setAssignmentSpecializations(res.data);
          // Reset specialization selection when major changes
          setSelectedAssignmentSpecializationId('');
        }
      });
    } else {
      // Load all specializations when no major is selected (Tất cả ngành)
      coursesApi.getSpecializations().then((res) => {
        if (res.success) {
          setAssignmentSpecializations(res.data);
          // Don't reset specialization when switching to "Tất cả ngành" - keep user's selection
        }
      });
    }
  }, [selectedAssignmentMajorIdForSpecialization]);

  // Course List search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCourseSearchKeyword(courseSearchQuery);
      setCoursesCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [courseSearchQuery, setCoursesCurrentPage]);

  // Assignment List search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setAssignmentSearchKeyword(assignmentSearchQuery);
      setAssignmentsCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [assignmentSearchQuery, setAssignmentsCurrentPage]);

  // Fetch courses
  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses({
        pageNumber: coursesCurrentPage,
        pageSize: 20,
        searchKeyword: courseSearchKeyword || undefined,
        batchId: selectedCourseBatchId || undefined,
        majorId: selectedCourseMajorId || undefined,
        specializationId: selectedCourseSpecializationId || undefined,
      });
    }
  }, [coursesCurrentPage, courseSearchKeyword, selectedCourseBatchId, selectedCourseMajorId, selectedCourseSpecializationId, fetchCourses, activeTab]);

  // Fetch assignments
  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchAssignments({
        pageNumber: assignmentsCurrentPage,
        pageSize: 10,
        searchKeyword: assignmentSearchKeyword || undefined,
        subjectId: selectedAssignmentSubjectId || undefined,
        instructorId: selectedAssignmentInstructorId || undefined,
        batchId: selectedAssignmentBatchId || undefined,
        majorId: selectedAssignmentMajorId || undefined,
        specializationId: selectedAssignmentSpecializationId || undefined,
      });
    }
  }, [assignmentsCurrentPage, assignmentSearchKeyword, selectedAssignmentSubjectId, selectedAssignmentInstructorId, selectedAssignmentBatchId, selectedAssignmentMajorId, selectedAssignmentSpecializationId, fetchAssignments, activeTab]);

  // Course handlers
  const handleViewCourseClick = useCallback((course: Course) => {
    setViewingCourse(course);
    setIsViewCourseModalOpen(true);
  }, []);

  const handleEditCourseClick = useCallback((course: Course) => {
    setEditingCourse(course);
    setIsEditCourseModalOpen(true);
  }, []);

  const handleAssignCourseClick = useCallback((course: Course) => {
    setAssigningCourse(course);
    setIsAssignInstructorModalOpen(true);
  }, []);

  const handleSelectAllCourses = useCallback(() => {
    if (selectedCourseIds.size === courses.length) {
      setSelectedCourseIds(new Set());
    } else {
      setSelectedCourseIds(new Set(courses.map((c) => c.courseId)));
    }
  }, [courses, selectedCourseIds.size]);

  const handleSelectOneCourse = useCallback((courseId: string) => {
    setSelectedCourseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  }, []);

  // Assignment handlers
  const handleViewAssignmentClick = useCallback((assignment: FacultyAssignment) => {
    setViewingAssignment(assignment);
    setIsViewAssignmentModalOpen(true);
  }, []);

  const handleEditAssignmentClick = useCallback((assignment: FacultyAssignment) => {
    setEditingAssignment(assignment);
    setIsEditAssignmentModalOpen(true);
  }, []);

  const handleSelectAllAssignments = useCallback(() => {
    if (selectedAssignmentIds.size === assignments.length) {
      setSelectedAssignmentIds(new Set());
    } else {
      setSelectedAssignmentIds(new Set(assignments.map((a) => a.assignmentId)));
    }
  }, [assignments, selectedAssignmentIds.size]);

  const handleSelectOneAssignment = useCallback((assignmentId: string) => {
    setSelectedAssignmentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId);
      } else {
        newSet.add(assignmentId);
      }
      return newSet;
    });
  }, []);

  // Render Course Row
  const renderCourseRow = useCallback((course: Course, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = getStatusDisplay(course.status);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const isSelected = selectedCourseIds.has(course.courseId);

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
                      onChange={() => handleSelectOneCourse(course.courseId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'courseCode':
              return (
                <td key="courseCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {course.courseCode}
                </td>
              );
            case 'subjectName':
              return (
                <td key="subjectName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {course.subjectName}
                </td>
              );
            case 'lecturerName':
              return (
                <td key="lecturerName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {course.lecturerName}
                </td>
              );
            case 'enrollment':
              return (
                <td key="enrollment" className="text-gray-900 text-center" style={cellPaddingStyle}>
                  {course.enrollment}
                </td>
              );
            case 'semester':
              return (
                <td key="semester" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {course.semester}
                </td>
              );
            case 'status':
              const isCompact = parseFloat(cellStyle.paddingX) < 20;
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
            case 'actions':
              return (
                <td key="actions" style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}>
                  <CourseActionsMenu
                    courseId={course.courseId}
                    courseName={course.subjectName}
                    onView={() => handleViewCourseClick(course)}
                    onEdit={() => handleEditCourseClick(course)}
                    onAssign={() => handleAssignCourseClick(course)}
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
  }, [handleViewCourseClick, handleEditCourseClick, handleAssignCourseClick, handleSelectOneCourse, selectedCourseIds]);

  // Render Assignment Row
  const renderAssignmentRow = useCallback((assignment: FacultyAssignment, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const isSelected = selectedAssignmentIds.has(assignment.assignmentId);

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
                      onChange={() => handleSelectOneAssignment(assignment.assignmentId)}
                      className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    />
                  </div>
                </td>
              );
            case 'courseCode':
              return (
                <td key="courseCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {assignment.courseCode}
                </td>
              );
            case 'courseName':
              return (
                <td key="courseName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {assignment.courseName}
                </td>
              );
            case 'instructorName':
              return (
                <td key="instructorName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {assignment.instructorName}
                </td>
              );
            case 'effectiveDate':
              return (
                <td key="effectiveDate" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {assignment.effectiveDate ? (() => {
                    try {
                      return format(new Date(assignment.effectiveDate), 'dd/MM/yyyy');
                    } catch {
                      return assignment.effectiveDate;
                    }
                  })() : ''}
                </td>
              );
            case 'notes':
              return (
                <td key="notes" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {assignment.notes}
                </td>
              );
            case 'actions':
              return (
                <td key="actions" style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}>
                  <AssignmentActionsMenu
                    assignmentId={assignment.assignmentId}
                    assignmentName={assignment.courseName}
                    onView={() => handleViewAssignmentClick(assignment)}
                    onEdit={() => handleEditAssignmentClick(assignment)}
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
  }, [handleViewAssignmentClick, handleEditAssignmentClick, handleSelectOneAssignment, selectedAssignmentIds]);

  // Filter options
  const courseBatchOptions = [
    { value: '', label: t('allClasses') },
    ...courseBatches.map((b) => ({ value: b.batchId, label: b.batchName })),
  ];

  const courseMajorOptions = [
    { value: '', label: t('allMajors') },
    ...courseMajors.map((m) => ({ value: m.majorId, label: m.majorName })),
  ];

  const courseSpecializationOptions = [
    { value: '', label: t('allSpecializations') },
    ...courseSpecializations.map((s) => ({ value: s.specializationId, label: s.specializationName })),
  ];

  const assignmentSubjectOptions = [
    { value: '', label: t('allSubjects') },
    ...assignmentSubjects.map((s) => ({ value: s.subjectId, label: s.subjectName })),
  ];

  const assignmentInstructorOptions = [
    { value: '', label: t('allInstructors') },
    ...assignmentInstructors.map((i) => ({ value: i.instructorId, label: i.instructorName })),
  ];

  const assignmentBatchOptions = [
    { value: '', label: t('allClasses') },
    ...assignmentBatches.map((b) => ({ value: b.batchId, label: b.batchName })),
  ];

  const assignmentMajorOptions = [
    { value: '', label: t('allMajors') },
    ...assignmentMajors.map((m) => ({ value: m.majorId, label: m.majorName })),
  ];

  const assignmentSpecializationOptions = [
    { value: '', label: t('allSpecializations') },
    ...assignmentSpecializations.map((s) => ({ value: s.specializationId, label: s.specializationName })),
  ];

  const tabs = [
    { key: 'courses' as TabKey, label: t('coursesTab') },
    { key: 'assignments' as TabKey, label: t('assignmentsTab') },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      {/* Course List Tab */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
            {/* Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                  {t('coursesTab')}
                </h2>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsAddCourseModalOpen(true)}
                  className="bg-[#0053AD] hover:bg-[#003d82] text-white"
                >
                  <Plus className="w-4 h-4" />
                  {t('addNew')}
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
              {/* Search Input */}
              <div className="sm:col-span-2">
                <SearchInput
                  placeholder={t('searchCourse')}
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                />
              </div>

              {/* Batch Dropdown */}
              <Dropdown
                options={courseBatchOptions}
                value={selectedCourseBatchId || ''}
                placeholder={t('allClasses')}
                onChange={(value) => {
                  setSelectedCourseBatchId(value);
                  setCoursesCurrentPage(1);
                }}
              />

              {/* Major Dropdown */}
              <Dropdown
                options={courseMajorOptions}
                value={selectedCourseMajorId || ''}
                placeholder={t('allMajors')}
                onChange={(value) => {
                  setSelectedCourseMajorId(value);
                  setSelectedCourseMajorIdForSpecialization(value);
                  setCoursesCurrentPage(1);
                }}
              />

              {/* Specialization Dropdown */}
              <Dropdown
                options={courseSpecializationOptions}
                value={selectedCourseSpecializationId || ''}
                placeholder={t('allSpecializations')}
                onChange={(value) => {
                  setSelectedCourseSpecializationId(value);
                  setCoursesCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="border-t border-gray-200 min-w-0">
            <div className="p-4 lg:p-6 min-w-0">
              <ResizableTable
                columns={courseResizableColumns}
                data={courses}
                renderRow={(course, visibleColumns, cellStyle) => (
                  <tr className="hover:bg-gray-50 transition-colors">
                    {renderCourseRow(course, visibleColumns, cellStyle)}
                  </tr>
                )}
                isLoading={coursesLoading}
                emptyMessage={t('noData')}
                loadingComponent={<TableSkeleton />}
                onColumnsResize={setCourseResizableColumns}
                renderHeaderCheckbox={() => (
                  <input
                    type="checkbox"
                    checked={courses.length > 0 && selectedCourseIds.size === courses.length}
                    onChange={handleSelectAllCourses}
                    className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = selectedCourseIds.size > 0 && selectedCourseIds.size < courses.length;
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
              currentPage={coursesCurrentPage}
              totalPages={coursesTotalPages}
              totalCount={coursesTotalCount}
              pageSize={20}
              onPageChange={setCoursesCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Assignment List Tab */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
            {/* Title */}
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                {t('assignmentsTab')}
              </h2>
            </div>

            {/* Search & Add Button Row */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <div className="flex-1">
                <SearchInput
                  placeholder={t('searchAssignment')}
                  value={assignmentSearchQuery}
                  onChange={(e) => setAssignmentSearchQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setIsAddAssignmentModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                {t('addNew')}
              </Button>
            </div>

            {/* Dropdowns Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
              {/* Subject Dropdown */}
              <Dropdown
                options={assignmentSubjectOptions}
                value={selectedAssignmentSubjectId || ''}
                placeholder={t('allSubjects')}
                onChange={(value) => {
                  setSelectedAssignmentSubjectId(value);
                  setAssignmentsCurrentPage(1);
                }}
              />

              {/* Instructor Dropdown */}
              <Dropdown
                options={assignmentInstructorOptions}
                value={selectedAssignmentInstructorId || ''}
                placeholder={t('allInstructors')}
                onChange={(value) => {
                  setSelectedAssignmentInstructorId(value);
                  setAssignmentsCurrentPage(1);
                }}
              />

              {/* Batch Dropdown */}
              <Dropdown
                options={assignmentBatchOptions}
                value={selectedAssignmentBatchId || ''}
                placeholder={t('allClasses')}
                onChange={(value) => {
                  setSelectedAssignmentBatchId(value);
                  setAssignmentsCurrentPage(1);
                }}
              />

              {/* Major Dropdown */}
              <Dropdown
                options={assignmentMajorOptions}
                value={selectedAssignmentMajorId || ''}
                placeholder={t('allMajors')}
                onChange={(value) => {
                  setSelectedAssignmentMajorId(value);
                  setSelectedAssignmentMajorIdForSpecialization(value);
                  setAssignmentsCurrentPage(1);
                }}
              />

              {/* Specialization Dropdown */}
              <Dropdown
                options={assignmentSpecializationOptions}
                value={selectedAssignmentSpecializationId || ''}
                placeholder={t('allSpecializations')}
                onChange={(value) => {
                  setSelectedAssignmentSpecializationId(value);
                  setAssignmentsCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="border-t border-gray-200 min-w-0">
            <div className="p-4 lg:p-6 min-w-0">
              <ResizableTable
                columns={assignmentResizableColumns}
                data={assignments}
                renderRow={(assignment, visibleColumns, cellStyle) => (
                  <tr className="hover:bg-gray-50 transition-colors">
                    {renderAssignmentRow(assignment, visibleColumns, cellStyle)}
                  </tr>
                )}
                isLoading={assignmentsLoading}
                emptyMessage={t('noData')}
                loadingComponent={<TableSkeleton />}
                onColumnsResize={setAssignmentResizableColumns}
                renderHeaderCheckbox={() => (
                  <input
                    type="checkbox"
                    checked={assignments.length > 0 && selectedAssignmentIds.size === assignments.length}
                    onChange={handleSelectAllAssignments}
                    className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = selectedAssignmentIds.size > 0 && selectedAssignmentIds.size < assignments.length;
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
              currentPage={assignmentsCurrentPage}
              totalPages={assignmentsTotalPages}
              totalCount={assignmentsTotalCount}
              pageSize={10}
              onPageChange={setAssignmentsCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Course Modals */}
      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onSuccess={() => {
          fetchCourses({
            pageNumber: coursesCurrentPage,
            pageSize: 20,
            searchKeyword: courseSearchKeyword || undefined,
            batchId: selectedCourseBatchId || undefined,
            majorId: selectedCourseMajorId || undefined,
            specializationId: selectedCourseSpecializationId || undefined,
          });
        }}
      />

      <EditCourseModal
        isOpen={isEditCourseModalOpen}
        onClose={() => {
          setIsEditCourseModalOpen(false);
          setEditingCourse(null);
        }}
        course={editingCourse}
        onSuccess={() => {
          fetchCourses({
            pageNumber: coursesCurrentPage,
            pageSize: 20,
            searchKeyword: courseSearchKeyword || undefined,
            batchId: selectedCourseBatchId || undefined,
            majorId: selectedCourseMajorId || undefined,
            specializationId: selectedCourseSpecializationId || undefined,
          });
        }}
      />

      <ViewCourseDetailModal
        isOpen={isViewCourseModalOpen}
        onClose={() => {
          setIsViewCourseModalOpen(false);
          setViewingCourse(null);
        }}
        course={viewingCourse}
      />

      <AssignInstructorModal
        isOpen={isAssignInstructorModalOpen}
        onClose={() => {
          setIsAssignInstructorModalOpen(false);
          setAssigningCourse(null);
        }}
        course={assigningCourse}
        onSuccess={() => {
          fetchCourses({
            pageNumber: coursesCurrentPage,
            pageSize: 20,
            searchKeyword: courseSearchKeyword || undefined,
            batchId: selectedCourseBatchId || undefined,
            majorId: selectedCourseMajorId || undefined,
            specializationId: selectedCourseSpecializationId || undefined,
          });
          fetchAssignments({
            pageNumber: assignmentsCurrentPage,
            pageSize: 10,
            searchKeyword: assignmentSearchKeyword || undefined,
            subjectId: selectedAssignmentSubjectId || undefined,
            instructorId: selectedAssignmentInstructorId || undefined,
            batchId: selectedAssignmentBatchId || undefined,
            majorId: selectedAssignmentMajorId || undefined,
            specializationId: selectedAssignmentSpecializationId || undefined,
          });
        }}
      />

      {/* Assignment Modals */}
      <AddAssignmentModal
        isOpen={isAddAssignmentModalOpen}
        onClose={() => setIsAddAssignmentModalOpen(false)}
        onSuccess={() => {
          fetchAssignments({
            pageNumber: assignmentsCurrentPage,
            pageSize: 10,
            searchKeyword: assignmentSearchKeyword || undefined,
            subjectId: selectedAssignmentSubjectId || undefined,
            instructorId: selectedAssignmentInstructorId || undefined,
            batchId: selectedAssignmentBatchId || undefined,
            majorId: selectedAssignmentMajorId || undefined,
            specializationId: selectedAssignmentSpecializationId || undefined,
          });
        }}
      />

      <EditAssignmentModal
        isOpen={isEditAssignmentModalOpen}
        onClose={() => {
          setIsEditAssignmentModalOpen(false);
          setEditingAssignment(null);
        }}
        assignment={editingAssignment}
        onSuccess={() => {
          fetchAssignments({
            pageNumber: assignmentsCurrentPage,
            pageSize: 10,
            searchKeyword: assignmentSearchKeyword || undefined,
            subjectId: selectedAssignmentSubjectId || undefined,
            instructorId: selectedAssignmentInstructorId || undefined,
            batchId: selectedAssignmentBatchId || undefined,
            majorId: selectedAssignmentMajorId || undefined,
            specializationId: selectedAssignmentSpecializationId || undefined,
          });
        }}
      />

      <ViewAssignmentDetailModal
        isOpen={isViewAssignmentModalOpen}
        onClose={() => {
          setIsViewAssignmentModalOpen(false);
          setViewingAssignment(null);
        }}
        assignment={viewingAssignment}
      />
    </div>
  );
}

