import type { ScheduleTranslationFn } from "@/lib/types"

export const SemesterScheduleSkeleton = ({ translate }: { translate?: ScheduleTranslationFn } = {}) => {
  const rows = 8
  const columns = [
    translate ? translate('table.headers.subjectCode') : 'Mã MH',
    translate ? translate('table.headers.subjectName') : 'Tên môn học',
    translate ? translate('table.headers.courseGroup') : 'Nhóm tổ',
    translate ? translate('table.headers.credits') : 'Số tín chỉ',
    translate ? translate('table.headers.class') : 'Lớp',
    translate ? translate('table.headers.dayOfWeek') : 'Thứ',
    translate ? translate('table.headers.startPeriod') : 'Tiết bắt đầu',
    translate ? translate('table.headers.numberOfPeriods') : 'Số tiết',
    translate ? translate('table.headers.roomCode') : 'Phòng',
    translate ? translate('table.headers.instructorName') : 'Giảng viên',
    translate ? translate('table.headers.time') : 'Thời gian học',
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div>
        <table className="w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-[var(--primary)]">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-center text-xs font-semibold text-[var(--primary-foreground)] uppercase tracking-wider border-r border-white last:border-r-0"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-[var(--bg-secondary)]'}
              >
                {columns.map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 border-r border-gray-200 last:border-r-0"
                  >
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
