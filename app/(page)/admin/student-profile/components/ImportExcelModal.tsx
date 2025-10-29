'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportExcelModal({ isOpen, onClose }: ImportExcelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState([
    {
      mssv: 'SV100',
      name: 'Hạ Vũ',
      major: 'Khoa học máy tính',
      specialization: 'Kỹ thuật phần mềm',
    },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle file upload
    console.log('File:', selectedFile);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nhập sinh viên từ Excel</h2>
            <p className="text-sm text-gray-600 mt-1">Tải file Excel chứa danh sách sinh viên mới</p>
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
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-900 mb-3">
              Chọn file Excel
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] focus:border-transparent cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 text-center">
                  File phải có các cột: MSSV, Họ tên, Ngành, Chuyên ngành, Khóa, Email, Sđt, CCCD
                </p>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-900 mb-3">
              Xem trước dữ liệu
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0053AD] text-white text-sm">
                      <th className="px-6 py-3 text-left font-semibold">MSSV</th>
                      <th className="px-6 py-3 text-left font-semibold">Họ và tên</th>
                      <th className="px-6 py-3 text-left font-semibold">Ngành</th>
                      <th className="px-6 py-3 text-left font-semibold">Chuyên ngành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {previewData.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 text-sm text-gray-900">{student.mssv}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{student.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{student.major}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{student.specialization}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
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
              Nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

