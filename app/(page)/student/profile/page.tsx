'use client'

import { useState, Suspense, lazy, memo, useMemo } from 'react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Tabs } from '@/app/components/ui/tabs'
import { usePageTitle } from '@/lib/hooks/usePageTitle'
import { XCircle } from 'lucide-react'
import { useProfile } from './lib/hooks/useProfile'
import { formatDate, formatGender, formatEnrollmentStatus } from '@/lib/utils/format'
import { ProfileSkeleton } from './components/ProfileSkeleton'
import type { StudentProfile } from './lib/types/types'

const PasswordForm = lazy(() =>
  import('./components/PasswordForm').then((m) => ({ default: m.PasswordForm }))
)

const ProfileInfo = memo(({ profile }: { profile: StudentProfile }) => {
  const initials = useMemo(
    () =>
      profile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2),
    [profile.fullName]
  )

  return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start gap-6">
              <div className="flex-shrink-0 flex flex-col items-center lg:block w-full lg:w-auto">
          <Avatar className="w-32 h-32 border border-gray-200 shadow-md">
            <AvatarImage src={profile.profilePicture || ''} alt={profile.fullName} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">Sinh viên</p>
                </div>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
            <Input value={profile.fullName} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã số sinh viên</label>
            <Input value={profile.studentCode} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <Input value={formatGender(profile.gender)} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
            <Input value={formatDate(profile.dateOfBirth)} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input value={profile.email} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CMND / CCCD</label>
            <Input value={profile.citizenId || '-'} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngành học</label>
            <Input value={profile.departmentName} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên ngành</label>
            <Input value={profile.facultyName} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lớp</label>
            <Input value={profile.className} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tình trạng</label>
            <Input
              value={formatEnrollmentStatus(profile.enrollmentStatus)}
              readOnly
              disabled
              className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bậc hệ đào tạo</label>
            <Input value={profile.educationLevel} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niên khóa</label>
            <Input value={profile.academicYear} readOnly disabled className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75" />
                  </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-6">
              <div className="flex-shrink-0 hidden lg:block lg:w-32" />
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hộ khẩu</label>
          <textarea
            value={profile.address || 'Chưa cập nhật'}
            readOnly
            disabled
            rows={3}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm resize-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 cursor-not-allowed opacity-75"
          />
            </div>
          </div>
    </div>
  )
})
ProfileInfo.displayName = 'ProfileInfo'

const ErrorDisplay = memo(({ error, onRetry }: { error: string; onRetry: () => Promise<void> }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4 text-center">
      <XCircle className="h-12 w-12 text-red-500" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải thông tin</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  </div>
))
ErrorDisplay.displayName = 'ErrorDisplay'

export default function ProfilePage() {
  usePageTitle('Hồ sơ cá nhân')
  const { profile, isLoading, error, handleChangePassword, refetch } = useProfile()
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info')

  const handleRetry = async () => {
    await refetch()
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error || !profile) {
    return <ErrorDisplay error={error || 'Đã xảy ra lỗi'} onRetry={handleRetry} />
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
          {activeTab === 'info' ? (
            <ProfileInfo profile={profile} />
          ) : (
            <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center text-gray-600">Đang tải...</div>}>
              <PasswordForm onSubmit={handleChangePassword} disabled={isLoading} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
