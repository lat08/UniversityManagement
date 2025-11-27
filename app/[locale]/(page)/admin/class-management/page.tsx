'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Dropdown, SearchInput, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { ResizableTable, ResizableColumn } from '../student-profile/components/ResizableTable';
import { TableSkeleton } from '../student-profile/components/LoadingSkeleton';
import { classesApi } from './lib/api/classesApi';
import { toast } from 'react-hot-toast';
import type { Class, ClassFilterDto, Department, AcademicYear, TrainingSystem } from './lib/types/types';
import { CLASS_STATUS_OPTIONS, getStatusDisplay } from './lib/types/types';
import AddClassModal from './components/AddClassModal';
import EditClassModal from './components/EditClassModal';
import ViewClassDetailModal from './components/ViewClassDetailModal';
import ConfirmDeleteClassModal from './components/ConfirmDeleteClassModal';

export default function ClassManagementPage() {
  const t = useTranslations('admin.classManagement');
  const tCommon = useTranslations('common.actions');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedTrainingSystemId, setSelectedTrainingSystemId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStartAcademicYearId, setSelectedStartAcademicYearId] = useState('');
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [trainingSystems, setTrainingSystems] = useState<TrainingSystem[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>([
    { key: 'classCode', label: t('columns.classCode'), width: 140, minWidth: 120, align: 'left', visible: true, required: true },
    { key: 'className', label: t('columns.className'), width: 200, minWidth: 150, align: 'left', visible: true, required: true },
    { key: 'departmentName', label: t('columns.department'), width: 180, minWidth: 120, align: 'left', visible: true },
    { key: 'facultyName', label: t('columns.faculty'), width: 150, minWidth: 120, align: 'left', visible: false },
    { key: 'advisorInstructorName', label: t('columns.advisor'), width: 180, minWidth: 150, align: 'left', visible: true },
    { key: 'trainingSystemName', label: t('columns.trainingSystem'), width: 150, minWidth: 120, align: 'left', visible: true },
    { key: 'startAcademicYearName', label: t('columns.startYear'), width: 140, minWidth: 120, align: 'left', visible: true },
    { key: 'endAcademicYearName', label: t('columns.endYear'), width: 140, minWidth: 120, align: 'left', visible: false },
    { key: 'curriculumName', label: t('columns.curriculum'), width: 180, minWidth: 150, align: 'left', visible: false },
    { key: 'studentCount', label: t('columns.studentCount'), width: 120, minWidth: 100, align: 'center', visible: true },
    { key: 'classStatus', label: t('columns.status'), width: 140, minWidth: 120, align: 'center', visible: true },
    { key: 'actions', label: t('columns.actions'), width: 180, minWidth: 140, align: 'center', visible: true, required: true },
  ]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      await Promise.all([
        fetchDepartments(),
        fetchAcademicYears(),
        fetchTrainingSystems(),
      ]);
    };
    fetchDropdownData();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDepartments = async () => {
    try {
      const depts = await classesApi.getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const years = await classesApi.getAcademicYears(10);
      setAcademicYears(years);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchTrainingSystems = async () => {
    try {
      const systems = await classesApi.getTrainingSystems();
      setTrainingSystems(systems);
    } catch (error) {
      console.error('Error fetching training systems:', error);
    }
  };

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const filter: ClassFilterDto = {
        page: currentPage,
        pageSize: pageSize,
        searchTerm: searchKeyword || undefined,
        departmentId: selectedDepartmentId || undefined,
        trainingSystemId: selectedTrainingSystemId || undefined,
        classStatus: selectedStatus || undefined,
        startAcademicYearId: selectedStartAcademicYearId || undefined,
      };
      
      const response = await classesApi.getClasses(filter);
      
      if (response.success) {
        setClasses(response.data.classes);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      } else {
        toast.error(response.message || t('toast.fetchError'));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error(t('toast.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedDepartmentId, selectedTrainingSystemId, selectedStatus, selectedStartAcademicYearId, searchKeyword, t]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const translatedStatusOptions = useMemo(
    () =>
      CLASS_STATUS_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t],
  );

  const translateStatusDisplay = useCallback(
    (status: string) => getStatusDisplay(status, (key) => t(key)),
    [t],
  );

  const handleView = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsViewModalOpen(true);
  };

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEditModalOpen(true);
  };

  const handleDelete = (classItem: Class) => {
    setDeletingClass(classItem);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClass) return;
    
    try {
      const response = await classesApi.deleteClass(deletingClass.classId);
      if (response.success) {
        toast.success(t('toast.deleteSuccess'));
        await fetchClasses();
        setIsDeleteModalOpen(false);
        setDeletingClass(null);
      } else {
        toast.error(response.message || t('toast.deleteError'));
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error(t('toast.deleteError'));
    }
  };

  const renderClassRow = useCallback((classItem: Class, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
    const statusDisplay = translateStatusDisplay(classItem.classStatus);
    const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    
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
            case 'classCode':
              return (
                <td key="classCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {classItem.classCode}
                </td>
              );
            case 'className':
              return (
                <td key="className" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {classItem.className}
                </td>
              );
            case 'departmentName':
              return (
                <td key="departmentName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {classItem.departmentName}
                </td>
              );
            case 'facultyName':
              return (
                <td key="facultyName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {classItem.facultyName || '-'}
                </td>
              );
            case 'advisorInstructorName':
              return (
                <td key="advisorInstructorName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {classItem.advisorInstructorName || '-'}
                </td>
              );
            case 'trainingSystemName':
              return (
                <td key="trainingSystemName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {classItem.trainingSystemName}
                </td>
              );
            case 'startAcademicYearName':
              return (
                <td key="startAcademicYearName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {classItem.startAcademicYearName}
                </td>
              );
            case 'endAcademicYearName':
              return (
                <td key="endAcademicYearName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {classItem.endAcademicYearName}
                </td>
              );
            case 'curriculumName':
              return (
                <td key="curriculumName" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {classItem.curriculumName || '-'}
                </td>
              );
            case 'studentCount':
              return (
                <td key="studentCount" className="text-center text-gray-900 font-medium" style={cellPaddingStyle}>
                  {classItem.studentCount}
                </td>
              );
            case 'classStatus':
              return (
                <td key="classStatus" style={cellPaddingStyle}>
                  <div className="flex justify-center">
                    <span className={`text-center font-medium rounded px-2 py-1 text-xs ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </span>
                  </div>
                </td>
              );
            case 'actions':
              return (
                <td key="actions" style={{ ...cellPaddingStyle, paddingLeft: '8px', paddingRight: '8px' }}>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(classItem)}
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                      title={tCommon('view')}
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(classItem)}
                      className="h-8 w-8 p-0 hover:bg-green-50"
                      title={tCommon('edit')}
                    >
                      <Edit className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(classItem)}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                      title={tCommon('delete')}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              );
            default:
              return null;
          }
        })}
      </>
    );
  }, [translateStatusDisplay, tCommon]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          {/* Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                {t('list.title')}
              </h2>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">
                {t('list.description')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                <Plus className="w-4 h-4" />
                {t('add')}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <SearchInput
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Department Dropdown */}
            <Dropdown
              options={[
                { value: '', label: t('filters.allDepartments') },
                ...departments.map(d => ({ value: d.departmentId, label: d.departmentName }))
              ]}
              value={selectedDepartmentId || ''}
              placeholder={t('filters.allDepartments')}
              onChange={(value) => {
                setSelectedDepartmentId(value);
                setCurrentPage(1);
              }}
            />

            {/* Training System Dropdown */}
            <Dropdown
              options={[
                { value: '', label: t('filters.allTrainingSystems') },
                ...trainingSystems.map(ts => ({ value: ts.trainingSystemId, label: ts.trainingSystemName }))
              ]}
              value={selectedTrainingSystemId || ''}
              placeholder={t('filters.allTrainingSystems')}
              onChange={(value) => {
                setSelectedTrainingSystemId(value);
                setCurrentPage(1);
              }}
            />

            {/* Status Dropdown */}
            <Dropdown
              options={translatedStatusOptions}
              value={selectedStatus || ''}
              placeholder={t('filters.allStatuses')}
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {/* Start Academic Year Dropdown */}
            <Dropdown
              options={[
                { value: '', label: t('filters.allAcademicYears') },
                ...academicYears.map(y => ({ value: y.academicYearId, label: y.yearName }))
              ]}
              value={selectedStartAcademicYearId || ''}
              placeholder={t('filters.allAcademicYears')}
              onChange={(value) => {
                setSelectedStartAcademicYearId(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            <ResizableTable
              columns={resizableColumns}
              data={classes}
              renderRow={(classItem, visibleColumns, cellStyle) => (
                <tr className="hover:bg-gray-50">
                  {renderClassRow(classItem, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage={tCommon('noData')}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
            />
          </div>
        </div>

        {/* Pagination */}
        <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modals */}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchClasses}
      />
      
      {selectedClass && (
        <>
          <EditClassModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedClass(null);
            }}
            classItem={selectedClass}
            onSuccess={fetchClasses}
          />
          
          <ViewClassDetailModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedClass(null);
            }}
            classId={selectedClass.classId}
          />
        </>
      )}

      <ConfirmDeleteClassModal
        isOpen={isDeleteModalOpen}
        classItem={deletingClass}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingClass(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

