'use client';

import { useState, useMemo, useCallback } from 'react';
import { Plus, Download, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SearchInput, Dropdown, Button } from '@/app/components/ui';
import { Pagination } from '@/app/components/ui/pagination';
import { useSubjects } from './lib/hooks/useSubjects';
import { subjectsApi } from './lib/api/subjectsApi';
import { STATUS_OPTIONS, getStatusDisplay } from './lib/types/types';
import type { Subject } from './lib/types/types';
import AddSubjectModal from './components/AddSubjectModal';
import EditSubjectModal from './components/EditSubjectModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import BulkEditModal from './components/BulkEditModal';
import BulkDeleteModal from './components/BulkDeleteModal';
import SubjectActionsMenu from './components/SubjectActionsMenu';

export default function SubjectManagementPage() {
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

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedSubjectIds((prev) => {
        const newSet = new Set(prev);
        const currentPageSubjectIds = subjects.map((s) => s.subjectId);

        if (checked) {
          currentPageSubjectIds.forEach((id) => newSet.add(id));
        } else {
          currentPageSubjectIds.forEach((id) => newSet.delete(id));
        }

        return newSet;
      });
    },
    [subjects],
  );

  const handleSelectOne = useCallback((subjectId: string, checked: boolean) => {
    setSelectedSubjectIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(subjectId);
      } else {
        newSet.delete(subjectId);
      }
      return newSet;
    });
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedSubjectIds(new Set());
  }, []);

  const isAllSelected = useMemo(() => {
    return subjects.length > 0 && subjects.every((s) => selectedSubjectIds.has(s.subjectId));
  }, [subjects, selectedSubjectIds]);

  const isSomeSelected = useMemo(() => {
    return selectedSubjectIds.size > 0 && !isAllSelected;
  }, [selectedSubjectIds, isAllSelected]);

  const handleDeleteConfirm = async () => {
    if (!deleteSubject) return;

    setIsDeleting(true);
    try {
      const res = await subjectsApi.deleteSubject(deleteSubject.subjectId);
      if (res.success) {
        toast.success('Xóa môn học thành công');
        refetch();
        setDeleteSubject(null);
      } else {
        toast.error(res.message || 'Xóa môn học thất bại');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi xóa môn học';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    if (!selectedFacultyId) return departments;
    return departments.filter((d) => d.facultyId === selectedFacultyId);
  }, [departments, selectedFacultyId]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý môn học</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin các môn học</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Danh sách môn học</h2>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4" />
                Xuất Excel
              </Button>
              <Button
                className="bg-[#0053AD] hover:bg-[#003d82] text-white"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Thêm mới
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            <div className="sm:col-span-2">
              <SearchInput
                placeholder="Tìm kiếm theo Mã môn học, tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dropdown
              options={[
                { value: '', label: 'Tất cả khoa' },
                ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
              ]}
              value={selectedFacultyId}
              placeholder="Tất cả khoa"
              onChange={(value) => {
                setSelectedFacultyId(value);
                setSelectedDepartmentId('');
                setCurrentPage(1);
              }}
            />

            <Dropdown
              options={[
                { value: '', label: 'Tất cả bộ môn' },
                ...filteredDepartments.map((d) => ({ value: d.departmentId, label: d.departmentName })),
              ]}
              value={selectedDepartmentId}
              placeholder="Tất cả bộ môn"
              onChange={(value) => {
                setSelectedDepartmentId(value);
                setCurrentPage(1);
              }}
            />

            <Dropdown
              options={STATUS_OPTIONS}
              value={selectedStatus}
              placeholder="Tất cả trạng thái"
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
                  Đã chọn <span className="font-bold text-[#0053AD]">{selectedSubjectIds.size}</span> môn học
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
                  Chỉnh sửa toàn bộ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa toàn bộ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                  Bỏ chọn
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 min-w-0">
          <div className="p-4 lg:p-6 min-w-0">
            {loading ? (
              <div className="text-center text-gray-500 text-sm py-8">Đang tải...</div>
            ) : subjects.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">Không có dữ liệu</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#0053AD] text-white">
                      <th className="py-3 px-4 text-center w-10">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = isSomeSelected;
                            }
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-white"
                        />
                      </th>
                      <th className="py-3 px-4 text-left">Mã</th>
                      <th className="py-3 px-4 text-left">Tên môn học</th>
                      <th className="py-3 px-4 text-left">Giảng viên</th>
                      <th className="py-3 px-4 text-center">Tín chỉ</th>
                      <th className="py-3 px-4 text-center">Sinh viên</th>
                      <th className="py-3 px-4 text-center">Kỳ</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                      <th className="py-3 px-4 text-center w-20">HĐ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject, index) => {
                      const statusDisplay = getStatusDisplay(subject.subjectStatus);
                      const isSelected = selectedSubjectIds.has(subject.subjectId);
                      return (
                        <tr
                          key={subject.subjectId}
                          className={
                            isSelected
                              ? 'bg-blue-50 border-b border-gray-100'
                              : index % 2 === 0
                                ? 'border-b border-gray-100 hover:bg-gray-50'
                                : 'bg-gray-50 border-b border-gray-100 hover:bg-gray-100'
                          }
                        >
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectOne(subject.subjectId, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-900">
                            {subject.subjectCode}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-900">
                            {subject.subjectName}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                            {subject.departmentName}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-900">
                            {subject.credits}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-blue-600">
                              {subject.totalEnrollmentsCount}/{subject.activeCoursesCount * 40}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600">
                            {subject.isGeneral ? 'Đại cương' : 'Chuyên ngành'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}
                            >
                              {statusDisplay.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <SubjectActionsMenu
                              onEdit={() => setEditSubjectId(subject.subjectId)}
                              onDelete={() => setDeleteSubject(subject)}
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
