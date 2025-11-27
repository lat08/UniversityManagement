"use client"

import { useState, Suspense, lazy, memo, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Tabs } from '@/app/components/ui/tabs'
import type { TabItem } from '@/app/components/ui/tabs'
import { usePageTitle } from '@/lib/hooks/usePageTitle'
import { XCircle } from 'lucide-react'
import { useProfile } from './lib/hooks/useProfile'
import { ProfileSkeleton } from './components/ProfileSkeleton'
import type { StudentProfile } from './lib/types/types'
import { useFormatter, useTranslations } from 'next-intl'

const PasswordForm = lazy(() =>
  import('./components/PasswordForm').then((m) => ({ default: m.PasswordForm }))
)

const ProfileInfo = memo(({ profile }: { profile: StudentProfile }) => {
  const t = useTranslations('student.profile')
  const formatter = useFormatter()

  const initials = useMemo(
    () =>
      profile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2),
    [profile.fullName]
  )

  const formatDateValue = useCallback(
    (value: string | Date | null) => {
      if (!value) return t('labels.notAvailable')
      return formatter.dateTime(new Date(value), { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    [formatter, t]
  )

  const getGenderLabel = (gender?: string | null) => {
    if (!gender) return t('labels.notAvailable')
    const normalized = gender.toLowerCase()
    if (normalized === 'male' || normalized === 'female' || normalized === 'other') {
      return t(`gender.${normalized}`)
    }
    return t('gender.unknown')
  }

  const getEnrollmentStatusLabel = (status?: string | null) => {
    if (!status) return t('labels.notAvailable')
    const normalized = status.toLowerCase()
    if (
      normalized === 'active' ||
      normalized === 'suspended' ||
      normalized === 'graduated' ||
      normalized === 'withdrawn'
    ) {
      return t(`enrollmentStatus.${normalized}`)
    }
    return status
  }

  const infoFields = [
    { key: 'fullName', label: t('labels.fullName'), value: profile.fullName },
    { key: 'studentCode', label: t('labels.studentCode'), value: profile.studentCode },
    { key: 'gender', label: t('labels.gender'), value: getGenderLabel(profile.gender) },
    { key: 'dateOfBirth', label: t('labels.dateOfBirth'), value: formatDateValue(profile.dateOfBirth) },
    { key: 'email', label: t('labels.email'), value: profile.email },
    { key: 'citizenId', label: t('labels.citizenId'), value: profile.citizenId || t('labels.notAvailable') },
    { key: 'major', label: t('labels.major'), value: profile.departmentName || t('labels.notAvailable') },
    { key: 'faculty', label: t('labels.faculty'), value: profile.facultyName || t('labels.notAvailable') },
    { key: 'class', label: t('labels.class'), value: profile.className || t('labels.notAvailable') },
    { key: 'status', label: t('labels.status'), value: getEnrollmentStatusLabel(profile.enrollmentStatus) },
    { key: 'educationLevel', label: t('labels.educationLevel'), value: profile.educationLevel || t('labels.notAvailable') },
    { key: 'academicYear', label: t('labels.academicYear'), value: profile.academicYear || t('labels.notAvailable') },
  ]

  const addressValue = profile.address && profile.address.trim().length > 0 ? profile.address : t('labels.notUpdated')

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="flex-shrink-0 flex flex-col items-center lg:block w-full lg:w-auto">
          <Avatar className="w-32 h-32 border border-gray-200 shadow-md">
            <AvatarImage src={profile.profilePicture || ''} alt={profile.fullName} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">{t('role.student')}</p>
          </div>
        </div>

        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
          {infoFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <Input
                value={field.value || t('labels.notAvailable')}
                readOnly
                disabled
                className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed opacity-75"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="flex-shrink-0 hidden lg:block lg:w-32" />
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('labels.address')}</label>
          <textarea
            value={addressValue}
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

const ErrorDisplay = memo(({ error, onRetry }: { error: string; onRetry: () => Promise<void> }) => {
  const t = useTranslations('student.profile')
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4 text-center">
        <XCircle className="h-12 w-12 text-red-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('notifications.loadErrorTitle')}</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('notifications.retry')}
          </button>
        </div>
      </div>
    </div>
  )
})
ErrorDisplay.displayName = 'ErrorDisplay'

export default function ProfilePage() {
  const t = useTranslations('student.profile')
  usePageTitle(t('title'))

  const { profile, isLoading, error, handleChangePassword, refetch } = useProfile()
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info')

  const tabs = useMemo<TabItem<'info' | 'password'>[]>(
    () => [
      { key: 'info', label: t('tabs.info') },
      { key: 'password', label: t('tabs.password') },
    ],
    [t]
  )

  const handleRetry = useCallback(async () => {
    await refetch()
  }, [refetch])

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error || !profile) {
    return <ErrorDisplay error={error || t('notifications.genericError')} onRetry={handleRetry} />
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      </div>

      <div className="mb-6">
        <Tabs items={tabs} activeKey={activeTab} onChange={setActiveTab} />
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-4 lg:p-6">
          {activeTab === 'info' ? (
            <ProfileInfo profile={profile} />
          ) : (
            <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center text-gray-600">{t('passwordTab.loading')}</div>}>
              <PasswordForm onSubmit={handleChangePassword} disabled={isLoading} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
