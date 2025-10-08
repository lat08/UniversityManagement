"use client"

import { useState } from "react"
import Image from "next/image"
import { Sidebar } from "@/app/components/ui/sidebar"
import { Header } from "@/app/components/header/header"
import { cn } from "@/lib/utils/utils"
import { Button } from "@/app/components/ui/button"

export default function ProfilePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "password">("info")

  // Dữ liệu mẫu (chỉ đọc)
  const formData = {
    fullName: "Lê Anh Kiệt Lu",
    studentId: "1111111111",
    gender: "Nam",
    birthDate: "",
    email: "legiakiet@siu.edu.vn",
    scholarship: "Có",
    major: "Khoa học máy tính",
    specialization: "Kỹ thuật phần mềm",
    address: "Thành phố Hồ Chí Minh",
    idNumber: "000000000000",
    class: "23DPM",
    status: "Đang học",
    educationLevel: "Đại học chính quy",
    academicYear: "2023-2027",
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        currentPath="/student/profile"
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          "ml-0",
          "lg:ml-16",
          !isSidebarCollapsed && "lg:ml-64",
        )}
      >
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Tiêu đề */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ cá nhân</h1>

            {/* Card chính */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Tabs */}
              <div className="flex gap-8 border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab("info")}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors relative cursor-pointer",
                    activeTab === "info"
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Thông tin cá nhân
                  {activeTab === "info" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors relative cursor-pointer",
                    activeTab === "password"
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Đổi mật khẩu
                  {activeTab === "password" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              </div>

              {/* Nội dung tab Thông tin cá nhân */}
              {activeTab === "info" && (
                <div className="flex gap-8">
                  {/* Avatar section */}
                  <div className="flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-3 relative">
                        <Image
                          src="/avatar.png"
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-base font-semibold text-gray-900">Lê Anh Kiệt Lu</p>
                      <p className="text-sm text-gray-500">Sinh viên</p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {/* Họ và tên */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Mã số sinh viên */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Mã số sinh viên
                        </label>
                        <input
                          type="text"
                          value={formData.studentId}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Giới tính */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Giới tính
                        </label>
                        <input
                          type="text"
                          value={formData.gender}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Ngày sinh */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Ngày sinh
                        </label>
                        <input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          value={formData.birthDate}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Học bổng */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Học bổng
                        </label>
                        <input
                          type="text"
                          value={formData.scholarship}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Ngành */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Ngành
                        </label>
                        <input
                          type="text"
                          value={formData.major}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Chuyên ngành */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Chuyên ngành
                        </label>
                        <input
                          type="text"
                          value={formData.specialization}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Hộ khẩu */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Hộ khẩu
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* CMND / CCCD */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          CMND / CCCD
                        </label>
                        <input
                          type="text"
                          value={formData.idNumber}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Lớp */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Lớp
                        </label>
                        <input
                          type="text"
                          value={formData.class}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Hiện diện */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Hiện diện
                        </label>
                        <input
                          type="text"
                          value={formData.status}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Bậc hệ đào tạo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Bậc hệ đào tạo
                        </label>
                        <input
                          type="text"
                          value={formData.educationLevel}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>

                      {/* Niên khóa */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Niên khóa
                        </label>
                        <input
                          type="text"
                          value={formData.academicYear}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-default text-[#718EBF]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nội dung tab Đổi mật khẩu */}
              {activeTab === "password" && (
                <div className="py-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Đặt lại mật khẩu</h2>
                  <div className="space-y-5">
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1D2A5B] focus:border-transparent"
                      />
                    </div>
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1D2A5B] focus:border-transparent"
                      />
                    </div>
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhập lại mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1D2A5B] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-6">
                    <Button className="px-8 py-2.5 bg-[#1D2A5B] text-white rounded-md text-sm font-medium hover:bg-[#2a3d6f] transition-colors">
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
