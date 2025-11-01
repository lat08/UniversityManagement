"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { useProfile } from "./lib/hooks/useProfile"
import { ProfileField } from "./components/ProfileField"
import { ProfileAvatar } from "./components/ProfileAvatar"
import { ChangePasswordForm } from "./components/ChangePasswordForm"
import { UpdateProfilePayload, ChangePasswordPayload } from "./lib/types/types"

export default function InstructorProfilePage() {
  usePageTitle('Hồ sơ cá nhân')
  
  const { profile, loading, error, updating, updateError, refetch, updateProfile, updateAvatar, changePassword } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<UpdateProfilePayload>({})
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const handleEdit = () => {
    if (profile) {
      setEditedData({
        fullName: profile.fullName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        phoneNumber: profile.phoneNumber
      })
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData({})
  }

  const handleSave = async () => {
    const success = await updateProfile(editedData)
    if (success) {
      setIsEditing(false)
      setEditedData({})
    }
  }

  const handleAvatarChange = async (file: File) => {
    await updateAvatar(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        </header>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Không thể tải dữ liệu</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={refetch}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        </header>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 lg:p-6 text-center">
          <p className="text-gray-600">Không tìm thấy thông tin hồ sơ.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
      </header>

      {updateError && activeTab === 'password' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">Lỗi xác thực</h3>
              <p className="text-sm text-red-700 whitespace-pre-wrap">{updateError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="overflow-hidden">
        <div className="flex w-full border border-gray-200 rounded-lg bg-gray-50 relative">
          {/* Active tab background slider */}
          <div 
            className="absolute top-0 bottom-0 rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
            style={{
              width: '50%',
              left: activeTab === 'profile' ? '0%' : '50%',
              transform: 'translateX(0)',
              backgroundColor: '#0053AD'
            }}
          />
          
          <div className="flex-1 relative z-10">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full cursor-pointer px-6 py-3 text-sm font-semibold flex items-center justify-center transition-colors ${
                activeTab === 'profile'
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Thông tin cá nhân
            </button>
            
            {activeTab !== 'profile' && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-gray-200 transition-opacity duration-300"></div>
            )}
          </div>
          
          <div className="flex-1 relative z-10">
            <button 
              onClick={() => setActiveTab('password')}
              className={`w-full cursor-pointer px-6 py-3 text-sm font-semibold flex items-center justify-center transition-colors ${
                activeTab === 'password'
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Content */}
        <div className="p-8">
          {activeTab === 'profile' ? (
            <div className="flex gap-8">
              {/* Left Side - Avatar */}
              <div className="flex-shrink-0">
                <ProfileAvatar
                  profilePicture={profile.profilePicture}
                  fullName={profile.fullName}
                  role={profile.role}
                  editable={!isEditing}
                  onAvatarChange={handleAvatarChange}
                  loading={updating}
                />
              </div>
              
              {/* Right Side - Form Fields */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {/* Row 1 */}
                  <ProfileField
                    label="Họ và tên"
                    value={isEditing ? editedData.fullName || '' : profile.fullName}
                    placeholder="Hà Cửu Di"
                    editable={isEditing}
                    onChange={(value) => setEditedData({ ...editedData, fullName: value })}
                  />
                  
                  <ProfileField
                    label="Mã số giảng viên"
                    value={profile.instructorCode}
                    editable={false}
                  />

                  {/* Row 2 */}
                  <ProfileField
                    label="Giới tính"
                    value={isEditing ? editedData.gender || '' : profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : 'Khác'}
                    editable={isEditing}
                    type="select"
                    options={[
                      { value: 'male', label: 'Nam' },
                      { value: 'female', label: 'Nữ' },
                      { value: 'other', label: 'Khác' }
                    ]}
                    onChange={(value) => setEditedData({ ...editedData, gender: value as 'male' | 'female' | 'other' })}
                  />
                  
                  <ProfileField
                    label="Ngày sinh"
                    value={isEditing ? editedData.dateOfBirth || '' : profile.dateOfBirth}
                    placeholder="DD/MM/YYYY"
                    editable={isEditing}
                    type="date"
                    onChange={(value) => setEditedData({ ...editedData, dateOfBirth: value })}
                  />

                  {/* Row 3 */}
                  <ProfileField
                    label="Học hàm / học vị"
                    value={profile.degree}
                    editable={false}
                  />
                  
                  <ProfileField
                    label="Chức vụ"
                    value={profile.role}
                    editable={false}
                  />

                  {/* Row 4 */}
                  <ProfileField
                    label="Khoa / Phòng ban"
                    value={profile.departmentName || profile.facultyName || 'Chưa cập nhật'}
                    editable={false}
                  />
                  
                  <ProfileField
                    label="Chuyên ngành"
                    value={profile.specialization}
                    editable={false}
                  />

                  {/* Row 5 */}
                  <ProfileField
                    label="Email"
                    value={profile.email}
                    editable={false}
                  />
                  
                  <ProfileField
                    label="Số điện thoại"
                    value={isEditing ? editedData.phoneNumber || '' : profile.phoneNumber}
                    placeholder="0000000000"
                    editable={isEditing}
                    onChange={(value) => setEditedData({ ...editedData, phoneNumber: value })}
                  />

                  {/* Row 6 */}
                  <ProfileField
                    label="Trạng thái công tác"
                    value={profile.employmentStatus === 'active' ? 'Đang công tác' : 'Không hoạt động'}
                    editable={false}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <ChangePasswordForm 
                onSubmit={async (data) => {
                  const payload: ChangePasswordPayload = {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword
                  }
                  return await changePassword(payload)
                }}
                loading={updating}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

