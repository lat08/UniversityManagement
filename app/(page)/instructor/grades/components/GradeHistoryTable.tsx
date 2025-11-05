'use client';

import { Table, type TableColumn } from '@/app/components/ui/table';
import { formatDateTime } from '@/lib/utils/format';
import type { GradeChangeHistoryDto } from '../lib/types';

interface GradeHistoryTableProps {
  history: GradeChangeHistoryDto[];
}

export const GradeHistoryTable = ({ history }: GradeHistoryTableProps) => {
  const columns: TableColumn<GradeChangeHistoryDto>[] = [
    { key: 'changeDate', label: 'Thời gian', align: 'left' },
    { key: 'action', label: 'Hành động', align: 'left' },
    { key: 'actorName', label: 'Người thực hiện', align: 'left' },
    { key: 'note', label: 'Ghi chú', align: 'left' },
  ];

  const renderRow = (item: GradeChangeHistoryDto) => (
    <>
      <td className="px-6 py-4 text-sm text-gray-900">
        {formatDateTime(item.changeDate)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {item.action}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {item.actorName}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {item.note || '-'}
      </td>
    </>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Lịch sử thay đổi</h3>
      </div>
      <Table
        columns={columns}
        data={history}
        renderRow={renderRow}
        emptyMessage="Chưa có lịch sử thay đổi"
      />
    </div>
  );
};



