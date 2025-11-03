// Path: components/content/CoursesContent.tsx

"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"
// Import các tab component
import { RegisteredCourses } from "./registered/RegisteredTab"
import { AvailableCourses } from "./register/RegisterTab"
// Import thư viện thông báo và các logic kết nối
import toast from "react-hot-toast"
import { coursesApi } from "../../lib/api/coursesApi"; 
import { useAvailableCourses } from "../../lib/hooks/useAvailableCourses"
import { useRegisteredCourses } from "../../lib/hooks/useRegisteredCourses"

// LOẠI BỎ import mock data cũ (nếu có): import { registeredCoursesData,availableCoursesData } from "../../lib/constants/courseConstants"


function CoursesContent() {
  const [activeTab, setActiveTab] = useState<"registered" | "available">("registered")
  
  // 1. SỬ DỤNG HOOKS ĐỂ FETCH DỮ LIỆU THỰC TỪ BE
  const { refetch: refetchAvailable } = useAvailableCourses();

  const { 
      courses: registeredCourses, 
      loading: registeredLoading, 
      error: registeredError, 
      refetch: refetchRegistered 
  } = useRegisteredCourses();

  // 2. QUẢN LÝ DIALOG HỦY MÔN
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; name: string } | null>(null)

  // Hàm tiện ích để refresh cả 2 list sau khi có hành động
  const refreshAllData = () => {
      refetchAvailable();
      refetchRegistered();
  }

  // Xử lý khi click vào nút Hủy (Mở Dialog)
  const handleCancelClick = (courseId: string, courseName: string) => {
    setSelectedCourse({ id: courseId, name: courseName })
    setDialogOpen(true)
  }

  // 3. XỬ LÝ HỦY (GỌI API UNENROLL)
  // Helper to extract BE message from unknown error
  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return err.response?.data?.message ?? err.message ?? fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
  };

  const handleConfirmCancel = async () => {
    if (!selectedCourse) return;
    try {
        await coursesApi.cancelRegistration(selectedCourse.id);
        refreshAllData();
        toast.success("Đã hủy môn học thành công!", { duration: 4000 });
    } catch (error: unknown) {
        const message = getErrorMessage(error, "Hủy môn học thất bại. Vui lòng kiểm tra kết nối.");
        toast.error(message);
    }
    setDialogOpen(false);
    setSelectedCourse(null);
  }

  // 4. XỬ LÝ ĐĂNG KÝ (GỌI API ENROLL)
  const handleRegisterClick = async (courseId: string) => { 
    try {
        await coursesApi.registerCourse(courseId);
        refreshAllData();
        toast.success("Đăng ký môn học thành công!", { duration: 4000 });
    } catch (error: unknown) {
        const message = getErrorMessage(error, "Đăng ký môn học thất bại. Vui lòng kiểm tra kết nối.");
        toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Khóa học</h1>
        <p className="text-gray-600 mt-1">Đăng ký và quản lý các môn học</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("registered")}
          className={`pb-3 px-1 font-medium transition-colors relative cursor-pointer ${
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
          className={`pb-3 px-1 font-medium transition-colors relative cursor-pointer ${
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

      {/* Tab Content */}
      {activeTab === "registered" ? (
        // Hiển thị Môn học đã đăng ký
        registeredLoading ? (
            <p className="text-center py-8">Đang tải danh sách môn học đã đăng ký...</p>
        ) : registeredError ? (
             <p className="text-red-500 text-center py-8">{registeredError}</p>
        ) : (
            // Truyền dữ liệu và trạng thái loading (để component con có thể sử dụng nếu cần)
            <RegisteredCourses 
              courses={registeredCourses || []} // Dùng [] cho an toàn để tránh lỗi reduce
              loading={registeredLoading} 
              onCancelClick={handleCancelClick} 
            />
        )
      ) : (
        // Hiển thị Môn học có sẵn để đăng ký
        // Component AvailableCourses tự fetch loading/error bên trong
        <AvailableCourses onRegisterClick={handleRegisterClick} />
      )}

      {/* Dialog Xác nhận Hủy */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn hủy môn học {selectedCourse?.name}?</DialogTitle>
            <DialogDescription>Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
              Hủy
            </Button>
            <Button onClick={handleConfirmCancel} className="cursor-pointer">Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { CoursesContent }