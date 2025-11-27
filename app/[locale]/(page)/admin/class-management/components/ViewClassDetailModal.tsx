'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';
import { X } from 'lucide-react';
import { classesApi } from '../lib/api/classesApi';
import { getStatusDisplay } from '../lib/types/types';
import type { ClassDetail } from '../lib/types/types';

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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
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

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">{tCommon('loading')}</div>
            </div>
          ) : classDetail ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('modals.view.basicInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.classCode')}</label>
                    <p className="mt-1 text-sm text-gray-900">{classDetail.classCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.className')}</label>
                    <p className="mt-1 text-sm text-gray-900">{classDetail.className}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.department')}</label>
                    <p className="mt-1 text-sm text-gray-900">{classDetail.departmentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.faculty')}</label>
                    <p className="mt-1 text-sm text-gray-900">{classDetail.facultyName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.trainingSystem')}</label>
                    <p className="mt-1 text-sm text-gray-900">{classDetail.trainingSystemName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.status')}</label>
                    <p className="mt-1">
                      {statusDisplay && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                          {statusDisplay.label}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.advisorInstructor')}</label>
                    <p className="mt-1 text-sm text-gray-900">{classDetail.advisorInstructorName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.curriculum')}</label>
                    <p className="mt-1 text-sm text-gray-900">{classDetail.curriculumName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.startAcademicYear')}</label>
                    <p className="mt-1 text-sm text-gray-900">{classDetail.startAcademicYearName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.endAcademicYear')}</label>
                    <p className="mt-1 text-sm text-gray-900">{classDetail.endAcademicYearName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modals.view.studentCount')}</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{classDetail.studentCount}</p>
                  </div>
                </div>
              </div>

              {/* Students List */}
              {classDetail.students && classDetail.students.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('modals.view.students')}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('modals.view.studentCode')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('modals.view.studentName')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('modals.view.email')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('modals.view.status')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {classDetail.students.map((student) => (
                          <tr key={student.studentId}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.studentCode}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.fullName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{student.enrollmentStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

        <div className="p-6 border-t flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {tCommon('close')}
          </Button>
        </div>
      </div>
    </div>
  );
}

