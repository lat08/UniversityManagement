"use client"

import { useState } from "react"
import { Calendar, CalendarX, CalendarCheck, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { ExamCard} from "@/app/components/exam-schedule/card/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { examsData } from "@/public/data/exam-schedule"



export function ExamScheduleContent() {
  const [selectedSemester, setSelectedSemester] = useState("semester-2-2024-2025")

  const totalExams = examsData.length
  const upcomingExams = examsData.filter((exam) => exam.status === "upcoming")
  const completedExams = examsData.filter((exam) => exam.status === "completed")
  const completionPercentage = Math.round((completedExams.length / totalExams) * 100)

  const nextExam = upcomingExams[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch thi</h1>
        <p className="text-gray-500">Hiển thị đầy đủ lịch thi học kỳ theo kế hoạch đào tạo</p>
      </div>

      {/* Semester Selector and Export Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Chọn học kỳ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semester-2-2024-2025">Học kỳ 2 - Năm học 2024 - 2025</SelectItem>
            <SelectItem value="semester-1-2024-2025">Học kỳ 1 - Năm học 2024 - 2025</SelectItem>
            <SelectItem value="semester-3-2023-2024">Học kỳ 3 - Năm học 2023 - 2024</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Xuất lịch thi
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng số môn thi</CardTitle>

            {/* Góc trang trí */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gray-100 rounded-full opacity-70" />

            {/* Icon */}
            <div className="h-8 w-8 rounded bg-gray-300 flex items-center justify-center flex-shrink-0 relative z-10">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="text-4xl font-bold text-gray-700 mb-2">{totalExams}</div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="text-gray-500">✏️</span>
              <span>Học kỳ 2, 2024 - 2025</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-gray-600">Môn thi sắp tới</CardTitle>
            {/* Góc trang trí */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-100 rounded-full opacity-70" />

            <div className="h-8 w-8 rounded bg-red-200 flex items-center justify-center flex-shrink-0 relative z-10">
              <CalendarX className="h-5 w-5 text-red-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600 mb-2">{upcomingExams.length}</div>
            {nextExam && (
              <div className="text-sm">
                <div className="text-gray-600 mb-1">Môn thi gần nhất:</div>
                <div className="text-red-600 font-medium">
                  {nextExam.courseName} - {nextExam.date.split(", ")[1]} - {nextExam.time.split(" - ")[0]}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-gray-600">Môn đã thi</CardTitle>
            {/* Góc trang trí */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-50 rounded-full opacity-70" />

            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 relative z-10">
              <CalendarCheck className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 mb-3">{completedExams.length}</div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Tiến độ</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${completionPercentage}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900">{completionPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">Lịch thi các môn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {examsData.map((exam, index) => (
            <ExamCard key={index} {...exam} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
