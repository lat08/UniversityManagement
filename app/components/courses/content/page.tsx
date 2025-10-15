"use client"

import { useState } from "react"
import { BookOpen, CheckCircle2 } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"
import { RegisteredCourses } from "@/app/components/courses/content/registered/page"
import { AvailableCourses } from "@/app/components/courses/content/register/page"
import toast from "react-hot-toast" 

interface Course {
  id: string
  name: string
  code: string
  credits: number
  instructor: string
  room: string
  startDate: string
  endDate: string
  schedule: string
  studentCount?: string
}

const registeredCoursesData: Course[] = [
  {
    id: "1",
    name: "Quản lý dự án công nghệ thông tin",
    code: "CTS53168",
    credits: 3,
    instructor: "Trần Thanh Tuyền",
    room: "DOA114",
    startDate: "15/09/2025",
    endDate: "27/10/2025",
    schedule: "Thứ 4, tiết 1 - tiết 5",
  },
  {
    id: "2",
    name: "Lập trình hướng đối tượng",
    code: "CTS56687",
    credits: 3,
    instructor: "Nguyễn Thúy An",
    room: "FLE78",
    startDate: "15/09/2025",
    endDate: "27/10/2025",
    schedule: "Thứ 6, tiết 1 - tiết 5",
  },
  {
    id: "3",
    name: "Chủ nghĩa xã hội khoa học",
    code: "CTS56787",
    credits: 2,
    instructor: "Phạm Văn Tuyến",
    room: "FLE77B",
    startDate: "15/09/2025",
    endDate: "27/10/2025",
    schedule: "Thứ 7, tiết 1 - tiết 5",
  },
  {
    id: "4",
    name: "Điện toán đám mây",
    code: "CTS56787",
    credits: 3,
    instructor: "Trần Công Hùng",
    room: "FLE77B",
    startDate: "15/09/2025",
    endDate: "27/10/2025",
    schedule: "Thứ 3, tiết 1 - tiết 5",
  },
]

const availableCoursesData: Course[] = [
  {
    id: "5",
    name: "Dữ liệu lớn",
    code: "CTS51454",
    credits: 4,
    instructor: "Huỳnh Đệ Thu",
    room: "LEV345",
    startDate: "15/09/2025",
    endDate: "27/10/2025",
    schedule: "Thứ 3, tiết 6 - tiết 9",
    studentCount: "42/45",
  },
  {
    id: "6",
    name: "Học máy",
    code: "CTS64345",
    credits: 3,
    instructor: "Trương Hải Bằng",
    room: "DOA77B",
    startDate: "15/09/2025",
    endDate: "27/10/2025",
    schedule: "Thứ 5, tiết 1 - tiết 5",
    studentCount: "10/45",
  },
  {
    id: "7",
    name: "Xử lý ngôn ngữ tự nhiên",
    code: "CTS56787",
    credits: 3,
    instructor: "Nguyễn Tuấn Đăng",
    room: "LEW111",
    startDate: "15/09/2025",
    endDate: "27/10/2025",
    schedule: "Thứ 5, tiết 4 - tiết 9",
    studentCount: "10/45",
  },
  {
    id: "8",
    name: "An toàn và bảo mật thông tin",
    code: "CTS68787",
    credits: 2,
    instructor: "Trần Công Hùng",
    room: "DOA77B",
    startDate: "15/09/2025",
    endDate: "27/10/2025",
    schedule: "Thứ 2, tiết 1 - tiết 5",
    studentCount: "10/45",
  },
]
export function CoursesContent() {
  const [activeTab, setActiveTab] = useState<"registered" | "available">("registered")
  const [registeredCourses, setRegisteredCourses] = useState<Course[]>(registeredCoursesData)
  const [availableCourses, setAvailableCourses] = useState<Course[]>(availableCoursesData)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; name: string } | null>(null)

  const handleCancelClick = (courseId: string, courseName: string) => {
    setSelectedCourse({ id: courseId, name: courseName })
    setDialogOpen(true)
  }

  const handleConfirmCancel = () => {
    if (selectedCourse) {
      const course = registeredCourses.find((c) => c.id === selectedCourse.id)
      if (course) {
        setRegisteredCourses(registeredCourses.filter((c) => c.id !== selectedCourse.id))
        setAvailableCourses([...availableCourses, course])

        toast.success("Đã hủy môn học thành công!", {
          duration: 4000,
        })
      }
    }
    setDialogOpen(false)
    setSelectedCourse(null)
  }

  const handleRegisterClick = (courseId: string, courseName: string) => {
    const course = availableCourses.find((c) => c.id === courseId)
    if (course) {
      setAvailableCourses(availableCourses.filter((c) => c.id !== courseId))
      setRegisteredCourses([...registeredCourses, course])

      toast.success("Đăng ký môn học thành công!", {
        duration: 4000,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Khóa học</h1>
        <p className="text-gray-600 mt-1">Đăng ký và quản lý các môn học</p>
      </div>

      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("registered")}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === "registered" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Môn học đã đăng ký
          </div>
          {activeTab === "registered" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === "available" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Đăng ký môn học
          </div>
          {activeTab === "available" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
      </div>

      {activeTab === "registered" ? (
        <RegisteredCourses courses={registeredCourses} onCancelClick={handleCancelClick} />
      ) : (
        <AvailableCourses courses={availableCourses} onRegisterClick={handleRegisterClick} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn hủy môn học {selectedCourse?.name}?</DialogTitle>
            <DialogDescription>Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmCancel}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}