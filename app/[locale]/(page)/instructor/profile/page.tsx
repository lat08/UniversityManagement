"use client"

import { useState, Suspense, lazy, memo, useMemo, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Tabs } from '@/app/components/ui/tabs'
import type { TabItem } from '@/app/components/ui/tabs'
import { usePageTitle } from '@/lib/hooks/usePageTitle'
import type { InstructorProfile, ChangePasswordPayload } from './lib/types/types'
import { useProfile } from './lib/hooks/useProfile'
import { ProfileField } from './components/ProfileField'
import { ProfileAvatar } from './components/ProfileAvatar'
import { ProfileSkeleton } from './components/ProfileSkeleton'
import { useFormatter, useTranslations } from 'next-intl'

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
  const t = useTranslations('instructor.profile')
  const formatter = useFormatter()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const tabs = useMemo<TabItem<'profile' | 'password'>[]>(
    () => [
      { key: 'profile', label: t('tabs.profile') },
      { key: 'password', label: t('tabs.password') },
    ],
    [t]
  )

  const formatDateValue = useCallback(
    (value: string | Date | null | undefined) => {
      if (!value) return t('fields.notUpdated')
      return formatter.dateTime(new Date(value), { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    [formatter, t]
  )

  const getGenderLabel = useCallback(() => {
    const normalized = profile.gender?.toLowerCase()
    if (normalized && ['male', 'female', 'other'].includes(normalized)) {
      return t(`gender.${normalized as 'male' | 'female' | 'other'}`)
    }
    return t('gender.unknown')
  }, [profile.gender, t])

  const getEmploymentStatusLabel = useCallback(() => {
    const normalized = profile.employmentStatus === 'active' ? 'active' : 'inactive'
    return t(`employmentStatus.${normalized}`)
  }, [profile.employmentStatus, t])

  const getFieldValue = useCallback(
    (value?: string | null) => (value && value.trim().length > 0 ? value : t('fields.notUpdated')),
    [t]
  )

  return (
    <div className="space-y-4 lg:space-y-6">
      <header>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('title')}</h1>
      </header>

      {updateError && activeTab === 'password' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">{t('alerts.authErrorTitle')}</h3>
              <p className="text-sm text-red-700 whitespace-pre-wrap">
                {updateError || t('alerts.authErrorDescription')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Tabs items={tabs} activeKey={activeTab} onChange={setActiveTab} />
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
                  <ProfileField label={t('fields.fullName')} value={profile.fullName} editable={false} />
                  <ProfileField label={t('fields.instructorCode')} value={profile.instructorCode} editable={false} />
                  <ProfileField label={t('fields.gender')} value={getGenderLabel()} editable={false} />
                  <ProfileField label={t('fields.dateOfBirth')} value={formatDateValue(profile.dateOfBirth)} editable={false} />
                  <ProfileField label={t('fields.degree')} value={getFieldValue(profile.degree)} editable={false} />
                  <ProfileField label={t('fields.role')} value={getFieldValue(profile.role)} editable={false} />
                  <ProfileField
                    label={t('fields.department')}
                    value={getFieldValue(profile.departmentName || profile.facultyName)}
                    editable={false}
                  />
                  <ProfileField label={t('fields.specialization')} value={getFieldValue(profile.specialization)} editable={false} />
                  <ProfileField label={t('fields.email')} value={profile.email} editable={false} />
                  <ProfileField label={t('fields.phoneNumber')} value={getFieldValue(profile.phoneNumber)} editable={false} />
                  <ProfileField
                    label={t('fields.employmentStatus')}
                    value={getEmploymentStatusLabel()}
                    editable={false}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="min-h-[240px] flex items-center justify-center text-gray-600">
                  {t('passwordTab.loading')}
                </div>
              }
            >
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

const ErrorDisplay = memo(({ error, onRetry }: { error: string; onRetry: () => Promise<void> }) => {
  const t = useTranslations('instructor.profile')
  return (
    <div className="space-y-4 lg:space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('title')}</h1>
      </header>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">{t('errors.loadFailed')}</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              {t('errors.retry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
ErrorDisplay.displayName = 'ErrorDisplay'

export default function InstructorProfilePage() {
  const t = useTranslations('instructor.profile')
  usePageTitle(t('title'))

  const { profile, loading, error, refetch, updating, updateError, changePassword } = useProfile()
  const handleRetry = useCallback(async () => {
    await refetch()
  }, [refetch])

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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('title')}</h1>
        </header>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 lg:p-6 text-center">
          <p className="text-gray-600">{t('emptyState')}</p>
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
