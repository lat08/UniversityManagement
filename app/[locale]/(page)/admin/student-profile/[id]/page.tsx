'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Mail, Phone, Calendar, School, ArrowLeft, Edit } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs } from '@/app/components/ui/tabs';
import { Table, Dropdown } from '@/app/components/ui';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils/format';
import { getPaymentStatusDisplay } from '@/lib/utils/statusDisplay';
import { studentsApi } from '../lib/api/studentsApi';
import { getStatusDisplay } from '../lib/types/types';
import { useStudentDetail } from '../lib/hooks/useStudentDetail';
import { useSemesters } from '../lib/hooks/useSemesters';
import { useTuitionFees } from '../lib/hooks/useTuitionFees';
import { useInsurances } from '../lib/hooks/useInsurances';
import { useCumulativeGrades } from '../lib/hooks/useCumulativeGrades';
import { DetailPageSkeleton } from '../components/LoadingSkeleton';
import { GradeDetailModal } from '../components/GradeDetailModal';
import { Grade, GradeItem } from '../lib/types/types';
import { AdminGradeSemesterTable } from '../components/AdminGradeSemesterTable';
import { AdminGradeDetailModal } from '../components/AdminGradeDetailModal';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const tDetail = useTranslations('admin.studentProfile.detail');
  const tStatus = useTranslations('admin.studentProfile');
  const tStudentForm = useTranslations('admin.modals.addStudent');
  const tCommon = useTranslations('common.actions');
  const tTuition = useTranslations('admin.studentProfile.tuition');
  const tInsurance = useTranslations('admin.studentProfile.insurance');
  const tGradeStats = useTranslations('admin.studentProfile.gradeStats');
  
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTuitionSemester, setSelectedTuitionSemester] = useState<string>('');
  const [selectedInsuranceSemester, setSelectedInsuranceSemester] = useState<string>('');
  const [exportingTuition, setExportingTuition] = useState(false);
  const [exportingInsurance, setExportingInsurance] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedGradeItem, setSelectedGradeItem] = useState<GradeItem | null>(null);
  const [isGradeDetailModalOpen, setIsGradeDetailModalOpen] = useState(false);
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const semesterRef = useRef<HTMLDivElement>(null);

  // Custom hooks for data fetching
  const { studentData, loading: loadingStudent } = useStudentDetail(studentId);
  const { semesters, getCurrentSemester } = useSemesters();
  const { tuitionFees, loading: loadingTuition, fetchTuitionFees } = useTuitionFees(studentId);
  const { insurances, loading: loadingInsurance, fetchInsurances } = useInsurances(studentId);
  const { cumulativeData, loading: loadingCumulative, error: cumulativeError } = useCumulativeGrades(studentId);

  // Initialize semester selection when semesters are loaded
  useEffect(() => {
    if (semesters.length > 0 && !selectedTuitionSemester) {
      const currentSemester = getCurrentSemester();
      const defaultSemester = currentSemester ? currentSemester.semesterId : semesters[0].semesterId;
      setSelectedTuitionSemester(defaultSemester);
      setSelectedInsuranceSemester(defaultSemester);
    }
  }, [semesters, selectedTuitionSemester, getCurrentSemester]);

  // Lazy load tuition fees only when tuition tab is active
  useEffect(() => {
    if (activeTab === 'tuition' && selectedTuitionSemester) {
      fetchTuitionFees(selectedTuitionSemester);
    }
  }, [selectedTuitionSemester, activeTab, fetchTuitionFees]);

  // Lazy load insurances only when tuition tab is active
  useEffect(() => {
    if (activeTab === 'tuition' && selectedInsuranceSemester) {
      fetchInsurances(selectedInsuranceSemester);
    }
  }, [selectedInsuranceSemester, activeTab, fetchInsurances]);

  // Initialize selected semesters when cumulative data is loaded
  useEffect(() => {
    if (cumulativeData && cumulativeData.semesters.length > 0 && selectedSemesters.length === 0) {
      setSelectedSemesters(cumulativeData.semesters.map(s => s.semesterId));
    }
  }, [cumulativeData, selectedSemesters.length]);

  // Handle click outside to close semester dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isSemesterOpen && semesterRef.current && !semesterRef.current.contains(target)) {
        setIsSemesterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSemesterOpen]);

  const tabs = useMemo(
    () => [
      { id: 'basic', label: tDetail('tabs.basic') },
      { id: 'academic', label: tDetail('tabs.academic') },
      { id: 'tuition', label: tDetail('tabs.tuition') },
    ],
    [tDetail],
  );

  const handleBack = () => {
    router.push('/admin/student-profile');
    router.refresh(); // Refresh to ensure list is up to date
  };

  // Format helpers - memoized
  const formatDate = useMemo(() => (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const formatGender = useMemo(() => {
    const genderMap: Record<string, string> = {
      male: tStudentForm('genderMale'),
      female: tStudentForm('genderFemale'),
      other: tDetail('fields.genderOther'),
    };
    return (gender: string) => genderMap[gender] || gender;
  }, [tStudentForm, tDetail]);

  const formatCurrency = useMemo(() => (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '0';
    return formatCurrencyUtil(amount);
  }, []);

  // Export handlers
  const handleExportTuition = async () => {
    try {
      setExportingTuition(true);
      const blob = await studentsApi.exportTuitionFees({
        studentId,
        semesterId: selectedTuitionSemester,
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const semester = semesters.find(s => s.semesterId === selectedTuitionSemester);
      const fileName = `HocPhi_${studentData?.studentCode}_${semester?.semesterCode || 'All'}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting tuition fees:', error);
    } finally {
      setExportingTuition(false);
    }
  };

  const handleExportInsurance = async () => {
    try {
      setExportingInsurance(true);
      const blob = await studentsApi.exportInsurances({
        studentId,
        semesterId: selectedInsuranceSemester,
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const semester = semesters.find(s => s.semesterId === selectedInsuranceSemester);
      const fileName = `BaoHiem_${studentData?.studentCode}_${semester?.semesterCode || 'All'}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting insurances:', error);
    } finally {
      setExportingInsurance(false);
    }
  };

  if (loadingStudent) {
    return <DetailPageSkeleton />;
  }

  if (!studentData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">{tDetail('noStudent')}</div>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
          >
            {tCommon('back')}
          </button>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(studentData.enrollmentStatus, (key) => tStatus(key));

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{tDetail('header.title')}</h1>
        <p className="text-gray-600 mt-1">{tDetail('header.description')}</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 text-sm text-[#0053AD] bg-blue-50 border border-[#0053AD] rounded-lg hover:bg-blue-100 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {tCommon('back')}
        </button>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <Avatar className="w-32 h-32 border border-gray-200 shadow-md">
                <AvatarImage src={studentData.profilePicture || ""} alt={studentData.fullName} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                  {studentData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className={`mt-4 w-32 text-center px-3 py-1.5 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
                {statusDisplay.label}
              </span>
            </div>

            {/* Student Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#D32F2F] mb-2">{studentData.fullName}</h2>
                  <p className="text-sm text-gray-600 mb-1">
                    {tDetail('fields.studentCode', { code: studentData.studentCode })}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/admin/student-profile/${studentId}/edit`)}
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
                    <p className="text-xs text-gray-500">{tDetail('fields.email')}</p>
                    <p className="text-sm text-gray-900 truncate">{studentData.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{tStudentForm('phone')}</p>
                    <p className="text-sm text-gray-900">{studentData.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{tStudentForm('dob')}</p>
                    <p className="text-sm text-gray-900">{formatDate(studentData.dateOfBirth)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <School className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{tStudentForm('department')}</p>
                    <p className="text-sm text-gray-900">{studentData.departmentName || studentData.majorName || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <School className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{tDetail('fields.academicYear')}</p>
                    <p className="text-sm text-gray-900">{studentData.academicYear}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{tStudentForm('address')}</p>
                    <p className="text-sm text-gray-900">{studentData.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        <p className="text-sm text-gray-600 mb-2">{tGradeStats('gpa4')}</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {studentData.averageGPA === null || studentData.averageGPA === undefined 
              ? '-' 
              : studentData.averageGPA.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">/4.0</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        <p className="text-sm text-gray-600 mb-2">{tGradeStats('gpa10')}</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {studentData.cumulativeGPA10 === null || studentData.cumulativeGPA10 === undefined 
              ? '-' 
              : studentData.cumulativeGPA10.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">/10.0</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        <p className="text-sm text-gray-600 mb-2">{tGradeStats('totalCredits')}</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {studentData.creditsEarnedInCurriculum ?? studentData.earnedCredits ?? '-'}
          </p>
          <p className="text-xs text-gray-500">/{studentData.totalCreditsInCurriculum ?? studentData.totalCreditsRequired ?? '-'}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-gray-200 relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        <p className="text-sm text-gray-600 mb-2">{tDetail('stats.debt')}</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {formatCurrency(studentData.unpaidAmount && studentData.unpaidAmount > 0 ? studentData.unpaidAmount : 0)}
          </p>
          <p className="text-xs text-gray-500">
            {studentData.unpaidAmount && studentData.unpaidAmount > 0 ? tDetail('stats.debtOutstanding') : tDetail('stats.debtCleared')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          items={tabs.map(tab => ({ key: tab.id, label: tab.label }))}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                {/* Thông tin cơ bản */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">{tDetail('sections.basic.title')}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">{tStudentForm('name')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{tStudentForm('dob')}</p>
                      <p className="text-sm text-gray-900 font-medium">{formatDate(studentData.dateOfBirth)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{tStudentForm('gender')}</p>
                      <p className="text-sm text-gray-900 font-medium">{formatGender(studentData.gender)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{tDetail('fields.citizenId')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.citizenId}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">{tDetail('sections.contact.title')}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">{tDetail('fields.email')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{tStudentForm('phone')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{tStudentForm('address')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">{tDetail('sections.academic.title')}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">{tDetail('fields.faculty')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.facultyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{tStudentForm('department')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.departmentName || studentData.majorName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{tDetail('fields.academicYear')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.academicYear}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{tDetail('fields.className')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.className}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{tDetail('fields.educationLevel')}</p>
                      <p className="text-sm text-gray-900 font-medium">{studentData.educationLevel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academic Results Tab */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            {loadingCumulative ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0053AD]"></div>
              </div>
            ) : cumulativeError ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center text-red-600">{cumulativeError}</div>
              </div>
            ) : !cumulativeData ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-600">{tDetail('academic.noData')}</div>
              </div>
            ) : (
              <>
                {/* Semester Filter - Match Student Grades Style */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="relative w-full" ref={semesterRef}>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tDetail('academic.filterLabel')}
                    </label>
                    <button
                      type="button"
                      className="w-full sm:w-80 flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                      onClick={() => setIsSemesterOpen(!isSemesterOpen)}
                    >
                      <span className="text-sm text-gray-900 truncate">
                        {selectedSemesters.length === 0 
                          ? tDetail('academic.filterEmpty') 
                          : selectedSemesters.length === 1
                            ? cumulativeData.semesters.find(s => s.semesterId === selectedSemesters[0])?.semesterName
                            : tDetail('academic.filterSelected', { count: selectedSemesters.length })
                        }
                      </span>
                      <svg className={`w-4 h-4 text-gray-700 flex-shrink-0 ml-2 transition-transform ${isSemesterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isSemesterOpen && (
                      <div className="absolute z-50 mt-2 w-full sm:w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-hidden">
                        <div className="flex gap-2 p-2 border-b border-gray-200">
                          <button
                            type="button"
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-white rounded cursor-pointer transition-colors bg-[#0053AD] hover:bg-[#003d82]"
                            onClick={() => {
                              setSelectedSemesters(cumulativeData.semesters.map(s => s.semesterId));
                            }}
                          >
                            {tDetail('academic.selectAll')}
                          </button>
                          <button
                            type="button"
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer transition-colors"
                            onClick={() => setSelectedSemesters([])}
                          >
                            {tDetail('academic.clearAll')}
                          </button>
                        </div>
                        
                        <div className="max-h-52 overflow-y-auto">
                          {cumulativeData.semesters.map((semester) => {
                            const isSelected = selectedSemesters.includes(semester.semesterId);
                            return (
                              <button
                                key={semester.semesterId}
                                type="button"
                                className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                                  isSelected
                                    ? 'bg-blue-50 text-[#0053AD] font-medium'
                                    : 'text-gray-900 hover:bg-gray-50'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSemesters(prev => {
                                    if (prev.includes(semester.semesterId)) {
                                      return prev.filter(id => id !== semester.semesterId);
                                    } else {
                                      return [...prev, semester.semesterId];
                                    }
                                  });
                                }}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected 
                                    ? 'bg-[#0053AD] border-[#0053AD]' 
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                      <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                <span>{semester.semesterName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Semester Tables */}
                <div className="space-y-6">
                  {cumulativeData.semesters
                    .filter(semester => selectedSemesters.includes(semester.semesterId))
                    .map((semester) => (
                      <AdminGradeSemesterTable
                        key={semester.semesterId}
                        semester={semester}
                        onShowDetail={(courseCode) => {
                          const grade = semester.grades.find(g => g.subjectCode === courseCode);
                          if (grade) {
                            setSelectedGradeItem(grade);
                            setIsGradeDetailModalOpen(true);
                          }
                        }}
                      />
                    ))}
                </div>

                {selectedSemesters.length === 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm">{tDetail('academic.emptyState')}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tuition Tab */}
        {activeTab === 'tuition' && (
            <div>
              {/* Tuition Fee Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{tTuition('historyTitle')}</h2>
                    <p className="text-sm text-gray-600">{tTuition('historyDescription')}</p>
                  </div>

                  {/* Semester Selector and Export */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-80">
                      <Dropdown
                        options={semesters.map(s => ({
                          value: s.semesterId,
                          label: s.yearRange ? `${s.semesterName} - ${s.yearRange}` : s.semesterName,
                        }))}
                        value={selectedTuitionSemester}
                        placeholder={tTuition('selectSemester')}
                        onChange={(value) => setSelectedTuitionSemester(value)}
                        disabled={loadingTuition || semesters.length === 0}
                      />
                    </div>
                    
                    <button 
                      onClick={handleExportTuition}
                      disabled={exportingTuition || !tuitionFees || tuitionFees.courses.length === 0}
                      className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {exportingTuition ? tTuition('exporting') : tTuition('export')}
                    </button>
                  </div>

                  {/* Tuition Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <Table
                      columns={[
                        { key: 'courseCode', label: tTuition('columns.code'), align: 'left' },
                        { key: 'courseName', label: tTuition('columns.name'), align: 'left' },
                        { key: 'credits', label: tTuition('columns.credits'), align: 'center' },
                        { key: 'courseFee', label: tTuition('columns.fee'), align: 'right' },
                        { key: 'status', label: tTuition('columns.status'), align: 'center' },
                      ]}
                      data={tuitionFees?.courses || []}
                      isLoading={loadingTuition}
                      emptyMessage={tTuition('empty')}
                      renderRow={(course) => {
                        const statusDisplay = getPaymentStatusDisplay(course.status);
                        return (
                          <>
                            <td className="px-6 py-4 text-sm text-gray-900">{course.courseCode}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{course.courseName}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{course.credits}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(course.courseFee)}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1.5 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
                                {statusDisplay.label}
                              </span>
                            </td>
                          </>
                        );
                      }}
                    />
                    {tuitionFees && tuitionFees.courses.length > 0 && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        <table className="w-full">
                          <thead className="sr-only">
                            <tr>
                              <th scope="col">{tTuition('columns.code')}</th>
                              <th scope="col">{tTuition('columns.name')}</th>
                              <th scope="col">{tTuition('columns.credits')}</th>
                              <th scope="col">{tTuition('columns.fee')}</th>
                              <th scope="col">{tTuition('columns.status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="font-semibold">
                              <td colSpan={2} className="px-6 py-4 text-sm text-gray-900 text-right">{tTuition('totals.label')}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                {tuitionFees.courses.reduce((sum, course) => sum + course.credits, 0)} {tTuition('totals.creditsUnit')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                {formatCurrency(tuitionFees.courses.reduce((sum, course) => sum + course.courseFee, 0))}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Insurance Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{tInsurance('historyTitle')}</h2>
                    <p className="text-sm text-gray-600">{tInsurance('historyDescription')}</p>
                  </div>

                  {/* Semester Selector and Export */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-80">
                      <Dropdown
                        options={semesters.map(s => ({
                          value: s.semesterId,
                          label: s.yearRange ? `${s.semesterName} - ${s.yearRange}` : s.semesterName,
                        }))}
                        value={selectedInsuranceSemester}
                        placeholder={tInsurance('selectSemester')}
                        onChange={(value) => setSelectedInsuranceSemester(value)}
                        disabled={loadingInsurance || semesters.length === 0}
                      />
                    </div>
                    
                    <button 
                      onClick={handleExportInsurance}
                      disabled={exportingInsurance || insurances.length === 0}
                      className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {exportingInsurance ? tInsurance('exporting') : tInsurance('export')}
                    </button>
                  </div>

                  {/* Insurance Table */}
                  <Table
                    columns={[
                      { key: 'academicYear', label: tInsurance('columns.year'), align: 'left' },
                      { key: 'healthInsuranceFee', label: tInsurance('columns.fee'), align: 'right' },
                      { key: 'status', label: tInsurance('columns.status'), align: 'center' },
                    ]}
                    data={insurances}
                    isLoading={loadingInsurance}
                    emptyMessage={tInsurance('empty')}
                    renderRow={(insurance) => {
                      const statusDisplay = getPaymentStatusDisplay(insurance.status);
                      return (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">{insurance.academicYear}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(insurance.healthInsuranceFee)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1.5 text-xs font-medium rounded-[5px] ${statusDisplay.color}`}>
                              {statusDisplay.label}
                            </span>
                          </td>
                        </>
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Grade Detail Modal */}
      <GradeDetailModal
        isOpen={isGradeModalOpen}
        onClose={() => {
          setIsGradeModalOpen(false);
          setSelectedGrade(null);
        }}
        grade={selectedGrade}
      />

      {/* Admin Grade Detail Modal */}
      <AdminGradeDetailModal
        isOpen={isGradeDetailModalOpen}
        onClose={() => {
          setIsGradeDetailModalOpen(false);
          setSelectedGradeItem(null);
        }}
        grade={selectedGradeItem}
      />
    </div>
  );
}

