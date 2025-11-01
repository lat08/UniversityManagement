'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { studentsApi } from '../lib/api/studentsApi';
import { Faculty, Department, ClassItem, ENROLLMENT_STATUS_OPTIONS } from '../lib/types/types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  name: yup.string().required('Họ và tên là bắt buộc').min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  citizenId: yup.string().required('CMND/CCCD là bắt buộc').matches(/^\d{9,12}$/, 'CMND/CCCD phải có 9-12 số'),
  dob: yup.string()
    .required('Ngày sinh là bắt buộc')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Ngày sinh phải có định dạng DD/MM/YYYY')
    .test('valid-date', 'Ngày sinh không hợp lệ', (value) => {
      if (!value) return false;
      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
    }),
  gender: yup.string().required('Giới tính là bắt buộc'),
  phone: yup.string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 số'),
  facultyId: yup.string().required('Ngành học là bắt buộc'),
  departmentId: yup.string().required('Chuyên ngành là bắt buộc'),
  class: yup.string().optional(),
  address: yup.string().required('Địa chỉ là bắt buộc').min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  classId: yup.string().required('Lớp là bắt buộc'),
  enrollmentStatus: yup.string().optional(),
  profilePicturePath: yup.string().optional(),
});

type FormData = InferType<typeof validationSchema>;

export default function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, clearErrors } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      name: '',
      citizenId: '',
      dob: '',
      gender: '',
      phone: '',
      facultyId: '',
      departmentId: '',
      class: '',
      address: '',
      classId: '',
      enrollmentStatus: 'active',
      profilePicturePath: '',
    }
  });

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isEnrollmentStatusOpen, setIsEnrollmentStatusOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dobISO, setDobISO] = useState('');

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultySearch, setFacultySearch] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classSearch, setClassSearch] = useState('');

  const formValues = watch();

  useEffect(() => {
    if (isOpen) {
      fetchFaculties();
      fetchDepartments();
      fetchClasses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!formValues.facultyId) {
      setValue('departmentId', '');
    }
  }, [formValues.facultyId, setValue]);

  useEffect(() => {
    // reload classes when department changes (filter optional)
    fetchClasses(formValues.departmentId || undefined);
    // clear selected classId when department changes
    setValue('classId', '');
  }, [formValues.departmentId, setValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (!target.closest('[data-dropdown]')) {
        setIsGenderOpen(false);
        setIsFacultyOpen(false);
        setIsDepartmentOpen(false);
        setIsClassOpen(false);
        setIsEnrollmentStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFaculties = async () => {
    try {
      const response = await studentsApi.getFaculties({
        pageNumber: 1,
        pageSize: 100,
      });
      if (response.success) {
        setFaculties(response.data.items);
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

  const fetchClasses = async (departmentId?: string) => {
    try {
      const response = await studentsApi.getClasses({ departmentId });
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const genders = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
  ];

  const filteredFaculties = faculties.filter(faculty =>
    faculty.facultyName.toLowerCase().includes(facultySearch.toLowerCase())
  );

  const filteredDepartments = departments.filter(department =>
    department.departmentName.toLowerCase().includes(departmentSearch.toLowerCase()) &&
    (!formValues.facultyId || department.facultyId === formValues.facultyId)
  );

  const selectedFaculty = faculties.find(f => f.facultyId === formValues.facultyId);
  const selectedDepartment = departments.find(d => d.departmentId === formValues.departmentId);
  const selectedClass = classes.find(c => c.classId === formValues.classId);
  const selectedEnrollmentStatus = ENROLLMENT_STATUS_OPTIONS.find(s => s.value === formValues.enrollmentStatus);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const [day, month, year] = data.dob.split('/');
      const formattedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      const payload = {
        fullName: data.name,
        dateOfBirth: formattedDob,
        gender: data.gender,
        phoneNumber: data.phone,
        citizenId: data.citizenId,
        address: data.address,
        classId: data.classId,
        enrollmentStatus: data.enrollmentStatus || 'active',
        profilePicturePath: data.profilePicturePath,
      };

      const response = await studentsApi.createStudent(payload);

      if (response.success) {
        toast.success(
          `Thêm sinh viên thành công!\nMã sinh viên: ${response.data.studentCode}`,
          { duration: 4000, style: { minWidth: '300px' } }
        );
        reset();
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || 'Thêm sinh viên thất bại');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           'Đã xảy ra lỗi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col m-4">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Thêm sinh viên mới</h2>
            <p className="text-sm text-gray-600 mt-1">Nhập thông tin sinh viên</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-6">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                {...register('name')}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* CMND / CCCD */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                CMND / CCCD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="012345678900"
                {...register('citizenId')}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent ${
                  errors.citizenId ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.citizenId && <p className="mt-1 text-xs text-red-500">{errors.citizenId.message}</p>}
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dobISO}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const iso = e.target.value; // YYYY-MM-DD
                  setDobISO(iso);
                  if (iso) {
                    const [y, m, d] = iso.split('-');
                    setValue('dob', `${d}/${m}/${y}`, { shouldValidate: true });
                  } else {
                    setValue('dob', '', { shouldValidate: true });
                  }
                }}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent ${
                  errors.dob ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <input type="hidden" {...register('dob')} />
              {errors.dob && <p className="mt-1 text-xs text-red-500">{errors.dob.message}</p>}
            </div>

            {/* Giới tính */}
            <div className="relative" data-dropdown="gender">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left ${
                  errors.gender ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={() => {
                  setIsGenderOpen(!isGenderOpen);
                  setIsFacultyOpen(false);
                  setIsDepartmentOpen(false);
                  setIsClassOpen(false);
                }}
              >
                <span className={`text-sm ${formValues.gender ? 'text-gray-900' : 'text-gray-400'}`}>
                  {genders.find(g => g.value === formValues.gender)?.label || 'Chọn giới tính'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
              {isGenderOpen && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  {genders.map((gender) => (
                    <button
                      key={gender.value}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setValue('gender', gender.value);
                        clearErrors('gender');
                        setIsGenderOpen(false);
                      }}
                    >
                      {gender.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="0000000000"
                {...register('phone')}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Ngành học */}
            <div className="relative" data-dropdown="faculty">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngành học <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left ${
                  errors.facultyId ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={() => {
                  setIsFacultyOpen(!isFacultyOpen);
                  setIsGenderOpen(false);
                  setIsDepartmentOpen(false);
                  setIsClassOpen(false);
                  setFacultySearch('');
                }}
              >
                <span className={`text-sm ${formValues.facultyId ? 'text-gray-900' : 'text-gray-400'}`}>
                  {selectedFaculty?.facultyName || 'Chọn ngành'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              {errors.facultyId && <p className="mt-1 text-xs text-red-500">{errors.facultyId.message}</p>}
              {isFacultyOpen && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm ngành..."
                        value={facultySearch}
                        onChange={(e) => setFacultySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredFaculties.map((faculty) => (
                      <button
                        key={faculty.facultyId}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => {
                          setValue('facultyId', faculty.facultyId);
                          setValue('departmentId', '');
                          clearErrors('facultyId');
                          setIsFacultyOpen(false);
                          setFacultySearch('');
                        }}
                      >
                        {faculty.facultyName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chuyên ngành */}
            <div className="relative" data-dropdown="department">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Chuyên ngành <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left ${
                  errors.departmentId ? 'border-red-500' : 'border-gray-300'
                } ${!formValues.facultyId ? 'opacity-50' : ''}`}
                onClick={() => {
                  setIsDepartmentOpen(!isDepartmentOpen);
                  setIsGenderOpen(false);
                  setIsFacultyOpen(false);
                  setIsClassOpen(false);
                  setDepartmentSearch('');
                }}
                disabled={!formValues.facultyId}
              >
                <span className={`text-sm ${formValues.departmentId ? 'text-gray-900' : 'text-gray-400'} ${!formValues.facultyId ? 'opacity-50' : ''}`}>
                  {selectedDepartment?.departmentName || 'Chọn chuyên ngành'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              {errors.departmentId && <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>}
              {isDepartmentOpen && formValues.facultyId && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm chuyên ngành..."
                        value={departmentSearch}
                        onChange={(e) => setDepartmentSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((department) => (
                        <button
                          key={department.departmentId}
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => {
                            setValue('departmentId', department.departmentId);
                            clearErrors('departmentId');
                            setIsDepartmentOpen(false);
                            setDepartmentSearch('');
                          }}
                        >
                          {department.departmentName}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                        Không có chuyên ngành
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lớp (Class) */}
            <div className="relative" data-dropdown="class">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Lớp <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left ${
                  errors.classId ? 'border-red-500' : 'border-gray-300'
                } ${!formValues.departmentId ? 'opacity-50' : ''}`}
                onClick={() => {
                  if (!formValues.departmentId) return;
                  setIsClassOpen(!isClassOpen);
                  setIsGenderOpen(false);
                  setIsFacultyOpen(false);
                  setIsDepartmentOpen(false);
                  setClassSearch('');
                }}
                disabled={!formValues.departmentId}
              >
                <span className={`text-sm ${formValues.classId ? 'text-gray-900' : 'text-gray-400'} ${!formValues.departmentId ? 'opacity-50' : ''}`}>
                  {formValues.departmentId && selectedClass?.className ? selectedClass.className : 'Chọn lớp'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              {errors.classId && <p className="mt-1 text-xs text-red-500">{errors.classId.message}</p>}
              {isClassOpen && formValues.departmentId && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm lớp..."
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {classes
                      .filter(c => c.className.toLowerCase().includes(classSearch.toLowerCase()))
                      .map((cls) => (
                        <button
                          key={cls.classId}
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => {
                            setValue('classId', cls.classId);
                            clearErrors('classId');
                            setIsClassOpen(false);
                            setClassSearch('');
                          }}
                        >
                          {cls.className}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trạng thái nhập học */}
            <div className="relative" data-dropdown="enrollmentStatus">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Trạng thái
              </label>
              <button
                type="button"
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left border-gray-300`}
                onClick={() => {
                  setIsEnrollmentStatusOpen(!isEnrollmentStatusOpen);
                  setIsGenderOpen(false);
                  setIsFacultyOpen(false);
                  setIsDepartmentOpen(false);
                  setIsClassOpen(false);
                }}
              >
                <span className={`text-sm ${formValues.enrollmentStatus ? 'text-gray-900' : 'text-gray-400'}`}>
                  {selectedEnrollmentStatus?.label || 'Chọn trạng thái'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              {isEnrollmentStatusOpen && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  {ENROLLMENT_STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setValue('enrollmentStatus', status.value);
                        setIsEnrollmentStatusOpen(false);
                      }}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Địa chỉ - Full width */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập địa chỉ"
                {...register('address')}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
