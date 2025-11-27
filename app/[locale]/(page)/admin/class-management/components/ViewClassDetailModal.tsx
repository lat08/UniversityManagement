'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input } from '@/app/components/ui';
import { X } from 'lucide-react';
import { classesApi } from '../lib/api/classesApi';
import { getStatusDisplay } from '../lib/types/types';
import type { ClassDetail, StudentDto } from '../lib/types/types';
import { ResizableTable, ResizableColumn } from '../../student-profile/components/ResizableTable';

interface ViewClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

export default function ViewClassDetailModal({ isOpen, onClose, classId }: ViewClassDetailModalProps) {
  const t = useTranslations('admin.classManagement');
  const tCommon = useTranslations('common.actions');
  
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [studentColumns, setStudentColumns] = useState<ResizableColumn[]>([
    { key: 'studentCode', label: t('modals.view.studentCode'), width: 140, minWidth: 120, align: 'left', visible: true, required: true },
    { key: 'fullName', label: t('modals.view.studentName'), width: 200, minWidth: 150, align: 'left', visible: true, required: true },
    { key: 'email', label: t('modals.view.email'), width: 220, minWidth: 180, align: 'left', visible: true },
    { key: 'enrollmentStatus', label: t('modals.view.status'), width: 140, minWidth: 120, align: 'center', visible: true },
  ]);

  useEffect(() => {
    if (!isOpen || !classId) return;

    const fetchClassDetail = async () => {
      setLoading(true);
      try {
        const response = await classesApi.getClassById(classId);
        if (response.success) {
          setClassDetail(response.data);
        }
      } catch (error) {
        console.error('Error fetching class detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [isOpen, classId]);

  if (!isOpen) return null;

  const statusDisplay = classDetail ? getStatusDisplay(classDetail.classStatus, (key) => t(key)) : null;

  const renderStudentRow = useCallback((student: StudentDto, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => {
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
            case 'studentCode':
              return (
                <td key="studentCode" className="text-gray-900 font-medium" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.studentCode}
                </td>
              );
            case 'fullName':
              return (
                <td key="fullName" className="text-gray-900" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.fullName}
                </td>
              );
            case 'email':
              return (
                <td key="email" className="text-gray-600" style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {student.email}
                </td>
              );
            case 'enrollmentStatus':
              return (
                <td key="enrollmentStatus" className="text-center text-gray-600" style={cellPaddingStyle}>
                  {student.enrollmentStatus}
                </td>
              );
            default:
              return null;
          }
        })}
      </>
    );
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('modals.view.title')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('modals.view.description')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">{tCommon('loading')}</div>
            </div>
          ) : classDetail ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Mã lớp học */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.classCode')}
                </label>
                <Input
                  value={classDetail.classCode}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Tên lớp học */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.className')}
                </label>
                <Input
                  value={classDetail.className}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Chuyên ngành */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.department')}
                </label>
                <Input
                  value={classDetail.departmentName}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Khoa */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.faculty')}
                </label>
                <Input
                  value={classDetail.facultyName || '-'}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Hệ đào tạo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.trainingSystem')}
                </label>
                <Input
                  value={classDetail.trainingSystemName}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Cố vấn học tập */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.advisorInstructor')}
                </label>
                <Input
                  value={classDetail.advisorInstructorName || 'Chưa phân công'}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Chương trình đào tạo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.curriculum')}
                </label>
                <Input
                  value={classDetail.curriculumName || '-'}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Năm học bắt đầu */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.startAcademicYear')}
                </label>
                <Input
                  value={classDetail.startAcademicYearName}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Năm học kết thúc */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.endAcademicYear')}
                </label>
                <Input
                  value={classDetail.endAcademicYearName}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Số lượng sinh viên */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.studentCount')}
                </label>
                <Input
                  value={classDetail.studentCount.toString()}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Trạng thái */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('modals.view.status')}
                </label>
                <Input
                  value={statusDisplay?.label || classDetail.classStatus || 'N/A'}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Students List */}
              {classDetail.students && classDetail.students.length > 0 && (
                <div className="col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('modals.view.students')}</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <ResizableTable
                      columns={studentColumns}
                      data={classDetail.students}
                      renderRow={(student, visibleColumns, cellStyle) => (
                        <tr className="hover:bg-gray-50">
                          {renderStudentRow(student, visibleColumns, cellStyle)}
                        </tr>
                      )}
                      isLoading={false}
                      emptyMessage={tCommon('noData')}
                      onColumnsResize={setStudentColumns}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">{t('modals.view.notFound')}</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
          >
            {tCommon('close')}
          </Button>
        </div>
      </div>
    </div>
  );
}

