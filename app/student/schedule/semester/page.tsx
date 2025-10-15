"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/utils"

// Dữ liệu mẫu cho thời khóa biểu theo học kỳ
interface SemesterCourse {
  id: string
  courseCode: string
  courseName: string
  classGroup: string
  credits: number
  classCode: string
  dayOfWeek: number
  startPeriod: number
  periodCount: number
  room: string
  teacher: string
  startDate: string
  endDate: string
}

const sampleCourses: SemesterCourse[] = [
  {
    id: "1",
    courseCode: "2ENG21337",
    courseName: "SPEAKING 6 (1) (E6C)",
    classGroup: "TA50C6",
    credits: 1,
    classCode: "",
    dayOfWeek: 2,
    startPeriod: 1,
    periodCount: 3,
    room: "FLE201",
    teacher: "N.M.Koegh",
    startDate: "15/09/2025",
    endDate: "13/10/2025",
  },
  {
    id: "2",
    courseCode: "2ENG21338",
    courseName: "LISTENING 6 (2) (E6C)",
    classGroup: "TA51C6",
    credits: 2,
    classCode: "",
    dayOfWeek: 2,
    startPeriod: 1,
    periodCount: 3,
    room: "FLE201",
    teacher: "N.M.Koegh",
    startDate: "15/09/2025",
    endDate: "13/10/2025",
  },
  {
    id: "3",
    courseCode: "2ENG21339",
    courseName: "READING 6 & WRITING 6 (2) (E6C)",
    classGroup: "TA52C6",
    credits: 2,
    classCode: "",
    dayOfWeek: 2,
    startPeriod: 1,
    periodCount: 3,
    room: "FLE201",
    teacher: "N.M.Koegh",
    startDate: "15/09/2025",
    endDate: "13/10/2025",
  },
  {
    id: "4",
    courseCode: "2GEN0013",
    courseName: "CHỦ NGHĨA XÃ HỘI KHOA HỌC (2)",
    classGroup: "TV117",
    credits: 2,
    classCode: "23DAI, 23HTDL",
    dayOfWeek: 2,
    startPeriod: 1,
    periodCount: 3,
    room: "FLE201",
    teacher: "N.M.Koegh",
    startDate: "15/09/2025",
    endDate: "13/10/2025",
  },
  {
    id: "5",
    courseCode: "2GEN002V",
    courseName: "BÓNG CHUYỀN (1)",
    classGroup: "TV228",
    credits: 1,
    classCode: "23DAI, 23HTDL",
    dayOfWeek: 2,
    startPeriod: 1,
    periodCount: 3,
    room: "FLE201",
    teacher: "N.M.Koegh",
    startDate: "15/09/2025",
    endDate: "13/10/2025",
  },
  {
    id: "6",
    courseCode: "CTS53145",
    courseName: "ĐIỆN TOÁN ĐÁM MÂY (3)",
    classGroup: "TV104",
    credits: 3,
    classCode: "23DAI, 23HTDL",
    dayOfWeek: 2,
    startPeriod: 1,
    periodCount: 3,
    room: "FLE201",
    teacher: "N.M.Koegh",
    startDate: "15/09/2025",
    endDate: "13/10/2025",
  },
  {
    id: "7",
    courseCode: "CTS53151",
    courseName: "PHÁT TRIỂN VĂN HÀNH VÀ BẢO TRÌ PHẦN MỀM (3)",
    classGroup: "TV115-01",
    credits: 3,
    classCode: "24DPM, 23DPM",
    dayOfWeek: 3,
    startPeriod: 6,
    periodCount: 4,
    room: "FLE202",
    teacher: "T.T.T.Phát",
    startDate: "28/10/2025",
    endDate: "16/12/2025",
  },
  {
    id: "8",
    courseCode: "CTS53151",
    courseName: "PHÁT TRIỂN VĂN HÀNH VÀ BẢO TRÌ PHẦN MỀM (3)",
    classGroup: "TV115-01",
    credits: 3,
    classCode: "24DPM, 23DPM",
    dayOfWeek: 7,
    startPeriod: 6,
    periodCount: 4,
    room: "D0A501",
    teacher: "T.T.T.Phát",
    startDate: "08/11/2025",
    endDate: "27/12/2025",
  },
  {
    id: "9",
    courseCode: "CTS53152",
    courseName: "MỘT SỐ VẤN ĐỀ HIỆN ĐẠI TRONG CNPM (3)",
    classGroup: "TV116-01",
    credits: 3,
    classCode: "23DPM",
    dayOfWeek: 3,
    startPeriod: 1,
    periodCount: 5,
    room: "LEW202",
    teacher: "N.T.An",
    startDate: "28/10/2025",
    endDate: "16/12/2025",
  },
  {
    id: "10",
    courseCode: "CTS53152",
    courseName: "MỘT SỐ VẤN ĐỀ HIỆN ĐẠI TRONG CNPM (3)",
    classGroup: "TV116-01",
    credits: 3,
    classCode: "23DPM",
    dayOfWeek: 7,
    startPeriod: 1,
    periodCount: 5,
    room: "D0A501",
    teacher: "N.T.An",
    startDate: "21/10/2025",
    endDate: "25/11/2025",
  },
  {
    id: "11",
    courseCode: "CTS53168",
    courseName: "QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (3)",
    classGroup: "TV114-01",
    credits: 3,
    classCode: "23DPM",
    dayOfWeek: 2,
    startPeriod: 6,
    periodCount: 4,
    room: "FLE202",
    teacher: "T.T.Tuyền",
    startDate: "20/09/2025",
    endDate: "25/10/2025",
  },
  {
    id: "12",
    courseCode: "CTS53168",
    courseName: "QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (3)",
    classGroup: "TV114-01",
    credits: 3,
    classCode: "23DPM",
    dayOfWeek: 5,
    startPeriod: 6,
    periodCount: 4,
    room: "D0A501",
    teacher: "T.T.Tuyền",
    startDate: "08/11/2025",
    endDate: "27/12/2025",
  },
]

export default function SemesterSchedulePage() {
  const [selectedSemester, setSelectedSemester] = useState("Học kỳ 1 - Năm học 2025-2026")
  const [selectedView, setSelectedView] = useState("Thời khóa biểu cá nhân")
  const [isSemesterOpen, setIsSemesterOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)

  const semesters = [
    "Học kỳ 1 - Năm học 2025-2026",
    "Học kỳ 2 - Năm học 2024-2025",
    "Học kỳ 3 - Năm học 2024-2025",
  ]

  const views = [
    "Thời khóa biểu cá nhân",
    "Thời khóa biểu lớp",
  ]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.dropdown-container')) {
        setIsSemesterOpen(false)
        setIsViewOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="mx-auto max-w-[1600px]">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Thời khóa biểu theo học kỳ</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hiển thị thời khóa biểu theo từng học kỳ
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4 items-stretch w-full">
              {/* Semester Dropdown */}
              <div className="relative flex-1 dropdown-container">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full"
                  onClick={() => {
                    setIsSemesterOpen(!isSemesterOpen)
                    setIsViewOpen(false)
                  }}
                >
                  <span className="text-sm text-gray-900">{selectedSemester}</span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                </button>
                {isSemesterOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {semesters.map((semester, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => {
                          setSelectedSemester(semester)
                          setIsSemesterOpen(false)
                        }}
                      >
                        {semester}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Dropdown */}
              <div className="relative flex-1 dropdown-container">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors h-full"
                  onClick={() => {
                    setIsViewOpen(!isViewOpen)
                    setIsSemesterOpen(false)
                  }}
                >
                  <span className="text-sm text-gray-900">{selectedView}</span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-700" />
                </button>
                {isViewOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {views.map((view, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => {
                          setSelectedView(view)
                          setIsViewOpen(false)
                        }}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Print Button */}
              <button className="flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none cursor-pointer transition-colors whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="text-sm font-medium">In</span>
              </button>
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead style={{ backgroundColor: '#4E8EE1' }}>
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Mã MH
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Tên môn học
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Nhóm tổ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Số tín chỉ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Lớp
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Thứ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Tiết bắt đầu
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Số tiết
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Phòng
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-white">
                        Giảng viên
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                        Thời gian học
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleCourses.map((course, index) => (
                      <tr 
                        key={course.id}
                        className={cn(
                          "hover:bg-blue-50 transition-colors border-b border-gray-200",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        )}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          {course.courseCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          {course.courseName}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.classGroup}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.credits}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.classCode || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.dayOfWeek}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.startPeriod}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.periodCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                          {course.room}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          {course.teacher}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">
                          <div>{course.startDate} đến</div>
                          <div>{course.endDate}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
    </div>
  )
}
