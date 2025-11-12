export const SemesterScheduleSkeleton = () => {
  const rows = 8
  const columns = [
    'Mã MH', 'Tên môn học', 'Nhóm tổ', 'Số tín chỉ', 'Lớp',
    'Thứ', 'Tiết bắt đầu', 'Số tiết', 'Phòng', 'Giảng viên', 'Thời gian học'
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
