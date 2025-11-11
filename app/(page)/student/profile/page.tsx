"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Tabs } from "@/app/components/ui/tabs"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { Eye, EyeOff, Loader2, XCircle, AlertCircle } from "lucide-react"
import { useProfile } from "./lib/hooks/useProfile"
import { formatDate, formatGender, formatEnrollmentStatus } from "@/lib/utils/format"
import { useAuthStore } from "@/lib/store/authStore"

export default function ProfilePage() {
  usePageTitle("Hồ sơ cá nhân")
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const { profile, isLoading, error, handleChangePassword } = useProfile()
  const [activeTab, setActiveTab] = useState<"info" | "password">("info")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    setPasswordError(null)
    setPasswordSuccess(null)
  }

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự")
      return
    }

    try {
      setIsChangingPassword(true)
      setPasswordError(null)
      setPasswordSuccess(null)

      const result = await handleChangePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      })

      if (result.success) {
        setPasswordSuccess(result.message)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        // Xóa tokens từ localStorage và logout sau 2 giây
        setTimeout(() => {
          // Xóa tokens từ localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
          // Logout và redirect về trang login
          logout()
          router.push("/login")
        }, 2000)
      } else {
        setPasswordError(result.message)
      }
    } catch {
      setPasswordError("Đã xảy ra lỗi khi đổi mật khẩu")
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải thông tin</h3>
            <p className="text-gray-600">{error || "Đã xảy ra lỗi"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h1>
      </div>

      <div className="mb-6">
        <Tabs
          items={[
            { key: 'info', label: 'Thông tin cá nhân' },
            { key: 'password', label: 'Đổi mật khẩu' },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-4 lg:p-6">
          {activeTab === "info" ? (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="flex-shrink-0 flex flex-col items-center lg:block w-full lg:w-auto">
                  <Avatar className="w-32 h-32 border border-gray-200 shadow-md">
                    <AvatarImage src={profile.profilePicture || ""} alt={profile.fullName} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                      {profile.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">Sinh viên</p>
                  </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <Input
                      value={profile.fullName}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã số sinh viên
                    </label>
                    <Input
                      value={profile.studentCode}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <Input
                      value={formatGender(profile.gender)}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <Input
                      value={formatDate(profile.dateOfBirth)}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      value={profile.email}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CMND / CCCD
                    </label>
                    <Input
                      value={profile.citizenId || "-"}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngành học
                    </label>
                    <Input
                      value={profile.departmentName}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chuyên ngành
                    </label>
                    <Input
                      value={profile.facultyName}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lớp
                    </label>
                    <Input
                      value={profile.className}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tình trạng
                    </label>
                    <Input
                      value={formatEnrollmentStatus(profile.enrollmentStatus)}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bậc hệ đào tạo
                    </label>
                    <Input
                      value={profile.educationLevel}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niên khóa
                    </label>
                    <Input
                      value={profile.academicYear}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none cursor-text"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="flex-shrink-0 hidden lg:block lg:w-32"></div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hộ khẩu
                  </label>
                  <textarea
                    value={profile.address || "Chưa cập nhật"}
                    readOnly
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm resize-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 cursor-text"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xl mx-auto">
              <div className="space-y-6">
                <div className="mb-2">
                  <h2 className="text-base font-bold">Đặt lại mật khẩu</h2>
                </div>
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{passwordSuccess}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                        placeholder="••••••••••"
                        className="pr-10"
                        disabled={isChangingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isChangingPassword}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                        placeholder="••••••••••"
                        className="pr-10"
                        disabled={isChangingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isChangingPassword}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhập lại mật khẩu mới
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                        placeholder="••••••••••"
                        className="pr-10"
                        disabled={isChangingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isChangingPassword}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSavePassword}
                    disabled={isChangingPassword}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

