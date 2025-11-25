'use client';

import { useMemo, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { SearchInput, Dropdown, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { InstructorListItem } from './lib/types/types';
import { EMPLOYMENT_STATUS_OPTIONS, DEGREE_OPTIONS } from './lib/constants/filters';
import { getEmploymentStatusDisplay } from './lib/utils/display';
import { instructorsApi } from './lib/api/instructorsApi';
import { TableSkeleton, StatCardsSkeleton } from '../student-profile/components/LoadingSkeleton';
import AddInstructorModal from './components/AddInstructorModal';
import EditInstructorModal from './components/EditInstructorModal';
import ExportInstructorModal from './components/ExportInstructorModal';
import ImportInstructorExcelModal from './components/ImportInstructorExcelModal';
import InstructorDetailModal from './components/InstructorDetailModal';
import InstructorActionsMenu from './components/InstructorActionsMenu';
import { STAT_CARDS } from './lib/constants/statCards';
import { useInstructors } from './lib/hooks/useInstructors';

export default function InstructorProfilePage() {
  const t = useTranslations('admin.instructorProfile');
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
  const [detailInstructorId, setDetailInstructorId] = useState<string | null>(null);
  const [editInstructorId, setEditInstructorId] = useState<string | null>(null);

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
      // Tạm dùng doctorCount cho card Giáo sư nếu backend chưa tách riêng
      professor: stats.doctorCount,
      doctor: stats.doctorCount,
      master: stats.masterCount,
    };
  }, [stats]);

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
        // useInstructors exposes latest filters & pagination; re-fetch by resetting page
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
                  {card.label}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">
                  {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
                </p>
                {card.subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600 relative z-10">{card.subtitle}</p>
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
              options={DEGREE_OPTIONS}
              value={selectedDegree}
              placeholder={t('allDegrees')}
              onChange={(value) => {
                setSelectedDegree(value);
                setCurrentPage(1);
              }}
            />

            <Dropdown
              options={EMPLOYMENT_STATUS_OPTIONS}
              value={selectedStatus}
              placeholder={t('allStatuses')}
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            />
          </div>
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
                        <input type="checkbox" className="rounded border-white" />
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
                      const statusDisplay = getEmploymentStatusDisplay(ins.employmentStatus);
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
                            <input type="checkbox" className="rounded border-gray-300" />
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
                              onView={() => setDetailInstructorId(ins.instructorId)}
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

      <InstructorDetailModal
        isOpen={!!detailInstructorId}
        instructorId={detailInstructorId}
        onClose={() => setDetailInstructorId(null)}
      />
    </div>
  );
}