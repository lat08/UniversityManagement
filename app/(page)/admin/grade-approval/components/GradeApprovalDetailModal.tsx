'use client';

import { useCallback, useEffect, useMemo, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Users, NotebookPen, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { gradeApprovalsApi } from '../lib/api/gradeApprovalsApi';
import { getApprovalStatusDisplay, type AdminGradeDetailEntry } from '../lib/types/types';
import { queryKeys } from '@/lib/api/queryKeys';
import { ResizableTable, type ResizableColumn } from '@/app/(page)/admin/student-profile/components/ResizableTable';

interface GradeApprovalDetailModalProps {
  gradeVersionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (gradeVersionId: string) => void;
  onReject: (gradeVersionId: string) => void;
  isProcessing?: boolean;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const GradeApprovalDetailModal = ({
  gradeVersionId,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isProcessing,
}: GradeApprovalDetailModalProps) => {
  const studentColumns = useMemo<ResizableColumn[]>(
    () => [
      { key: 'mssv', label: 'MSSV', width: 140, minWidth: 120, align: 'left' },
      { key: 'fullName', label: 'Họ tên', width: 200, minWidth: 160, align: 'left' },
      { key: 'attendance', label: 'Chuyên cần', width: 140, minWidth: 120, align: 'center' },
      { key: 'midterm', label: 'Giữa kỳ', width: 130, minWidth: 110, align: 'center' },
      { key: 'final', label: 'Cuối kỳ', width: 130, minWidth: 110, align: 'center' },
      { key: 'average', label: 'Trung bình', width: 140, minWidth: 120, align: 'center' },
      { key: 'note', label: 'Ghi chú', width: 200, minWidth: 160, align: 'left' },
    ],
    [],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handler);
    }
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [isOpen, onClose]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: gradeVersionId
      ? queryKeys.adminGradeApprovals.detail(gradeVersionId)
      : ['adminGradeApprovals', 'detail', 'idle'],
    queryFn: async () => {
      if (!gradeVersionId) {
        throw new Error('gradeVersionId is required');
      }
      return gradeApprovalsApi.getGradeApprovalDetail(gradeVersionId);
    },
    enabled: isOpen && Boolean(gradeVersionId),
    staleTime: 60_000,
  });

  const statusDisplay = useMemo(
    () => (data ? getApprovalStatusDisplay(data.versionStatus) : null),
    [data],
  );

  const renderStudentRow = useCallback(
    (
      student: AdminGradeDetailEntry,
      visibleColumns: ResizableColumn[],
      cellStyle: { paddingX: string; paddingY: string },
    ) => {
      const renderCell = (current?: number | null, previous?: number | null): ReactElement => {
        if (current === undefined || current === null) {
          return <span className="text-gray-400">—</span>;
        }
        const changed =
          previous !== undefined && previous !== null && previous.toFixed(2) !== current.toFixed(2);
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-medium text-gray-900">{current.toFixed(2)}</span>
            {changed && (
              <span className="text-[10px] text-blue-600">Trước: {previous?.toFixed(2)}</span>
            )}
          </div>
        );
      };

      const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);

      return (
        <tr key={student.enrollmentId} className="hover:bg-gray-50 transition-colors">
          {visibleColumns.map((column) => {
            const widthPercent =
              (column as { widthPercent?: number }).widthPercent ||
              (baseTotalWidth > 0 ? (column.width / baseTotalWidth) * 100 : 100 / visibleColumns.length);

            const cellPaddingStyle = {
              width: `${widthPercent}%`,
              paddingLeft: cellStyle.paddingX,
              paddingRight: cellStyle.paddingX,
              paddingTop: cellStyle.paddingY,
              paddingBottom: cellStyle.paddingY,
            };

            switch (column.key) {
              case 'mssv':
                return (
                  <td key="mssv" className="text-gray-900 font-semibold" style={cellPaddingStyle}>
                    {student.mssv}
                  </td>
                );
              case 'fullName':
                return (
                  <td
                    key="fullName"
                    className="text-gray-700"
                    style={{ ...cellPaddingStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {student.fullName}
                  </td>
                );
              case 'attendance':
                return (
                  <td key="attendance" className="text-center" style={cellPaddingStyle}>
                    {renderCell(student.attendanceGrade, student.previousAttendanceGrade)}
                  </td>
                );
              case 'midterm':
                return (
                  <td key="midterm" className="text-center" style={cellPaddingStyle}>
                    {renderCell(student.midtermGrade, student.previousMidtermGrade)}
                  </td>
                );
              case 'final':
                return (
                  <td key="final" className="text-center" style={cellPaddingStyle}>
                    {renderCell(student.finalGrade, student.previousFinalGrade)}
                  </td>
                );
              case 'average':
                return (
                  <td key="average" className="text-center" style={cellPaddingStyle}>
                    {renderCell(student.averageGrade, student.previousAverageGrade)}
                  </td>
                );
              case 'note':
                return (
                  <td
                    key="note"
                    className="text-xs text-gray-600"
                    style={{ ...cellPaddingStyle, textAlign: 'left' }}
                  >
                    {student.note || '—'}
                  </td>
                );
              default:
                return null;
            }
          })}
        </tr>
      );
    },
    [],
  );

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Chi tiết bảng điểm</p>
            <h2 className="text-2xl font-semibold text-gray-900 mt-1">
              {data?.courseCode} · {data?.courseName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Lớp {data?.className} · Học kỳ {data?.semesterName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {statusDisplay && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusDisplay.color}`}
              >
                {statusDisplay.label}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900"
              title="Đóng"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {(isLoading || isFetching) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải dữ liệu phiên bản bảng điểm...
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Người nộp</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{data?.submittedBy || '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(data?.submittedAt)}</p>
              {data?.submissionNote && (
                <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-2">
                  “{data.submissionNote}”
                </p>
              )}
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Người duyệt</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{data?.approvedBy || '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(data?.approvedAt)}</p>
              {data?.approvalNote && (
                <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-2">
                  “{data.approvalNote}”
                </p>
              )}
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Phiên bản</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                Lần {data?.versionNumber ?? '—'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {data?.totalStudents ?? 0} sinh viên
              </p>
              {data?.previousVersionNumber && (
                <p className="text-xs text-blue-600 mt-1">
                  Có phiên bản trước: #{data.previousVersionNumber}
                </p>
              )}
            </div>
          </div>

          {/* Students table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <NotebookPen className="h-4 w-4 text-[#0053AD]" />
                Bảng điểm chi tiết
              </div>
              <p className="text-xs text-gray-500">
                Hiển thị {data?.students.length ?? 0}/{data?.totalStudents ?? 0} sinh viên
              </p>
            </div>
            <div className="max-h-[320px] overflow-auto">
              <ResizableTable
                columns={studentColumns}
                data={data?.students ?? []}
                renderRow={renderStudentRow}
                isLoading={isLoading || isFetching}
                emptyMessage="Chưa có dữ liệu sinh viên trong phiên bản này."
                loadingComponent={
                  <div className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-[#0053AD]" />
                      Đang tải bảng điểm...
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500">
            {data
              ? `Cập nhật lần cuối: ${formatDateTime(data.approvedAt ?? data.submittedAt)}`
              : 'Đang tải dữ liệu...'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => gradeVersionId && onReject(gradeVersionId)}
              disabled={!gradeVersionId || isProcessing}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              Từ chối
            </Button>
            <Button
              onClick={() => gradeVersionId && onApprove(gradeVersionId)}
              disabled={!gradeVersionId || isProcessing}
              className="bg-[#0053AD] hover:bg-[#003d82] text-white disabled:opacity-50"
            >
              Duyệt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

