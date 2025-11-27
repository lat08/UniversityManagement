'use client';

import { useMemo, useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchInput, Dropdown, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { InstructorListItem } from './lib/types/types';
import { getEmploymentStatusOptions, getDegreeOptions } from './lib/constants/filters';
import { getEmploymentStatusDisplay } from './lib/utils/display';
import { instructorsApi } from './lib/api/instructorsApi';
import { TableSkeleton, StatCardsSkeleton } from '../student-profile/components/LoadingSkeleton';
import AddInstructorModal from './components/AddInstructorModal';
import EditInstructorModal from './components/EditInstructorModal';
import ExportInstructorModal from './components/ExportInstructorModal';
import ImportInstructorExcelModal from './components/ImportInstructorExcelModal';
import InstructorActionsMenu from './components/InstructorActionsMenu';
import { STAT_CARDS } from './lib/constants/statCards';
import { useInstructors } from './lib/hooks/useInstructors';

export default function InstructorProfilePage() {
  const t = useTranslations('admin.instructorProfile');
  const tFilters = useTranslations('admin.instructorProfile.filters');
  const tStatCards = useTranslations('admin.instructorProfile.statCards');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    searchQuery,
    setSearchQuery,
    selectedFacultyId,
    setSelectedFacultyId,
    selectedDegree,
    setSelectedDegree,
    selectedStatus,
    setSelectedStatus,
    faculties,
    instructors,
    stats,
    currentPage,
    setCurrentPage,
    pageSize,
    totalCount,
    totalPages,
    loading,
  } = useInstructors();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editInstructorId, setEditInstructorId] = useState<string | null>(null);
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<Set<string>>(new Set());

  const degreeOptions = useMemo(() => getDegreeOptions(tFilters), [tFilters]);
  const statusOptions = useMemo(() => getEmploymentStatusOptions(tFilters), [tFilters]);

  const statValues = useMemo(() => {
    if (!stats) {
      return {
        total: 0,
        professor: 0,
        doctor: 0,
        master: 0,
      };
    }

    return {
      total: stats.totalInstructors,
      // Temporarily reuse doctorCount for professor card until backend exposes value
      professor: stats.doctorCount,
      doctor: stats.doctorCount,
      master: stats.masterCount,
    };
  }, [stats]);

  // Open Add Instructor modal when triggered from dashboard
  const action = searchParams.get('action');
  useEffect(() => {
    if (action === 'addInstructor') {
      setIsAddModalOpen(true);
    }
  }, [action]);

  const handleDeleteInstructor = async (instructor: InstructorListItem) => {
    if (instructor.employmentStatus !== 'inactive') {
      toast.error(t('canOnlyDeleteInactive'));
      return;
    }

    const confirmed = window.confirm(t('confirmDelete'));
    if (!confirmed) return;

    try {
      const res = await instructorsApi.deleteInstructor(instructor.instructorId);
      if (res.success) {
        toast.success(t('deleteSuccess'));
        setSelectedInstructorIds((prev) => {
          const next = new Set(prev);
          next.delete(instructor.instructorId);
          return next;
        });
        setCurrentPage(1);
      } else {
        toast.error(res.message || t('deleteFailed'));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || t('deleteError');
      toast.error(msg);
    }
  };

  const handleSelectAll = () => {
    if (selectedInstructorIds.size === instructors.length) {
      setSelectedInstructorIds(new Set());
    } else {
      setSelectedInstructorIds(new Set(instructors.map((i) => i.instructorId)));
    }
  };

  const handleSelectOne = (instructorId: string) => {
    setSelectedInstructorIds((prev) => {
      const next = new Set(prev);
      if (next.has(instructorId)) {
        next.delete(instructorId);
      } else {
        next.add(instructorId);
      }
      return next;
    });
  };

  const handleBulkEdit = () => {
    if (selectedInstructorIds.size === 0) return;
    toast(t('bulkEditNotImplemented'), { icon: 'ℹ️' });
  };

  const handleBulkDelete = async () => {
    if (selectedInstructorIds.size === 0) return;
    
    const confirmed = window.confirm(t('confirmBulkDelete', { count: selectedInstructorIds.size }));
    if (!confirmed) return;

    toast(t('bulkDeleteNotImplemented'), { icon: 'ℹ️' });
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {loading && instructors.length === 0 ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {STAT_CARDS.map((card) => {
            const value = statValues[card.key as keyof typeof statValues];
            const { Icon, bgColor, iconColor } = card;
            const label = tStatCards(card.labelKey);
            const subtitle = card.subtitleKey ? tStatCards(card.subtitleKey) : null;
            return (
              <div
                key={card.key}
                className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden border border-gray-200"
              >
                <div className={`absolute top-0 right-0 w-20 h-20 ${bgColor} rounded-bl-[100%]`}>
                  <div className="absolute top-5 right-5">
                    <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} strokeWidth={2} />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">
                  {label}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">
                  {typeof value === 'number' ? value.toLocaleString(locale) : value}
                </p>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600 relative z-10">{subtitle}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{t('listTitle')}</h2>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">
                {t('listDescription')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Download className="w-4 h-4" />
                {t('importExcel')}
              </Button>
              <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
                <Download className="w-4 h-4" />
                {t('exportExcel')}
              </Button>
              <Button
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                {t('addInstructor')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            <div className="sm:col-span-2">
              <SearchInput
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dropdown
              options={[
                { value: '', label: t('allFacultiesOption') },
                ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
              ]}
              value={selectedFacultyId}
              placeholder={t('allFaculties')}
              onChange={(value) => {
                setSelectedFacultyId(value);
                setCurrentPage(1);
              }}
            />

            <Dropdown
              options={degreeOptions}
              value={selectedDegree}
              placeholder={t('allDegrees')}
              onChange={(value) => {
                setSelectedDegree(value);
                setCurrentPage(1);
              }}
            />

            <Dropdown
              options={statusOptions}
              value={selectedStatus}
              placeholder={t('allStatuses')}
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            />
          </div>

          {selectedInstructorIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-[#0053AD] rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {t('bulkSelection', { count: selectedInstructorIds.size })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
                  onClick={handleBulkEdit}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('bulkEdit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={handleBulkDelete}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('bulkDelete')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setSelectedInstructorIds(new Set())}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t('clearSelection')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            {loading ? (
              <TableSkeleton />
            ) : instructors.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">{t('noData')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#0053AD] text-white">
                      <th className="py-3 px-4 text-left w-10">
                        <input 
                          type="checkbox" 
                          className="rounded border-white cursor-pointer accent-white"
                          checked={instructors.length > 0 && selectedInstructorIds.size === instructors.length}
                          onChange={handleSelectAll}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = selectedInstructorIds.size > 0 && selectedInstructorIds.size < instructors.length;
                            }
                          }}
                        />
                      </th>
                      <th className="py-3 px-4 text-left">{t('tableColumns.instructorCode')}</th>
                      <th className="py-3 px-4 text-left">{t('tableColumns.fullName')}</th>
                      <th className="py-3 px-4 text-left">{t('tableColumns.faculty')}</th>
                      <th className="py-3 px-4 text-left">{t('tableColumns.specialization')}</th>
                      <th className="py-3 px-4 text-left">{t('tableColumns.contact')}</th>
                      <th className="py-3 px-4 text-center">{t('tableColumns.classCount')}</th>
                      <th className="py-3 px-4 text-center">{t('tableColumns.status')}</th>
                      <th className="py-3 px-4 text-center w-32">{t('tableColumns.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((ins, index) => {
                      const statusDisplay = getEmploymentStatusDisplay(ins.employmentStatus, tFilters);
                      const isSelected = selectedInstructorIds.has(ins.instructorId);
                      return (
                        <tr
                          key={ins.instructorId}
                          className={
                            index % 2 === 0
                              ? 'border-b border-gray-100 hover:bg-gray-50'
                              : 'bg-gray-50 border-b border-gray-100 hover:bg-gray-100'
                          }
                        >
                          <td className="py-3 px-4">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 cursor-pointer accent-[#0053AD]"
                              checked={isSelected}
                              onChange={() => handleSelectOne(ins.instructorId)}
                            />
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-900">
                            {ins.instructorCode}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-900">
                            {ins.fullName}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                            {ins.facultyName}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                            {ins.specialization || '-'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                            {ins.email}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-900">{ins.classCount}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}
                            >
                              {statusDisplay.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <InstructorActionsMenu
                              onView={() => router.push(`/admin/instructor-profile/${ins.instructorId}`)}
                              onEdit={() => setEditInstructorId(ins.instructorId)}
                              onDelete={() => handleDeleteInstructor(ins)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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

      <AddInstructorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setCurrentPage(1)}
      />

      <EditInstructorModal
        isOpen={!!editInstructorId}
        instructorId={editInstructorId}
        onClose={() => setEditInstructorId(null)}
        onSuccess={() => setCurrentPage(1)}
      />

      <ExportInstructorModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filters={{
          facultyId: selectedFacultyId || undefined,
          degree: selectedDegree || undefined,
          employmentStatus: selectedStatus || undefined,
        }}
      />

      <ImportInstructorExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => setCurrentPage(1)}
      />

    </div>
  );
}