"use client"

import { useTranslations } from "next-intl"

export const GradeHeader = () => {
  const t = useTranslations('student.grades')
  return (
    <header className="space-y-2">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('title')}</h1>
      <p className="text-sm text-gray-600">{t('description')}</p>
    </header>
  )
}
