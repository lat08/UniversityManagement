'use client';

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, User, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { Tabs } from '@/app/components/ui/tabs';
import { Dropdown, DropdownSearch } from '@/app/components/ui';
import { studentsApi } from '../../lib/api/studentsApi';
import { StudentDetail, Faculty, Department, ClassItem, ENROLLMENT_STATUS_OPTIONS, UpdateStudentPayload } from '../../lib/types/types';
import { toast } from 'react-hot-toast';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const genders = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
  ];

  const filteredFaculties = faculties.filter(f => 
    f.facultyName.toLowerCase().includes(facultySearch.toLowerCase())
  );
  
  const filteredDepartments = departments.filter(d => {
    const matchesSearch = d.departmentName.toLowerCase().includes(departmentSearch.toLowerCase());
    const matchesFaculty = !selectedFacultyId || d.facultyId === selectedFacultyId;
    return matchesSearch && matchesFaculty;
  });
  
  const filteredClasses = classes.filter(c => 
    c.className.toLowerCase().includes(classSearch.toLowerCase())
  );

  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'contact', label: 'Thông tin liên hệ' },
    { id: 'academic', label: 'Học vấn' },
    { id: 'account', label: 'Tài khoản' },
  ];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.error('Không thể tải thông tin sinh viên');
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
        toast.error('Chỉ chấp nhận file ảnh có định dạng: .jpg, .jpeg, .png');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
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
      
      toast.success('Ảnh đã được chọn');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }

    if (!formData.dateOfBirth) {
      toast.error('Vui lòng chọn ngày sinh');
      return;
    }

    if (!formData.gender) {
      toast.error('Vui lòng chọn giới tính');
      return;
    }

    if (!formData.classId || formData.classId.trim() === '') {
      toast.error('Vui lòng chọn lớp');
      return;
    }

    if (!formData.enrollmentStatus) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự');
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
        toast.success('Cập nhật thông tin sinh viên thành công');
        router.push(`/admin/student-profile/${studentId}`);
      } else {
        toast.error(response.message || 'Cập nhật thông tin thất bại');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           'Có lỗi xảy ra khi cập nhật thông tin';
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
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Không tìm thấy thông tin sinh viên</div>
          <button
            onClick={handleCancel}
            className="mt-4 px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa thông tin sinh viên</h1>
        <p className="text-gray-600 mt-1">Cập nhật thông tin chi tiết của sinh viên</p>
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Thông tin cơ bản</h2>
                  <p className="text-sm text-gray-600">Thông tin cá nhân của sinh viên</p>
                </div>

                <div className="flex gap-8">
                  {/* Avatar Section */}
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <div 
                        className="w-40 h-40 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        {profilePicturePreview ? (
                          <Image
                            src={profilePicturePreview}
                            alt="Avatar"
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-20 h-20 text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="absolute bottom-0 right-0 w-10 h-10 bg-[#0053AD] rounded-full flex items-center justify-center text-white hover:bg-[#003d82] transition-colors shadow-lg cursor-pointer"
                        title="Tải ảnh lên"
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
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                      />
                    </div>

                    {/* Ngày sinh */}
                    <div className="relative" ref={dobWrapperRef}>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={dobInputValue}
                          onChange={(e) => handleDobInputChange(e.target.value)}
                          onFocus={() => setShowDobCalendar(true)}
                          placeholder="dd/mm/yyyy"
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
                          aria-label="Chọn ngày sinh"
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
                            locale={vi}
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
                        Giới tính
                      </label>
                      <Dropdown
                        options={genders}
                        value={formData.gender}
                        placeholder="Chọn giới tính"
                        onChange={(value) => setFormData({ ...formData, gender: value })}
                      />
                    </div>

                    {/* CMND / CCCD */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        CMND / CCCD
                      </label>
                      <input
                        type="text"
                        value={formData.citizenId}
                        onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info Tab */}
            {activeTab === 'contact' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Thông tin liên hệ</h2>
                  <p className="text-sm text-gray-600">Thông tin liên lạc của sinh viên</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      title="Email không thể chỉnh sửa"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                    />
                  </div>

                  {/* Địa chỉ - Full width */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Địa chỉ
                    </label>
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Nhập địa chỉ đầy đủ"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academic Info Tab */}
            {activeTab === 'academic' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Thông tin học vấn</h2>
                  <p className="text-sm text-gray-600">Thông tin về chương trình học và lớp học</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Mã sinh viên */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Mã sinh viên
                    </label>
                    <input
                      type="text"
                      value={studentData.studentCode}
                      disabled
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      title="Mã sinh viên không thể chỉnh sửa"
                    />
                  </div>

                  {/* Hệ đào tạo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Hệ đào tạo
                    </label>
                    <input
                      type="text"
                      value="Đại học chính quy"
                      disabled
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Ngành học */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Ngành học
                    </label>
                    <DropdownSearch
                      options={faculties.map(f => ({
                        value: f.facultyId,
                        label: f.facultyName,
                      }))}
                      value={selectedFacultyId}
                      placeholder="Chọn ngành học"
                      searchPlaceholder="Tìm kiếm ngành học..."
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
                      Chuyên ngành
                    </label>
                    <DropdownSearch
                      options={departments
                        .filter(d => !selectedFacultyId || d.facultyId === selectedFacultyId)
                        .map(d => ({
                          value: d.departmentId,
                          label: d.departmentName,
                        }))}
                      value={selectedDepartmentId}
                      placeholder="Chọn chuyên ngành"
                      searchPlaceholder="Tìm kiếm chuyên ngành..."
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
                      Lớp <span className="text-red-500">*</span>
                    </label>
                    <DropdownSearch
                      options={classes.map(c => ({
                        value: c.classId,
                        label: c.className,
                      }))}
                      value={formData.classId}
                      placeholder="Chọn lớp"
                      searchPlaceholder="Tìm kiếm lớp..."
                      onChange={(value) => setFormData({ ...formData, classId: value })}
                      disabled={!classes.length || !selectedFacultyId}
                    />
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      options={ENROLLMENT_STATUS_OPTIONS}
                      value={formData.enrollmentStatus}
                      placeholder="Chọn trạng thái"
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Tài khoản đăng nhập</h2>
                  <p className="text-sm text-gray-600">Cập nhật mật khẩu đăng nhập cho sinh viên</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Mật khẩu mới */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Để trống nếu không đổi"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Để trống nếu không đổi"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Nhập lại mật khẩu để xác nhận</p>
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
              Quay lại
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
