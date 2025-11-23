'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui';

interface ImportInstructorExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportInstructorExcelModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportInstructorExcelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClose = useCallback(() => {
    if (!isImporting) {
      setSelectedFile(null);
      onClose();
    }
  }, [isImporting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isImporting) {
        handleClose();
      }
    };

    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isImporting, handleClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isImporting) {
      handleClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    // Chưa có API chính thức cho import giảng viên, nên chỉ giả lập thành công
    setIsImporting(true);
    try {
      // TODO: Gọi API import Excel khi backend sẵn sàng
      await new Promise((resolve) => setTimeout(resolve, 800));
      onSuccess?.();
      handleClose();
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nhập giảng viên từ Excel</h2>
              <p className="text-sm text-gray-600 mt-1">
                Tải file Excel chứa danh sách giảng viên mới
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isImporting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleImport} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Tải xuống file mẫu</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Sử dụng file mẫu để đảm bảo đúng định dạng trước khi nhập
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[#0053AD] border-[#0053AD] hover:bg-[#0053AD]/10"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Tải xuống file mẫu
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">Chọn file Excel *</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
              </div>
              {selectedFile && (
                <p className="text-xs text-gray-600 mt-1">Đã chọn: {selectedFile.name}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">Hướng dẫn</p>
                <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                  <li>Chỉ chấp nhận file Excel định dạng .xlsx hoặc .xls</li>
                  <li>Dữ liệu sẽ được kiểm tra trước khi import chính thức</li>
                  <li>Không thay đổi tên cột trong file mẫu để tránh lỗi</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isImporting || !selectedFile}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Đang nhập...' : 'Nhập'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

