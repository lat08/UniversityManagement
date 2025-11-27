'use client';

import { useTranslations } from 'next-intl';

interface StatsCardsProps {
  totalStudents: number;
  studentsWithGrades: number;
}

export const StatsCards = ({ totalStudents, studentsWithGrades }: StatsCardsProps) => {
  const t = useTranslations('instructor.grades.stats');
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-600 mb-1">{t('totalStudents')}</p>
        <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-600 mb-1">{t('studentsWithGrades')}</p>
        <p className="text-2xl font-bold text-blue-600">{studentsWithGrades}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-600 mb-1">{t('studentsWithoutGrades')}</p>
        <p className="text-2xl font-bold text-orange-600">
          {totalStudents - studentsWithGrades}
        </p>
      </div>
    </div>
  );
};
