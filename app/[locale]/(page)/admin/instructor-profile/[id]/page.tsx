'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Mail, Phone, Calendar, School, ArrowLeft, Edit, Briefcase } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs } from '@/app/components/ui/tabs';
import { instructorsApi } from '../lib/api/instructorsApi';
import { InstructorDetail } from '../lib/types/types';
import { getEmploymentStatusDisplay } from '../lib/utils/display';

export default function InstructorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const instructorId = params.id as string;
  const t = useTranslations('admin.instructorProfile.detailPage');
  const tFilters = useTranslations('admin.instructorProfile.filters');
  const tCommon = useTranslations('common.actions');
  
  const [activeTab, setActiveTab] = useState('basic');
  const [data, setData] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await instructorsApi.getInstructorById(instructorId);
        if (res.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Error fetching instructor detail', error);
      } finally {
        setLoading(false);
      }
    };

    if (instructorId) {
      fetchData();
    }
  }, [instructorId]);

  const tabs = useMemo(
    () => [
      { key: 'basic', label: t('tabs.basic') },
      { key: 'work', label: t('tabs.work') },
    ],
    [t],
  );

  const handleBack = () => {
    router.push('/admin/instructor-profile');
  };

  const handleEdit = () => {
    router.push(`/admin/instructor-profile/${instructorId}/edit`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatGender = (gender: string) => {
    const genderMap: Record<string, string> = {
      male: t('fields.genderMale'),
      female: t('fields.genderFemale'),
    };
    return genderMap[gender] || gender;
  };

  const statusDisplay = data ? getEmploymentStatusDisplay(data.employmentStatus, tFilters) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t('notFound')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 text-sm text-[#0053AD] bg-blue-50 border border-[#0053AD] rounded-lg hover:bg-blue-100 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {tCommon('back')}
        </button>
      </div>

      {/* Instructor Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <Avatar className="w-32 h-32 border border-gray-200 shadow-md">
                <AvatarImage src={data.profilePicture || ''} alt={data.fullName} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                  {data.fullName
                    .split(' ')
                    .map((x) => x[0])
                    .join('')
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {statusDisplay && (
                <span className={`mt-4 w-32 text-center px-3 py-1.5 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
                  {statusDisplay.label}
                </span>
              )}
            </div>

            {/* Instructor Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#D32F2F] mb-2">{data.fullName}</h2>
                  <p className="text-sm text-gray-600 mb-1">
                    {t('fields.instructorCode')}: {data.instructorCode}
                  </p>
                </div>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {tCommon('edit')}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('fields.email')}</p>
                    <p className="text-sm text-gray-900 truncate">{data.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('fields.phoneNumber')}</p>
                    <p className="text-sm text-gray-900">{data.phoneNumber || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('fields.dateOfBirth')}</p>
                    <p className="text-sm text-gray-900">{formatDate(data.dateOfBirth)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <School className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('fields.faculty')}</p>
                    <p className="text-sm text-gray-900">{data.facultyName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('fields.degree')}</p>
                    <p className="text-sm text-gray-900">{data.degree || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('fields.address')}</p>
                    <p className="text-sm text-gray-900 truncate">{data.address || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <Tabs
            items={tabs}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sections.personalInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.fullName')}
                    </label>
                    <p className="text-base text-gray-900">{data.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.instructorCode')}
                    </label>
                    <p className="text-base text-gray-900">{data.instructorCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.gender')}
                    </label>
                    <p className="text-base text-gray-900">{formatGender(data.gender)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.dateOfBirth')}
                    </label>
                    <p className="text-base text-gray-900">{formatDate(data.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.email')}
                    </label>
                    <p className="text-base text-gray-900">{data.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.phoneNumber')}
                    </label>
                    <p className="text-base text-gray-900">{data.phoneNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.citizenId')}
                    </label>
                    <p className="text-base text-gray-900">{data.citizenId || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.address')}
                    </label>
                    <p className="text-base text-gray-900">{data.address || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'work' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sections.workInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.faculty')}
                    </label>
                    <p className="text-base text-gray-900">{data.facultyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.degree')}
                    </label>
                    <p className="text-base text-gray-900">{data.degree || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.specialization')}
                    </label>
                    <p className="text-base text-gray-900">{data.specialization || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.hireDate')}
                    </label>
                    <p className="text-base text-gray-900">{formatDate(data.hireDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.employmentStatus')}
                    </label>
                    {statusDisplay && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                        {statusDisplay.label}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {t('fields.currentClassCount')}
                    </label>
                    <p className="text-base text-gray-900">{data.currentClassCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
