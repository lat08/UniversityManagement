'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Download, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SearchInput, Dropdown, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { ResizableTable, ResizableColumn } from '../student-profile/components/ResizableTable';
import { TableSkeleton } from '../student-profile/components/LoadingSkeleton';
import { useSubjects } from './lib/hooks/useSubjects';
import { subjectsApi } from './lib/api/subjectsApi';
import { getStatusDisplay } from './lib/types/types';
import type { Subject } from './lib/types/types';
import AddSubjectModal from './components/AddSubjectModal';
import EditSubjectModal from './components/EditSubjectModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import BulkEditModal from './components/BulkEditModal';
import BulkDeleteModal from './components/BulkDeleteModal';
import SubjectActionsMenu from './components/SubjectActionsMenu';

export default function SubjectManagementPage() {
  const t = useTranslations('admin.subjectManagement');
  const {
    subjects,
    faculties,
    departments,
    loading,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    pageSize,
    searchQuery,
    setSearchQuery,
    selectedFacultyId,
    setSelectedFacultyId,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedStatus,
    setSelectedStatus,
    refetch,
  } = useSubjects();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const defaultColumns = useMemo<ResizableColumn[]>(
    () => [
      {
        key: 'checkbox',
        label: '',
        width: 50,
        minWidth: 50,
        align: 'center',
        visible: true,
        required: true,
      },
      {
        key: 'subjectCode',
        label: t('table.columns.code'),
        width: 100,
        minWidth: 80,
        align: 'left',
        visible: true,
        required: true,
      },
      {
        key: 'subjectName',
        label: t('table.columns.name'),
        width: 200,
        minWidth: 150,
        align: 'left',
        visible: true,
        required: true,
      },
      {
        key: 'departmentName',
        label: t('table.columns.instructor'),
        width: 150,
        minWidth: 120,
        align: 'left',
        visible: true,
      },
      {
        key: 'credits',
        label: t('table.columns.credits'),
        width: 100,
        minWidth: 80,
        align: 'center',
        visible: true,
      },
      {
        key: 'students',
        label: t('table.columns.students'),
        width: 120,
        minWidth: 100,
        align: 'center',
        visible: true,
      },
      {
        key: 'semester',
        label: t('table.columns.semester'),
        width: 120,
        minWidth: 100,
        align: 'center',
        visible: true,
      },
      {
        key: 'status',
        label: t('table.columns.status'),
        width: 120,
        minWidth: 100,
        align: 'center',
        visible: true,
      },
      {
        key: 'actions',
        label: t('table.columns.actions'),
        width: 100,
        minWidth: 80,
        align: 'center',
        visible: true,
        required: true,
      },
    ],
    [t],
  );

  const [resizableColumns, setResizableColumns] = useState<ResizableColumn[]>(defaultColumns);

  useEffect(() => {
    setResizableColumns(defaultColumns);
  }, [defaultColumns]);

  const handleSelectAll = useCallback(() => {
    if (selectedSubjectIds.size === subjects.length && subjects.length > 0) {
      setSelectedSubjectIds(new Set());
    } else {
      const currentPageSubjectIds = subjects.map((s) => s.subjectId);
      setSelectedSubjectIds(new Set(currentPageSubjectIds));
    }
  }, [subjects, selectedSubjectIds]);

  const handleSelectOne = useCallback((subjectId: string) => {
    setSelectedSubjectIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedSubjectIds(new Set());
  }, []);

  const renderSubjectRow = useCallback(
    (subject: Subject, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
      const statusDisplay = getStatusDisplay(subject.subjectStatus, t);
      const isSelected = selectedSubjectIds.has(subject.subjectId);
      const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);

      return (
        <>
          {visibleColumns.map((column) => {
            const widthPercent =
              (column as { widthPercent?: number }).widthPercent ||
              (baseTotalWidth > 0
                ? (column.width / baseTotalWidth) * 100
                : 100 / visibleColumns.length);

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
                        onChange={() => handleSelectOne(subject.subjectId)}
                        className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                      />
                    </div>
                  </td>
                );
              case 'subjectCode':
                return (
                  <td key="subjectCode" className="text-gray-900 font-medium" style={cellPaddingStyle}>
                    {subject.subjectCode}
                  </td>
                );
              case 'subjectName':
                return (
                  <td key="subjectName" className="text-gray-900" style={cellPaddingStyle}>
                    {subject.subjectName}
                  </td>
                );
              case 'departmentName':
                return (
                  <td key="departmentName" className="text-gray-600" style={cellPaddingStyle}>
                    {subject.departmentName}
                  </td>
                );
              case 'credits':
                return (
                  <td key="credits" className="text-gray-900 text-center" style={cellPaddingStyle}>
                    {subject.credits}
                  </td>
                );
              case 'students':
                return (
                  <td key="students" className="text-center" style={cellPaddingStyle}>
                    <span className="text-blue-600">
                      {subject.totalEnrollmentsCount}/{subject.activeCoursesCount * 40}
                    </span>
                  </td>
                );
              case 'semester':
                return (
                  <td key="semester" className="text-gray-600 text-center" style={cellPaddingStyle}>
                    {subject.isGeneral ? t('filters.general') : t('filters.specialized')}
                  </td>
                );
              case 'status':
                const isCompact = parseFloat(cellStyle.paddingX) < 20;
                const statusFontSize = isCompact ? '0.65rem' : '0.75rem';
                const statusPadding = isCompact ? '0.125rem 0.375rem' : '0.25rem 0.5rem';
                return (
                  <td key="status" style={cellPaddingStyle}>
                    <div className="flex justify-center">
                      <span
                        className={`text-center font-medium rounded ${statusDisplay.color}`}
                        style={{
                          padding: statusPadding,
                          fontSize: statusFontSize,
                          lineHeight: '1.2',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {statusDisplay.label}
                      </span>
                    </div>
                  </td>
                );
              case 'actions':
                return (
                  <td key="actions" style={cellPaddingStyle}>
                    <div className="flex justify-center">
                      <SubjectActionsMenu
                        onEdit={() => setEditSubjectId(subject.subjectId)}
                        onDelete={() => setDeleteSubject(subject)}
                      />
                    </div>
                  </td>
                );
              default:
                return null;
            }
          })}
        </>
      );
    },
    [selectedSubjectIds, handleSelectOne, t],
  );

  const handleDeleteConfirm = async () => {
    if (!deleteSubject) return;

    setIsDeleting(true);
    try {
      const res = await subjectsApi.deleteSubject(deleteSubject.subjectId);
      if (res.success) {
        toast.success(t('messages.deleteSuccess'));
        refetch();
        setDeleteSubject(null);
      } else {
        toast.error(res.message || t('messages.deleteError'));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || t('messages.deleteError');
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    if (!selectedFacultyId) return departments;
    return departments.filter((d) => d.facultyId === selectedFacultyId);
  }, [departments, selectedFacultyId]);

  const statusOptions = useMemo(
    () => [
      { value: '', label: t('filters.allStatuses') },
      { value: 'active', label: t('filters.status.active') },
      { value: 'inactive', label: t('filters.status.inactive') },
      { value: 'archived', label: t('filters.status.archived') },
    ],
    [t],
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{t('listTitle')}</h2>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4" />
                {t('actions.export')}
              </Button>
              <Button
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                {t('actions.add')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            <div className="sm:col-span-2">
              <SearchInput
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dropdown
              options={[
                { value: '', label: t('filters.allFaculties') },
                ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
              ]}
              value={selectedFacultyId}
              placeholder={t('filters.allFaculties')}
              onChange={(value) => {
                setSelectedFacultyId(value);
                setSelectedDepartmentId('');
                setCurrentPage(1);
              }}
            />

            <Dropdown
              options={[
                { value: '', label: t('filters.allDepartments') },
                ...filteredDepartments.map((d) => ({ value: d.departmentId, label: d.departmentName })),
              ]}
              value={selectedDepartmentId}
              placeholder={t('filters.allDepartments')}
              onChange={(value) => {
                setSelectedDepartmentId(value);
                setCurrentPage(1);
              }}
            />

            <Dropdown
              options={statusOptions}
              value={selectedStatus}
              placeholder={t('filters.allStatuses')}
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            />
          </div>

          {selectedSubjectIds.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {t('table.selected', { count: selectedSubjectIds.size })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkEditModalOpen(true)}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <Edit className="w-4 h-4" />
                  {t('actions.bulkEdit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('actions.bulkDelete')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                  {t('actions.deselectAll')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            <ResizableTable
              columns={resizableColumns}
              data={subjects}
              renderRow={(subject, visibleColumns, cellStyle) => (
                <tr className="hover:bg-gray-50 transition-colors">
                  {renderSubjectRow(subject, visibleColumns, cellStyle)}
                </tr>
              )}
              isLoading={loading}
              emptyMessage={t('table.empty')}
              loadingComponent={<TableSkeleton />}
              onColumnsResize={setResizableColumns}
              renderHeaderCheckbox={() => (
                <input
                  type="checkbox"
                  checked={subjects.length > 0 && selectedSubjectIds.size === subjects.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-[#0053AD]"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedSubjectIds.size > 0 && selectedSubjectIds.size < subjects.length;
                    }
                  }}
                />
              )}
            />
          </div>
        </div>

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

      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refetch();
          setCurrentPage(1);
        }}
      />

      <EditSubjectModal
        isOpen={!!editSubjectId}
        subjectId={editSubjectId}
        onClose={() => setEditSubjectId(null)}
        onSuccess={() => {
          refetch();
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deleteSubject}
        subjectName={deleteSubject?.subjectName}
        subjectCode={deleteSubject?.subjectCode}
        onClose={() => setDeleteSubject(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        selectedSubjectIds={Array.from(selectedSubjectIds)}
        onClose={() => setIsBulkEditModalOpen(false)}
        onSuccess={() => {
          refetch();
          setSelectedSubjectIds(new Set());
        }}
      />

      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        selectedSubjectIds={Array.from(selectedSubjectIds)}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onSuccess={() => {
          refetch();
          setSelectedSubjectIds(new Set());
        }}
      />
    </div>
  );
}



