'use client'

import { useState, Suspense, lazy, memo, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Tabs } from '@/app/components/ui/tabs'
import { usePageTitle } from '@/lib/hooks/usePageTitle'
import type { InstructorProfile, ChangePasswordPayload } from './lib/types/types'
import { useProfile } from './lib/hooks/useProfile'
import { ProfileField } from './components/ProfileField'
import { ProfileAvatar } from './components/ProfileAvatar'
import { ProfileSkeleton } from './components/ProfileSkeleton'
import { formatDate } from '@/lib/utils/format'

const ChangePasswordForm = lazy(() =>
  import('./components/ChangePasswordForm').then((m) => ({ default: m.ChangePasswordForm }))
)

interface ProfileContentProps {
  profile: InstructorProfile
  updating: boolean
  updateError: string | null
  onChangePassword: (payload: ChangePasswordPayload) => Promise<boolean>
}

const ProfileContent = memo(({ profile, updating, updateError, onChangePassword }: ProfileContentProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const genderDisplay = useMemo(() => {
    const genderMap: Record<string, string> = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    }
    return genderMap[profile.gender] || ''
  }, [profile.gender])

  return (
    <div className="space-y-4 lg:space-y-6">
      <header>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
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

      <div className="mb-6">
        <Tabs
          items={[
            { key: 'profile', label: 'Thông tin cá nhân' },
            { key: 'password', label: 'Đổi mật khẩu' },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 lg:p-8">
          {activeTab === 'profile' ? (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="flex-shrink-0 flex justify-center lg:block">
                <ProfileAvatar
                  profilePicture={profile.profilePicture}
                  fullName={profile.fullName}
                  role={profile.role}
                />
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
                  <ProfileField label="Họ và tên" value={profile.fullName} editable={false} />
                  <ProfileField label="Mã số giảng viên" value={profile.instructorCode} editable={false} />
                  <ProfileField label="Giới tính" value={genderDisplay} editable={false} />
                  <ProfileField label="Ngày sinh" value={formatDate(profile.dateOfBirth)} editable={false} />
                  <ProfileField label="Học hàm / học vị" value={profile.degree || ''} editable={false} />
                  <ProfileField label="Chức vụ" value={profile.role} editable={false} />
                  <ProfileField
                    label="Khoa / Phòng ban"
                    value={profile.departmentName || profile.facultyName || 'Chưa cập nhật'}
                    editable={false}
                  />
                  <ProfileField label="Chuyên ngành" value={profile.specialization || ''} editable={false} />
                  <ProfileField label="Email" value={profile.email} editable={false} />
                  <ProfileField label="Số điện thoại" value={profile.phoneNumber || ''} editable={false} />
                  <ProfileField
                    label="Trạng thái công tác"
                    value={profile.employmentStatus === 'active' ? 'Đang công tác' : 'Không hoạt động'}
                    editable={false}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Suspense fallback={<div className="min-h-[240px] flex items-center justify-center text-gray-600">Đang tải...</div>}>
              <div className="max-w-xl mx-auto">
                <ChangePasswordForm
                  onSubmit={async (data) => {
                    const payload: ChangePasswordPayload = {
                      currentPassword: data.currentPassword,
                      newPassword: data.newPassword,
                      confirmPassword: data.confirmPassword,
                    }
                    return await onChangePassword(payload)
                  }}
                  loading={updating}
                />
              </div>
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
})
ProfileContent.displayName = 'ProfileContent'

const ErrorDisplay = memo(({ error, onRetry }: { error: string; onRetry: () => Promise<void> }) => (
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
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  </div>
))
ErrorDisplay.displayName = 'ErrorDisplay'

export default function InstructorProfilePage() {
  usePageTitle('Hồ sơ cá nhân')

  const { profile, loading, error, refetch, updating, updateError, updateAvatar, changePassword } = useProfile()
  const handleRetry = async () => {
    await refetch()
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />
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
    <ProfileContent
      profile={profile}
      updating={updating}
      updateError={updateError}
      onChangePassword={changePassword}
    />
  )
}
