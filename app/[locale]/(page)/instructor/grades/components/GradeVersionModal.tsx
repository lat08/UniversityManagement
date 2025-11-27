'use client';

import { useTranslations } from 'next-intl';
import { X, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { Table, type TableColumn } from '@/app/components/ui/table';
import { formatDateTime } from '@/lib/utils/format';
import { calculateAverage } from '@/lib/utils/grade-calculator';
import { formatGrade } from '@/lib/utils/grade-calculator';
import { GRADE_STATUS_LABELS, GRADE_STATUS_COLORS, GRADE_WEIGHTS } from '../lib/constants';
import type { GradeVersionDetailDto, InstructorGradeDto } from '../lib/types';

interface GradeVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionDetail: GradeVersionDetailDto | null;
  isLoading?: boolean;
}

export const GradeVersionModal = ({
  isOpen,
  onClose,
  versionDetail,
  isLoading,
}: GradeVersionModalProps) => {
  const t = useTranslations('instructor.grades.versionModal');
  const tStatuses = useTranslations('instructor.grades.statuses');
  
  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PendingApproval':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const columns: TableColumn[] = [
    { key: 'mssv', label: t('mssv'), align: 'left' },
    { key: 'fullName', label: t('fullName'), align: 'left' },
    { key: 'attendanceGrade', label: `${t('attendanceGrade')} (${GRADE_WEIGHTS.ATTENDANCE * 100}%)`, align: 'center' },
    { key: 'midtermGrade', label: `${t('midtermGrade')} (${GRADE_WEIGHTS.MIDTERM * 100}%)`, align: 'center' },
    { key: 'finalGrade', label: `${t('finalGrade')} (${GRADE_WEIGHTS.FINAL * 100}%)`, align: 'center' },
    { key: 'average', label: t('average'), align: 'center' },
  ];

  const renderRow = (student: InstructorGradeDto) => {
    const average = calculateAverage(student);
    return (
      <>
        <td className="px-6 py-4 text-sm text-gray-900">{student.mssv}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{student.fullName}</td>
        <td className="px-6 py-4 text-sm text-center text-gray-900">
          {formatGrade(student.attendanceGrade)}
        </td>
        <td className="px-6 py-4 text-sm text-center text-gray-900">
          {formatGrade(student.midtermGrade)}
        </td>
        <td className="px-6 py-4 text-sm text-center text-gray-900">
          {formatGrade(student.finalGrade)}
        </td>
        <td className="px-6 py-4 text-sm text-center">
          <span
            className={`font-medium ${
              average !== null && average >= 5
                ? 'text-green-600'
                : average !== null
                  ? 'text-red-600'
                  : 'text-gray-400'
            }`}
          >
            {formatGrade(average)}
          </span>
        </td>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('title')}
            </h2>
            {versionDetail && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  GRADE_STATUS_COLORS[versionDetail.versionStatus] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {tStatuses(versionDetail.versionStatus as 'Draft' | 'PendingApproval' | 'Approved' | 'Rejected') || GRADE_STATUS_LABELS[versionDetail.versionStatus] || versionDetail.versionStatus}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">{t('loading')}</div>
            </div>
          ) : versionDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('subject')}</p>
                    <p className="font-medium text-gray-900">
                      {versionDetail.courseCode} - {versionDetail.courseName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('courseClass')}</p>
                    <p className="font-medium text-gray-900">{versionDetail.className}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('version')}</p>
                    <p className="font-medium text-gray-900">{t('version')} {versionDetail.versionNumber}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {versionDetail.submittedBy && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t('submittedBy')}</p>
                        <p className="font-medium text-gray-900">{versionDetail.submittedBy}</p>
                        {versionDetail.submittedAt && (
                          <p className="text-xs text-gray-500">
                            {formatDateTime(versionDetail.submittedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {versionDetail.approvedBy && (
                    <div className="flex items-start gap-2">
                      {getStatusIcon(versionDetail.versionStatus)}
                      <div>
                        <p className="text-sm text-gray-600">
                          {versionDetail.versionStatus === 'Approved' ? t('approvedBy') : t('rejectedBy')}
                        </p>
                        <p className="font-medium text-gray-900">{versionDetail.approvedBy}</p>
                        {versionDetail.approvedAt && (
                          <p className="text-xs text-gray-500">
                            {formatDateTime(versionDetail.approvedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {versionDetail.submissionNote && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">{t('submissionNote')}</p>
                  <p className="text-sm text-blue-800">{versionDetail.submissionNote}</p>
                </div>
              )}

              {versionDetail.approvalNote && (
                <div
                  className={`border rounded-lg p-4 ${
                    versionDetail.versionStatus === 'Approved'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-1 ${
                      versionDetail.versionStatus === 'Approved' ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {t('approvalNote')}
                  </p>
                  <p
                    className={`text-sm ${
                      versionDetail.versionStatus === 'Approved' ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {versionDetail.approvalNote}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('studentsList', { count: versionDetail.totalStudents })}
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <Table
                    columns={columns}
                    data={versionDetail.students}
                    renderRow={renderRow}
                    emptyMessage={t('emptyData')}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600">{t('noData')}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
