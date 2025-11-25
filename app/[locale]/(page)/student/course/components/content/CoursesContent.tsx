// Path: components/content/CoursesContent.tsx

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/app/components/ui/button"
import { Tabs } from "@/app/components/ui/tabs"
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
import { useRegisteredCoursesQuery } from "../../lib/hooks/useRegisteredCoursesQuery"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/queryKeys"

// LOẠI BỎ import mock data cũ (nếu có): import { registeredCoursesData,availableCoursesData } from "../../lib/constants/courseConstants"


function CoursesContent() {
  const t = useTranslations('student.course')
  const tCommon = useTranslations('common.actions')
  
  const tabs = [
    { key: 'registered', label: t('registeredTab') },
    { key: 'available', label: t('availableTab') },
  ] as const;
  const [activeTab, setActiveTab] = useState<"registered" | "available">("registered")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isBulkRegistering, setIsBulkRegistering] = useState(false)
  const [registeredPage, setRegisteredPage] = useState(1)
  const queryClient = useQueryClient()
  
  // 1. SỬ DỤNG HOOKS ĐỂ FETCH DỮ LIỆU THỰC TỪ BE
  const { 
    courses: registeredCourses, 
    paginatedCourses,
    pagination: registeredPagination,
    isLoading: registeredLoading, 
    error: registeredError, 
    refetch: refetchRegistered,
  } = useRegisteredCoursesQuery({
    pageNumber: registeredPage,
    pageSize: 10,
  });
  
  const goToRegisteredPage = (page: number) => {
    setRegisteredPage(page)
  }
  
  const refetchAvailable = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.studentCourses.available() })
  }

  // 2. QUẢN LÝ DIALOG HỦY MÔN
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; name: string } | null>(null)

  // Hàm tiện ích để refresh cả 2 list sau khi có hành động
  const refreshAllData = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.studentCourses.all })
      void refetchRegistered();
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
        toast.success(t('cancelSuccess'), { duration: 4000 });
    } catch (error: unknown) {
        const message = getErrorMessage(error, t('cancelError'));
        toast.error(message);
    }
    setDialogOpen(false);
    setSelectedCourse(null);
  }

  // 4. XỬ LÝ BULK HỦY
  const handleBulkCancel = async (courseIds: string[]) => {
    try {
      await Promise.all(courseIds.map(id => coursesApi.cancelRegistration(id)));
      refreshAllData();
      toast.success(t('cancelSuccess'), { duration: 4000 });
    } catch (error: unknown) {
      const message = getErrorMessage(error, t('cancelError'));
      toast.error(message);
    }
  }

  // 5. XỬ LÝ ĐĂNG KÝ (GỌI API ENROLL)
  const handleRegisterClick = async (courseId: string) => { 
    setIsRegistering(true)
    try {
        await coursesApi.registerCourse(courseId);
        refreshAllData();
        toast.success(t('registerSuccess'), { duration: 4000 });
    } catch (error: unknown) {
        const message = getErrorMessage(error, t('registerError'));
        toast.error(message, { duration: 5000 });
    } finally {
        setIsRegistering(false)
    }
  }

  // 6. XỬ LÝ BULK ĐĂNG KÝ (GỌI API BULK ENROLL)
  const handleBulkRegisterClick = async (courseIds: string[]) => {
    if (courseIds.length === 0) return;
    
    setIsBulkRegistering(true)
    try {
      const result = await coursesApi.registerCoursesBulk(courseIds);
      refreshAllData();
      
      // Hiển thị toast tổng hợp với thông báo lỗi chi tiết
      if (result.successCount > 0 && result.failedCount === 0) {
        toast.success(t('registerSuccess', { count: result.successCount }), { duration: 4000 });
      } else if (result.successCount > 0 && result.failedCount > 0) {
        // Hiển thị lỗi chi tiết cho từng môn thất bại
        const errorMessages = result.failedResults
          .map((err) => err.errorMessage || t('unknownError'))
          .join(', ');
        
        toast.success(
          t('registerPartialSuccess', { 
            successCount: result.successCount, 
            failedCount: result.failedCount, 
            errorMessages 
          }), 
          { duration: 6000 }
        );
      } else {
        // Tất cả đều thất bại - hiển thị tất cả lỗi
        const errorMessages = result.failedResults
          .map((err) => err.errorMessage || t('unknownError'))
          .join(', ');
        toast.error(
          t('registerFailed', { errorMessages }), 
          { duration: 6000 }
        );
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, t('registerError'));
      toast.error(message, { duration: 5000 });
    } finally {
      setIsBulkRegistering(false)
    }
  }

  const handleRegisterButtonClick = () => {
    setActiveTab("available");
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('description')}</p>
      </header>

      {/* Tabs */}
      <div>
        <Tabs
          items={tabs.map(tab => ({ key: tab.key, label: tab.label }))}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      {activeTab === "registered" ? (
        // Hiển thị Môn học đã đăng ký
        registeredLoading ? (
            <p className="text-center py-8">{tCommon('loading')}</p>
        ) : registeredError ? (
             <p className="text-red-500 text-center py-8">{registeredError}</p>
        ) : (
            // Truyền dữ liệu và trạng thái loading (để component con có thể sử dụng nếu cần)
            <RegisteredCourses 
              courses={registeredCourses || []}
              paginatedCourses={paginatedCourses}
              pagination={registeredPagination}
              loading={registeredLoading}
              onCancelClick={handleCancelClick}
              goToPage={goToRegisteredPage}
              onBulkCancel={handleBulkCancel}
              onRegisterButtonClick={handleRegisterButtonClick}
            />
        )
      ) : (
        // Hiển thị Môn học có sẵn để đăng ký
        // Component AvailableCourses tự fetch loading/error bên trong
        <AvailableCourses 
          onRegisterClick={handleRegisterClick} 
          onBulkRegisterClick={handleBulkRegisterClick}
          isRegistering={isRegistering}
          isBulkRegistering={isBulkRegistering}
        />
      )}

      {/* Dialog Xác nhận Hủy */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancelConfirm')} {selectedCourse?.name}?</DialogTitle>
            <DialogDescription>{t('cancelConfirmDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleConfirmCancel} className="cursor-pointer">{tCommon('confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { CoursesContent }