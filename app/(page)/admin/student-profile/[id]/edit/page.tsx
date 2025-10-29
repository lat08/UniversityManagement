'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown, Calendar, Upload } from 'lucide-react';
import Image from 'next/image';

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  // Mock data - sẽ fetch từ API sau
  const [formData, setFormData] = useState({
    name: 'Hạ Vũ',
    dob: '21/11/1990',
    idNumber: '272916222',
    gender: 'Nữ',
    ethnicity: 'Kinh',
    religion: 'Tôn giáo (nếu có)',
  });

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isEthnicityOpen, setIsEthnicityOpen] = useState(false);
  const [isReligionOpen, setIsReligionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const genders = ['Nam', 'Nữ', 'Khác'];
  const ethnicities = ['Kinh', 'Tày', 'Thái', 'Mường', 'Khmer', 'Hoa', 'Nùng', 'Hmông'];
  const religions = ['Không', 'Phật giáo', 'Công giáo', 'Tin lành', 'Hồi giáo', 'Cao đài', 'Hòa Hảo'];

  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'contact', label: 'Thông tin liên hệ' },
    { id: 'academic', label: 'Học vấn' },
    { id: 'account', label: 'Tài khoản' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle save logic
    console.log('Save student data:', formData);
  };

  const handleCancel = () => {
    router.push('/admin/student-profile');
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa thông tin sinh viên</h1>
        <p className="text-gray-600 mt-1">Cập nhật thông tin chi tiết của sinh viên</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="overflow-hidden">
          <div className="flex w-full border border-gray-300 rounded-lg bg-gray-100 relative">
            {/* Active tab background slider */}
            <div 
              className="absolute top-0 bottom-0 bg-[#0053AD] rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
              style={{
                width: `${100 / tabs.length}%`,
                left: `${tabs.findIndex(t => t.id === activeTab) * (100 / tabs.length)}%`,
                transform: 'translateX(0)'
              }}
            />
            
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id

              return (
                <div key={tab.id} className="flex-1 relative z-10">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full cursor-pointer px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 relative transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="relative z-100">{tab.label}</span>
                  </button>
                  
                  {/* Divider - chỉ hiển thị khi tab không được chọn và không phải tab cuối */}
                  {!isActive && index < tabs.length - 1 && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-gray-300 transition-opacity duration-300"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
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
                    <div className="w-40 h-40 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      <Image
                        src="/login-character.png"
                        alt="Avatar"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-4 w-40 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Tải ảnh lên
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    {/* Họ và tên */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                          type="text"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Giới tính */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Giới tính
                      </label>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                        onClick={() => {
                          setIsGenderOpen(!isGenderOpen);
                          setIsEthnicityOpen(false);
                          setIsReligionOpen(false);
                        }}
                      >
                        <span className="text-sm text-gray-900">{formData.gender}</span>
                        <ChevronDown className="w-4 h-4 text-gray-700" />
                      </button>
                      {isGenderOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
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

                    {/* CMND / CCCD */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        CMND / CCCD
                      </label>
                      <input
                        type="text"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                      />
                    </div>

                    {/* Dân tộc */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Dân tộc
                      </label>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                        onClick={() => {
                          setIsEthnicityOpen(!isEthnicityOpen);
                          setIsGenderOpen(false);
                          setIsReligionOpen(false);
                        }}
                      >
                        <span className="text-sm text-gray-900">{formData.ethnicity}</span>
                        <ChevronDown className="w-4 h-4 text-gray-700" />
                      </button>
                      {isEthnicityOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {ethnicities.map((ethnicity) => (
                            <button
                              key={ethnicity}
                              type="button"
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                              onClick={() => {
                                setFormData({ ...formData, ethnicity });
                                setIsEthnicityOpen(false);
                              }}
                            >
                              {ethnicity}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tôn giáo */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Tôn giáo
                      </label>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                        onClick={() => {
                          setIsReligionOpen(!isReligionOpen);
                          setIsGenderOpen(false);
                          setIsEthnicityOpen(false);
                        }}
                      >
                        <span className="text-sm text-gray-400">{formData.religion}</span>
                        <ChevronDown className="w-4 h-4 text-gray-700" />
                      </button>
                      {isReligionOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                          {religions.map((religion) => (
                            <button
                              key={religion}
                              type="button"
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                              onClick={() => {
                                setFormData({ ...formData, religion });
                                setIsReligionOpen(false);
                              }}
                            >
                              {religion}
                            </button>
                          ))}
                        </div>
                      )}
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
                      placeholder="legiakiet@siu.edu.vn"
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
                      placeholder="0901234567"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                    />
                  </div>

                  {/* Hộ khẩu - Full width */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Hộ khẩu
                    </label>
                    <textarea
                      rows={3}
                      placeholder="03 Sông Thao, Phường 2, Quận Tân Bình, Tp.HCM 03 Sông Thao Str, Ward 2, Tan Binh Dist, HCM City, 03 Sông Thao, Phường 2, Tân Bình, Thành phố Hồ Chí Minh 700000, Việt Nam"
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
                  {/* Ngành học */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Ngành học
                    </label>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                    >
                      <span className="text-sm text-gray-900">Khoa học máy tính</span>
                      <ChevronDown className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Chuyên ngành */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Chuyên ngành
                    </label>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                    >
                      <span className="text-sm text-gray-900">Kỹ thuật phần mềm</span>
                      <ChevronDown className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Khóa */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Khóa
                    </label>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                    >
                      <span className="text-sm text-gray-900">K21 (2021-2025)</span>
                      <ChevronDown className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Lớp */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Lớp
                    </label>
                    <input
                      type="text"
                      placeholder="CNTT21A"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                    />
                  </div>

                  {/* Trạng thái */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Trạng thái
                    </label>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors text-left"
                    >
                      <span className="text-sm text-gray-900">Đang học</span>
                      <ChevronDown className="w-4 h-4 text-gray-700" />
                    </button>
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
                      placeholder="Để trống nếu không đổi"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                    />
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      placeholder="Để trống nếu không đổi"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

