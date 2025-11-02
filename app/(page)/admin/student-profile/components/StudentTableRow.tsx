import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Student, getStatusDisplay } from '../lib/types/types';

interface StudentTableRowProps {
  student: Student;
  onDelete: (studentId: string, studentName: string) => void;
  onPrefetch?: () => void;
}

const StudentTableRow = memo<StudentTableRowProps>(({ student, onDelete, onPrefetch }) => {
  const router = useRouter();
  const statusDisplay = getStatusDisplay(student.enrollmentStatus);

  return (
    <tr
      className="hover:bg-gray-50 transition-colors"
      onMouseEnter={onPrefetch}
    >
      <td className="px-6 py-4 text-sm text-gray-900">
        {student.studentCode}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {student.fullName}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {student.departmentName}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {student.academicYear}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {student.email}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <span className={`w-full text-center px-3 py-1 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
            {statusDisplay.label}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => router.push(`/admin/student-profile/${student.studentId}`)}
            onMouseEnter={onPrefetch}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/student-profile/${student.studentId}/edit`)}
            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(student.studentId, student.fullName)}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if student data changes
  return prevProps.student.studentId === nextProps.student.studentId &&
         prevProps.student.fullName === nextProps.student.fullName &&
         prevProps.student.enrollmentStatus === nextProps.student.enrollmentStatus;
});

StudentTableRow.displayName = 'StudentTableRow';

export default StudentTableRow;




