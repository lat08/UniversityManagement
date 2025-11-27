'use client';

import { useState, useEffect, useRef, useMemo, type ChangeEvent, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Edit2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs } from '@/app/components/ui/tabs';
import { Dropdown, DropdownSearch } from '@/app/components/ui';
import { instructorsApi } from '../../lib/api/instructorsApi';
import { InstructorDetail, FacultyOption, UpdateInstructorPayload } from '../../lib/types/types';
import { commonApi } from '@/lib/api/common';
import { toast } from 'react-hot-toast';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import { vi as viLocale, enUS } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'active', labelKey: 'filters.active' },
  { value: 'on_leave', labelKey: 'filters.onLeave' },
  { value: 'retired', labelKey: 'filters.retired' },
  { value: 'inactive', labelKey: 'filters.inactive' },
];

const DEGREE_OPTIONS = [
  { value: 'PhD', labelKey: 'filters.phd' },
  { value: 'Master', labelKey: 'filters.master' },
  { value: 'Bachelor', labelKey: 'filters.bachelor' },
  { value: 'Engineer', labelKey: 'filters.engineer' },
];

export default function EditInstructorPage() {
  const router = useRouter();
  const params = useParams();
  const instructorId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();
  const tEdit = useTranslations('admin.instructorProfile.editPage');
  const tForm = useTranslations('admin.instructorProfile.editPage.form');
  const tStatus = useTranslations('admin.instructorProfile');
  const dateLocale = useMemo(() => (locale === 'vi' ? viLocale : enUS), [locale]);

  const [instructorData, setInstructorData] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    citizenId: '',
    gender: '',
    email: '',
    phoneNumber: '',
    address: '',
    facultyId: '',
    degree: '',
    specialization: '',
    hireDate: '',
    employmentStatus: '',
    password: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showDobCalendar, setShowDobCalendar] = useState(false);
  const [dobDate, setDobDate] = useState<Date | undefined>(undefined);
  const [dobInputValue, setDobInputValue] = useState<string>('');
  const dobCalendarRef = useRef<HTMLDivElement>(null);
  const dobWrapperRef = useRef<HTMLDivElement>(null);

  const [showHireDateCalendar, setShowHireDateCalendar] = useState(false);
  const [hireDateDate, setHireDateDate] = useState<Date | undefined>(undefined);
  const [hireDateInputValue, setHireDateInputValue] = useState<string>('');
  const hireDateCalendarRef = useRef<HTMLDivElement>(null);
  const hireDateWrapperRef = useRef<HTMLDivElement>(null);

  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  const genders = useMemo(
    () => [
      { value: 'male', label: tForm('gender.options.male') },
      { value: 'female', label: tForm('gender.options.female') },
    ],
    [tForm],
  );

  const tabs = useMemo(
    () => [
      { id: 'basic', label: tEdit('tabs.basic') },
      { id: 'contact', label: tEdit('tabs.contact') },
      { id: 'work', label: tEdit('tabs.work') },
      { id: 'account', label: tEdit('tabs.account') },
    ],
    [tEdit],
  );

  const employmentStatusOptions = useMemo(
    () =>
      EMPLOYMENT_STATUS_OPTIONS.map(option => ({
        value: option.value,
        label: tStatus(option.labelKey),
      })),
    [tStatus],
  );

  const degreeOptions = useMemo(
    () =>
      DEGREE_OPTIONS.map(option => ({
        value: option.value,
        label: tStatus(option.labelKey),
      })),
    [tStatus],
  );

  useEffect(() => {
    const initializeData = async () => {
      await fetchInstructorDetail();
      await fetchFaculties();
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

  const fetchFaculties = async () => {
    try {
      const response = await commonApi.getFaculties();
      if (response.success && response.data) {
        const facultyOptions: FacultyOption[] = response.data.map(faculty => ({
          facultyId: faculty.facultyId,
          facultyName: faculty.facultyName,
        }));
        setFaculties(facultyOptions);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const fetchInstructorDetail = async () => {
    try {
      setLoading(true);
      const response = await instructorsApi.getInstructorById(instructorId);
      if (response.success) {
        const instructor = response.data;
        setInstructorData(instructor);
        setProfilePicturePreview(instructor.profilePicture);

        // Initialize DOB controls
        try {
          const parsedDob = instructor.dateOfBirth
            ? parse(instructor.dateOfBirth.split('T')[0], 'yyyy-MM-dd', new Date())
            : undefined;
          if (parsedDob && !isNaN(parsedDob.getTime())) {
            setDobDate(parsedDob);
            setDobInputValue(format(parsedDob, 'dd/MM/yyyy'));
          }
        } catch {
          // ignore invalid date
        }

        // Initialize Hire Date controls
        try {
          const parsedHireDate = instructor.hireDate
            ? parse(instructor.hireDate.split('T')[0], 'yyyy-MM-dd', new Date())
            : undefined;
          if (parsedHireDate && !isNaN(parsedHireDate.getTime())) {
            setHireDateDate(parsedHireDate);
            setHireDateInputValue(format(parsedHireDate, 'dd/MM/yyyy'));
          }
        } catch {
          // ignore invalid date
        }

        setFormData({
          fullName: instructor.fullName,
          dateOfBirth: instructor.dateOfBirth.split('T')[0],
          citizenId: instructor.citizenId || '',
          gender: instructor.gender,
          email: instructor.email,
          phoneNumber: instructor.phoneNumber || '',
          address: instructor.address || '',
          facultyId: instructor.facultyId,
          degree: instructor.degree || '',
          specialization: instructor.specialization || '',
          hireDate: instructor.hireDate.split('T')[0],
          employmentStatus: instructor.employmentStatus,
          password: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error fetching instructor detail:', error);
      toast.error(tEdit('loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (showDobCalendar) {
        const insideDob = dobWrapperRef.current?.contains(target) || dobCalendarRef.current?.contains(target);
        if (!insideDob) setShowDobCalendar(false);
      }

      if (showHireDateCalendar) {
        const insideHireDate = hireDateWrapperRef.current?.contains(target) || hireDateCalendarRef.current?.contains(target);
        if (!insideHireDate) setShowHireDateCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDobCalendar, showHireDateCalendar]);

  const handleDobInputChange = (value: string) => {
    setDobInputValue(value);
    if (value.length === 10) {
      try {
        const parsed = parse(value, 'dd/MM/yyyy', new Date());
        if (!isNaN(parsed.getTime())) {
          setDobDate(parsed);
          setFormData({ ...formData, dateOfBirth: format(parsed, 'yyyy-MM-dd') });
        }
      } catch {
        // invalid date format
      }
    }
  };

  const handleDobCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    setDobDate(date);
    setDobInputValue(format(date, 'dd/MM/yyyy'));
    setFormData({ ...formData, dateOfBirth: format(date, 'yyyy-MM-dd') });
    setShowDobCalendar(false);
  };

  const handleHireDateInputChange = (value: string) => {
    setHireDateInputValue(value);
    if (value.length === 10) {
      try {
        const parsed = parse(value, 'dd/MM/yyyy', new Date());
        if (!isNaN(parsed.getTime())) {
          setHireDateDate(parsed);
          setFormData({ ...formData, hireDate: format(parsed, 'yyyy-MM-dd') });
        }
      } catch {
        // invalid date format
      }
    }
  };

  const handleHireDateCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    setHireDateDate(date);
    setHireDateInputValue(format(date, 'dd/MM/yyyy'));
    setFormData({ ...formData, hireDate: format(date, 'yyyy-MM-dd') });
    setShowHireDateCalendar(false);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(tEdit('avatar.typeError'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(tEdit('avatar.sizeError'));
        return;
      }

      setProfilePictureFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success(tEdit('avatar.success'));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFullNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyLettersAndSpaces = value.replace(/[^a-zA-ZÀ-ỿ\s]/g, '');
    if (onlyLettersAndSpaces.length <= 40) {
      setFormData({ ...formData, fullName: onlyLettersAndSpaces });
    }
  };

  const handleCitizenIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    if (onlyNumbers.length <= 12) {
      setFormData({ ...formData, citizenId: onlyNumbers });
    }
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    if (onlyNumbers.length <= 11) {
      setFormData({ ...formData, phoneNumber: onlyNumbers });
    }
  };

  const handleAddressChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 255) {
      setFormData({ ...formData, address: value });
    }
  };

  const handleSpecializationChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setFormData({ ...formData, specialization: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.fullName.trim()) {
      toast.error(tForm('validation.fullNameRequired'));
      return;
    }

    if (formData.fullName.trim().length > 40) {
      toast.error(tForm('validation.fullNameMax'));
      return;
    }

    if (formData.citizenId && (formData.citizenId.length < 9 || formData.citizenId.length > 12)) {
      toast.error(tForm('validation.citizenId'));
      return;
    }

    if (formData.phoneNumber && (formData.phoneNumber.length < 10 || formData.phoneNumber.length > 11)) {
      toast.error(tForm('validation.phoneNumber'));
      return;
    }

    if (formData.address && formData.address.trim().length < 5) {
      toast.error(tForm('validation.address'));
      return;
    }

    if (!formData.dateOfBirth) {
      toast.error(tForm('validation.dateOfBirth'));
      return;
    }

    if (!formData.gender) {
      toast.error(tForm('validation.gender'));
      return;
    }

    if (!formData.facultyId || formData.facultyId.trim() === '') {
      toast.error(tForm('validation.faculty'));
      return;
    }

    if (!formData.employmentStatus) {
      toast.error(tForm('validation.status'));
      return;
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        toast.error(tForm('validation.passwordConfirm'));
        return;
      }
      if (formData.password.length < 6) {
        toast.error(tForm('validation.passwordLength'));
        return;
      }
    }

    try {
      setSaving(true);
      
      const payload: UpdateInstructorPayload = {
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber || '',
        citizenId: formData.citizenId || '',
        address: formData.address || '',
        facultyId: formData.facultyId,
        degree: formData.degree as 'PhD' | 'Master' | 'Bachelor' | 'Engineer' | undefined,
        specialization: formData.specialization || '',
        hireDate: formData.hireDate,
        employmentStatus: formData.employmentStatus as 'active' | 'on_leave' | 'retired' | 'inactive',
      };

      if (profilePictureFile) {
        payload.profilePicture = profilePictureFile;
      }

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password;
        payload.confirmPassword = formData.confirmPassword;
      }

      const response = await instructorsApi.updateInstructor(instructorId, payload);

      if (response.success) {
        toast.success(tEdit('toast.updateSuccess'));
        router.push(`/admin/instructor-profile/${instructorId}`);
      } else {
        toast.error(response.message || tEdit('toast.updateError'));
      }
    } catch (error: unknown) {
      const fallbackError = tEdit('toast.genericError');
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        fallbackError;
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/instructor-profile');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">{tEdit('loading')}</div>
        </div>
      </div>
    );
  }

  if (!instructorData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">{tEdit('notFound')}</div>
          <button
            onClick={handleCancel}
            className="mt-4 px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
          >
            {tEdit('buttons.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{tEdit('title')}</h1>
        <p className="text-gray-600 mt-1">{tEdit('description')}</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          items={tabs.map(tab => ({ key: tab.id, label: tab.label }))}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{tEdit('sections.basic.title')}</h2>
                  <p className="text-sm text-gray-600">{tEdit('sections.basic.subtitle')}</p>
                </div>

                <div className="flex gap-8">
                  {/* Avatar Section */}
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <div 
                        className="cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <Avatar className="w-40 h-40 border-2 border-gray-200 shadow-md">
                          <AvatarImage src={profilePicturePreview || ""} alt={instructorData.fullName} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl font-bold">
                            {instructorData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="absolute bottom-0 right-0 w-10 h-10 bg-[#0053AD] rounded-full flex items-center justify-center text-white hover:bg-[#003d82] transition-colors shadow-lg cursor-pointer"
                        title={tEdit('avatar.tooltip')}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    {/* Họ và tên */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {tForm('fullName.label')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={handleFullNameChange}
                          maxLength={40}
                          placeholder={tForm('fullName.placeholder')}
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                        />
                        <div className="absolute right-3 top-2.5 text-xs text-gray-500">
                          {formData.fullName.length}/40
                        </div>
                      </div>
                    </div>

                    {/* Ngày sinh */}
                    <div className="relative" ref={dobWrapperRef}>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {tForm('dob.label')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={dobInputValue}
                          onChange={(e) => handleDobInputChange(e.target.value)}
                          onFocus={() => setShowDobCalendar(true)}
                          placeholder={tForm('dob.placeholder')}
                          maxLength={10}
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                          onKeyDown={(e) => {
                            if (!/[0-9/]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                              e.preventDefault();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowDobCalendar(!showDobCalendar)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label={tForm('dob.ariaLabel')}
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                      </div>
                      {showDobCalendar && (
                        <div
                          ref={dobCalendarRef}
                          className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                        >
                          <DayPicker
                            mode="single"
                            selected={dobDate}
                            onSelect={handleDobCalendarSelect}
                            locale={dateLocale}
                            captionLayout="dropdown"
                            fromYear={1950}
                            toYear={new Date().getFullYear()}
                            disabled={{ after: new Date() }}
                            classNames={{
                              day_selected: 'bg-[#0053AD] text-white',
                              day_today: 'bg-[#0053AD]/20 text-[#0053AD] font-semibold',
                              day_disabled: 'text-gray-300',
                              day: 'hover:bg-gray-100 rounded',
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Giới tính */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {tForm('gender.label')}
                      </label>
                      <Dropdown
                        options={genders}
                        value={formData.gender}
                        placeholder={tForm('gender.placeholder')}
                        onChange={(value) => setFormData({ ...formData, gender: value })}
                      />
                    </div>

                    {/* CMND / CCCD */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {tForm('citizenId.label')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.citizenId}
                          onChange={handleCitizenIdChange}
                          maxLength={12}
                          placeholder={tForm('citizenId.placeholder')}
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                        />
                        <div className="absolute right-3 top-2.5 text-xs text-gray-500">
                          {formData.citizenId.length}/12
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{tForm('citizenId.hint')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info Tab */}
            {activeTab === 'contact' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{tEdit('sections.contact.title')}</h2>
                  <p className="text-sm text-gray-600">{tEdit('sections.contact.subtitle')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('email.label')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      title={tForm('email.readonlyHint')}
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('phone.label')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.phoneNumber}
                        onChange={handlePhoneNumberChange}
                        maxLength={11}
                        placeholder={tForm('phone.placeholder')}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                      />
                      <div className="absolute right-3 top-2.5 text-xs text-gray-500">
                        {formData.phoneNumber.length}/11
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{tForm('phone.hint')}</p>
                  </div>

                  {/* Địa chỉ - Full width */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('address.label')}
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={formData.address}
                        onChange={handleAddressChange}
                        maxLength={255}
                        placeholder={tForm('address.placeholder')}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent resize-none"
                      />
                      <div className="absolute right-3 bottom-2 text-xs text-gray-500">
                        {formData.address.length}/255
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{tForm('address.hint')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Work Info Tab */}
            {activeTab === 'work' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{tEdit('sections.work.title')}</h2>
                  <p className="text-sm text-gray-600">{tEdit('sections.work.subtitle')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Mã giảng viên */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('instructorCode.label')}
                    </label>
                    <input
                      type="text"
                      value={instructorData.instructorCode}
                      disabled
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      title={tForm('instructorCode.readonlyHint')}
                    />
                  </div>

                  {/* Khoa/Bộ môn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('faculty.label')} <span className="text-red-500">*</span>
                    </label>
                    <DropdownSearch
                      options={faculties.map(f => ({
                        value: f.facultyId,
                        label: f.facultyName,
                      }))}
                      value={formData.facultyId}
                      placeholder={tForm('faculty.placeholder')}
                      searchPlaceholder={tForm('faculty.searchPlaceholder')}
                      onChange={(value) => setFormData({ ...formData, facultyId: value })}
                      disabled={!faculties.length}
                    />
                  </div>

                  {/* Học vị */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('degree.label')}
                    </label>
                    <Dropdown
                      options={degreeOptions}
                      value={formData.degree}
                      placeholder={tForm('degree.placeholder')}
                      onChange={(value) => setFormData({ ...formData, degree: value })}
                    />
                  </div>

                  {/* Ngày tuyển dụng */}
                  <div className="relative" ref={hireDateWrapperRef}>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('hireDate.label')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={hireDateInputValue}
                        onChange={(e) => handleHireDateInputChange(e.target.value)}
                        onFocus={() => setShowHireDateCalendar(true)}
                        placeholder={tForm('hireDate.placeholder')}
                        maxLength={10}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                        onKeyDown={(e) => {
                          if (!/[0-9/]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                            e.preventDefault();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowHireDateCalendar(!showHireDateCalendar)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={tForm('hireDate.ariaLabel')}
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                    </div>
                    {showHireDateCalendar && (
                      <div
                        ref={hireDateCalendarRef}
                        className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                      >
                        <DayPicker
                          mode="single"
                          selected={hireDateDate}
                          onSelect={handleHireDateCalendarSelect}
                          locale={dateLocale}
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                          disabled={{ after: new Date() }}
                          classNames={{
                            day_selected: 'bg-[#0053AD] text-white',
                            day_today: 'bg-[#0053AD]/20 text-[#0053AD] font-semibold',
                            day_disabled: 'text-gray-300',
                            day: 'hover:bg-gray-100 rounded',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('status.label')} <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      options={employmentStatusOptions}
                      value={formData.employmentStatus}
                      placeholder={tForm('status.placeholder')}
                      onChange={(value) => setFormData({ ...formData, employmentStatus: value })}
                    />
                  </div>

                  {/* Chuyên môn - Full width */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('specialization.label')}
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={formData.specialization}
                        onChange={handleSpecializationChange}
                        maxLength={500}
                        placeholder={tForm('specialization.placeholder')}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent resize-none"
                      />
                      <div className="absolute right-3 bottom-2 text-xs text-gray-500">
                        {formData.specialization.length}/500
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{tForm('specialization.hint')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{tEdit('sections.account.title')}</h2>
                  <p className="text-sm text-gray-600">{tEdit('sections.account.subtitle')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Mật khẩu mới */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('password.label')}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={tForm('password.placeholder')}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">{tForm('password.hint')}</p>
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('confirmPassword.label')}
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder={tForm('confirmPassword.placeholder')}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">{tForm('confirmPassword.hint')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {tEdit('buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {saving ? tEdit('buttons.saving') : tEdit('buttons.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
