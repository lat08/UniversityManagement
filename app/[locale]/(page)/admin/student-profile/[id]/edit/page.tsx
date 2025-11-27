'use client';

import { useState, useEffect, useRef, useMemo, type ChangeEvent, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Edit2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs } from '@/app/components/ui/tabs';
import { Dropdown, DropdownSearch } from '@/app/components/ui';
import { studentsApi } from '../../lib/api/studentsApi';
import { StudentDetail, Faculty, Department, ClassItem, ENROLLMENT_STATUS_OPTIONS, UpdateStudentPayload } from '../../lib/types/types';
import { toast } from 'react-hot-toast';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import { vi as viLocale, enUS } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();
  const tEdit = useTranslations('admin.studentProfile.editPage');
  const tForm = useTranslations('admin.studentProfile.editPage.form');
  const tStatus = useTranslations('admin.studentProfile');
  const dateLocale = useMemo(() => (locale === 'vi' ? viLocale : enUS), [locale]);

  const [studentData, setStudentData] = useState<StudentDetail | null>(null);
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
    classId: '',
    enrollmentStatus: '',
    password: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showDobCalendar, setShowDobCalendar] = useState(false);
  const [dobDate, setDobDate] = useState<Date | undefined>(undefined);
  const [dobInputValue, setDobInputValue] = useState<string>('');
  const dobCalendarRef = useRef<HTMLDivElement>(null);
  const dobWrapperRef = useRef<HTMLDivElement>(null);

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
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
      { id: 'academic', label: tEdit('tabs.academic') },
      { id: 'account', label: tEdit('tabs.account') },
    ],
    [tEdit],
  );

  const enrollmentStatusOptions = useMemo(
    () =>
      ENROLLMENT_STATUS_OPTIONS.map(option => ({
        value: option.value,
        label: tStatus(option.labelKey),
      })),
    [tStatus],
  );

  useEffect(() => {
    const initializeData = async () => {
      // Priority 1: Fetch student detail first
      await fetchStudentDetail();
      
      // Priority 2: Fetch dropdowns in parallel (after student data is loaded)
      await Promise.all([
        fetchFaculties(),
        fetchDepartments()
      ]);
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  useEffect(() => {
    if (selectedFacultyId) {
      fetchClasses(selectedFacultyId, selectedDepartmentId || undefined);
    }
  }, [selectedFacultyId, selectedDepartmentId]);

  const fetchFaculties = async () => {
    try {
      const response = await studentsApi.getCommonFaculties();
      if (response.success) {
        setFaculties(response.data);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await studentsApi.getDepartments({
        pageNumber: 1,
        pageSize: 100,
      });
      if (response.success) {
        setDepartments(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchClasses = async (facultyId: string, departmentId?: string) => {
    try {
      const response = await studentsApi.getCommonClasses({ 
        facultyId,
        departmentId: departmentId || undefined 
      });
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const response = await studentsApi.getStudentById(studentId);
      if (response.success) {
        const student = response.data;
        setStudentData(student);
        setProfilePicturePreview(student.profilePicture);
        
        // Use facultyId and departmentId directly from API response
        const finalFacultyId = student.facultyId || '';
        const finalDepartmentId = student.departmentId || '';
        const finalClassId = student.classId || '';

        // Initialize DOB controls
        try {
          const parsedDob = student.dateOfBirth
            ? parse(student.dateOfBirth.split('T')[0], 'yyyy-MM-dd', new Date())
            : undefined;
          if (parsedDob && !isNaN(parsedDob.getTime())) {
            setDobDate(parsedDob);
            setDobInputValue(format(parsedDob, 'dd/MM/yyyy'));
          }
        } catch {
          // ignore invalid date
        }
        
        // Set faculty and department IDs
        if (finalFacultyId) {
          setSelectedFacultyId(finalFacultyId);
        }

        if (finalDepartmentId) {
          setSelectedDepartmentId(finalDepartmentId);
        }

        // Fetch classes based on faculty/department
        if (finalFacultyId) {
          const classResponse = await studentsApi.getCommonClasses({ 
            facultyId: finalFacultyId,
            departmentId: finalDepartmentId || undefined 
          });
          if (classResponse.success) {
            setClasses(classResponse.data);
          }
        }

        // Set form data with all IDs from API
        setFormData({
          fullName: student.fullName,
          dateOfBirth: student.dateOfBirth.split('T')[0],
          citizenId: student.citizenId,
          gender: student.gender,
          email: student.email,
          phoneNumber: student.phoneNumber,
          address: student.address,
          classId: finalClassId,
          enrollmentStatus: student.enrollmentStatus,
          password: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error fetching student detail:', error);
      toast.error(tEdit('loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Close DOB calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // DOB calendar: close if click outside wrapper
      if (showDobCalendar) {
        const insideDob = dobWrapperRef.current?.contains(target) || dobCalendarRef.current?.contains(target);
        if (!insideDob) setShowDobCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDobCalendar]);

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

      // Lưu File object để gửi lên backend
      setProfilePictureFile(file);
      
      // Tạo preview URL để hiển thị
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
    // Giới hạn 40 ký tự, chỉ cho nhập chữ cái và khoảng trắng
    const onlyLettersAndSpaces = value.replace(/[^a-zA-ZÀ-ỿ\s]/g, '');
    if (onlyLettersAndSpaces.length <= 40) {
      setFormData({ ...formData, fullName: onlyLettersAndSpaces });
    }
  };

  const handleCitizenIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Chỉ cho nhập số, tối đa 12 ký tự
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    if (onlyNumbers.length <= 12) {
      setFormData({ ...formData, citizenId: onlyNumbers });
    }
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Chỉ cho nhập số, tối đa 11 ký tự
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    if (onlyNumbers.length <= 11) {
      setFormData({ ...formData, phoneNumber: onlyNumbers });
    }
  };

  const handleAddressChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Giới hạn 255 ký tự
    if (value.length <= 255) {
      setFormData({ ...formData, address: value });
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

    if (!formData.classId || formData.classId.trim() === '') {
      toast.error(tForm('validation.class'));
      return;
    }

    if (!formData.enrollmentStatus) {
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
      
      const payload: UpdateStudentPayload = {
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber || '',
        citizenId: formData.citizenId || '',
        address: formData.address || '',
        classId: formData.classId,
        enrollmentStatus: formData.enrollmentStatus,
      };

      if (profilePictureFile) {
        payload.profilePicture = profilePictureFile;
      }

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password;
        payload.confirmPassword = formData.confirmPassword;
      }

      const response = await studentsApi.updateStudent(studentId, payload);

      if (response.success) {
        toast.success(tEdit('toast.updateSuccess'));
        router.push(`/admin/student-profile/${studentId}`);
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
    router.push('/admin/student-profile');
    router.refresh(); // Refresh to ensure list is up to date
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

  if (!studentData) {
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
                          <AvatarImage src={profilePicturePreview || ""} alt={studentData.fullName} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl font-bold">
                            {studentData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
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

            {/* Academic Info Tab */}
            {activeTab === 'academic' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{tEdit('sections.academic.title')}</h2>
                  <p className="text-sm text-gray-600">{tEdit('sections.academic.subtitle')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Mã sinh viên */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('studentCode.label')}
                    </label>
                    <input
                      type="text"
                      value={studentData.studentCode}
                      disabled
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      title={tForm('studentCode.readonlyHint')}
                    />
                  </div>

                  {/* Hệ đào tạo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('educationLevel.label')}
                    </label>
                    <input
                      type="text"
                      value={tForm('educationLevel.value')}
                      disabled
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Ngành học */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('faculty.label')}
                    </label>
                    <DropdownSearch
                      options={faculties.map(f => ({
                        value: f.facultyId,
                        label: f.facultyName,
                      }))}
                      value={selectedFacultyId}
                      placeholder={tForm('faculty.placeholder')}
                      searchPlaceholder={tForm('faculty.searchPlaceholder')}
                      onChange={(value) => {
                        setSelectedFacultyId(value);
                        setSelectedDepartmentId('');
                        setFormData({ ...formData, classId: '' });
                        setClasses([]);
                      }}
                      disabled={!faculties.length}
                    />
                  </div>

                  {/* Chuyên ngành */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('department.label')}
                    </label>
                    <DropdownSearch
                      options={departments
                        .filter(d => !selectedFacultyId || d.facultyId === selectedFacultyId)
                        .map(d => ({
                          value: d.departmentId,
                          label: d.departmentName,
                        }))}
                      value={selectedDepartmentId}
                      placeholder={tForm('department.placeholder')}
                      searchPlaceholder={tForm('department.searchPlaceholder')}
                      onChange={(value) => {
                        setSelectedDepartmentId(value);
                        setFormData({ ...formData, classId: '' });
                        setClasses([]);
                      }}
                      disabled={!departments.length || !selectedFacultyId}
                    />
                  </div>

                  {/* Lớp */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('class.label')} <span className="text-red-500">*</span>
                    </label>
                    <DropdownSearch
                      options={classes.map(c => ({
                        value: c.classId,
                        label: c.className,
                      }))}
                      value={formData.classId}
                      placeholder={tForm('class.placeholder')}
                      searchPlaceholder={tForm('class.searchPlaceholder')}
                      onChange={(value) => setFormData({ ...formData, classId: value })}
                      disabled={!classes.length || !selectedFacultyId}
                    />
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {tForm('status.label')} <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      options={enrollmentStatusOptions}
                      value={formData.enrollmentStatus}
                      placeholder={tForm('status.placeholder')}
                      onChange={(value) => setFormData({ ...formData, enrollmentStatus: value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Account Info Tab */}
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

                  {/* Xác nhận mật khẩu mới */}
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

          {/* Footer Buttons */}
          <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tEdit('buttons.back')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? tEdit('buttons.saving') : tEdit('buttons.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
