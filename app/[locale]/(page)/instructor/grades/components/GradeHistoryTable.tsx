'use client';

import { useTranslations } from 'next-intl';
import { Table, type TableColumn } from '@/app/components/ui/table';
import { formatDateTime } from '@/lib/utils/format';
import { GRADE_ACTION_LABELS, GRADE_ACTION_COLORS } from '../lib/constants';
import type { GradeChangeHistoryDto } from '../lib/types';

interface GradeHistoryTableProps {
  history: GradeChangeHistoryDto[];
  onVersionClick?: (versionNumber: number) => void;
}

export const GradeHistoryTable = ({ history, onVersionClick }: GradeHistoryTableProps) => {
  const t = useTranslations('instructor.grades.history');
  const tActions = useTranslations('instructor.grades.actionLabels');
  
  const columns: TableColumn[] = [
    { key: 'changeDate', label: t('changeDate'), align: 'left' },
    { key: 'action', label: t('action'), align: 'left' },
    { key: 'actorName', label: t('actorName'), align: 'left' },
    { key: 'note', label: t('note'), align: 'left' },
  ];

  const getActionLabel = (action: GradeChangeHistoryDto['action']): string => {
    return tActions(action as 'Submitted' | 'Approved' | 'Rejected' | 'Updated' | 'Created' | 'BulkUpdated' | 'Edited') || GRADE_ACTION_LABELS[action] || action;
  };

  const getActionColor = (action: GradeChangeHistoryDto['action']): string => {
    return GRADE_ACTION_COLORS[action] || 'bg-gray-100 text-gray-700';
  };

  const extractVersionNumber = (note: string | null): number | null => {
    if (!note) return null;
    const match = note.match(/version\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const renderRow = (item: GradeChangeHistoryDto) => {
    const versionNumber = extractVersionNumber(item.note);
    const canViewVersion = versionNumber !== null && onVersionClick;

    return (
      <>
        <td className="px-6 py-4 text-sm text-gray-900">
          {formatDateTime(item.changeDate)}
        </td>
        <td className="px-6 py-4 text-sm">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
            {getActionLabel(item.action)}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {item.actorName}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {canViewVersion ? (
            <button
              onClick={() => onVersionClick(versionNumber)}
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              {item.note}
            </button>
          ) : (
            item.note || '-'
          )}
        </td>
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
      </div>
      <Table
        columns={columns}
        data={history}
        renderRow={renderRow}
        emptyMessage={t('empty')}
      />
    </div>
  );
};







