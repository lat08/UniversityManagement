'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, Calendar } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    mssv: '',
    name: '',
    idNumber: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    major: '',
    specialization: '',
    class: '',
    address: '',
  });

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isMajorOpen, setIsMajorOpen] = useState(false);
  const [isSpecializationOpen, setIsSpecializationOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (!target.closest('[data-dropdown]')) {
        setIsGenderOpen(false);
        setIsMajorOpen(false);
        setIsSpecializationOpen(false);
        setIsClassOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const genders = ['Nam', 'Nữ', 'Khác'];
  const majors = [
    'Tâm lý học',
    'Khoa học máy tính',
    'Quản trị kinh doanh',
    'Dược phương học',
    'Marketing',
    'Logistics',
    'Thương mại điện tử',
    'Quan hệ công chúng',
  ];
  const specializations = [
    'Kỹ thuật phần mềm',
    'Trí tuệ nhân tạo',
    'An ninh mạng',
    'Khoa học dữ liệu',
  ];
  const classes = ['K16', 'K17', 'K18'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form data:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-6">
            {/* MSSV */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                MSSV
              </label>
              <input
                type="text"
                placeholder="VD: SV001"
                value={formData.mssv}
                onChange={(e) => setFormData({ ...formData, mssv: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
              />
            </div>

            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
              />
            </div>

            {/* CMND / CCCD */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                CMND / CCCD
              </label>
              <input
                type="text"
                placeholder="012345678900"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
              />
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngày sinh
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Giới tính */}
            <div className="relative" data-dropdown="gender">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Giới tính
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                onClick={() => {
                  setIsGenderOpen(!isGenderOpen);
                  setIsMajorOpen(false);
                  setIsSpecializationOpen(false);
                  setIsClassOpen(false);
                }}
              >
                <span className={`text-sm ${formData.gender ? 'text-gray-900' : 'text-gray-400'}`}>
                  {formData.gender || 'Chọn giới tính'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              {isGenderOpen && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  {genders.map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setFormData({ ...formData, gender });
                        setIsGenderOpen(false);
                      }}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="example@siu.edu.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="0000000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
              />
            </div>

            {/* Ngành học */}
            <div className="relative" data-dropdown="major">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngành học
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                onClick={() => {
                  setIsMajorOpen(!isMajorOpen);
                  setIsGenderOpen(false);
                  setIsSpecializationOpen(false);
                  setIsClassOpen(false);
                }}
              >
                <span className={`text-sm ${formData.major ? 'text-gray-900' : 'text-gray-400'}`}>
                  {formData.major || 'Chọn ngành'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              {isMajorOpen && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {majors.map((major) => (
                    <button
                      key={major}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setFormData({ ...formData, major });
                        setIsMajorOpen(false);
                      }}
                    >
                      {major}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chuyên ngành */}
            <div className="relative" data-dropdown="specialization">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Chuyên ngành
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                onClick={() => {
                  setIsSpecializationOpen(!isSpecializationOpen);
                  setIsGenderOpen(false);
                  setIsMajorOpen(false);
                  setIsClassOpen(false);
                }}
              >
                <span className={`text-sm ${formData.specialization ? 'text-gray-900' : 'text-gray-400'}`}>
                  {formData.specialization || 'Chọn chuyên ngành'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              {isSpecializationOpen && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  {specializations.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setFormData({ ...formData, specialization: spec });
                        setIsSpecializationOpen(false);
                      }}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Khóa */}
            <div className="relative" data-dropdown="class">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Khóa
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                onClick={() => {
                  setIsClassOpen(!isClassOpen);
                  setIsGenderOpen(false);
                  setIsMajorOpen(false);
                  setIsSpecializationOpen(false);
                }}
              >
                <span className={`text-sm ${formData.class ? 'text-gray-900' : 'text-gray-400'}`}>
                  {formData.class || 'Chọn khóa'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              {isClassOpen && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  {classes.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setFormData({ ...formData, class: cls });
                        setIsClassOpen(false);
                      }}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Địa chỉ - Full width */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

