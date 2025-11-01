'use client';

import { useState } from 'react';
import { X, Upload, Download, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { studentsApi } from '../lib/api/studentsApi';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export default function ImportExcelModal({ isOpen, onClose, onSuccess }: ImportExcelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        return;
      }
      
      setSelectedFile(file);
      
      // Validate file immediately after selection
      await validateFile(file);
    }
  };

  const validateFile = async (file: File) => {
    setValidationStatus('validating');
    setValidationMessage('Đang kiểm tra file...');
    
    try {
      const result = await studentsApi.validateExcelFile(file);
      
      if (result.success) {
        setValidationStatus('valid');
        setValidationMessage('File đúng yêu cầu');
        toast.success('File hợp lệ, có thể import');
      } else {
        setValidationStatus('invalid');
        setValidationMessage(result.message || 'File không đúng yêu cầu');
        toast.error(result.message || 'File không đúng yêu cầu');
      }
    } catch (error: unknown) {
      setValidationStatus('invalid');
      const errorObj = error as { response?: { data?: { errors?: unknown; message?: string } } };
      const errors = errorObj?.response?.data?.errors;
      let errorMessage = errorObj?.response?.data?.message || 'File không hợp lệ';
      
      if (errors) {
        if (Array.isArray(errors)) {
          errorMessage = errors.join(', ');
        } else if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        }
      }
      
      setValidationMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || validationStatus !== 'valid') {
      toast.error('Vui lòng chọn file hợp lệ');
      return;
    }

    setIsImporting(true);
    try {
      const result = await studentsApi.importStudentsFromExcel(selectedFile);
      
      if (result.success) {
        toast.success(result.message || 'Import sinh viên thành công');
        setSelectedFile(null);
        setValidationStatus('idle');
        setValidationMessage('');
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || 'Import sinh viên thất bại');
      }
    } catch (error: unknown) {
      console.error('Import error:', error);
      const errorObj = error as { response?: { data?: { errors?: unknown; message?: string } } };
      const errors = errorObj?.response?.data?.errors;
      let errorMessage = errorObj?.response?.data?.message || 'Import sinh viên thất bại';
      
      if (errors) {
        if (Array.isArray(errors)) {
          errorMessage = errors.join(', ');
        } else if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const blob = await studentsApi.downloadExcelTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_template_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Tải xuống template thành công');
    } catch (error: unknown) {
      console.error('Download template error:', error);
      toast.error('Tải xuống template thất bại');
    } finally {
      setIsDownloading(false);
    }
  };

  const getInputBorderColor = () => {
    switch (validationStatus) {
      case 'valid':
        return 'border-green-500 focus:ring-green-500';
      case 'invalid':
        return 'border-red-500 focus:ring-red-500';
      case 'validating':
        return 'border-yellow-500 focus:ring-yellow-500';
      default:
        return 'border-gray-300 focus:ring-[#0053AD]';
    }
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
          {/* Download Template Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0053AD] bg-blue-50 border border-[#0053AD] rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Đang tải...' : 'Tải xuống file mẫu'}
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-900 mb-3">
              Chọn file Excel <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={validationStatus === 'validating'}
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${getInputBorderColor()}`}
              />
              
              {/* File Info & Validation Status */}
              {selectedFile && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Đã chọn: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                  
                  {validationStatus !== 'idle' && (
                    <div className="flex items-center gap-2">
                      {validationStatus === 'validating' && (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
                          <span className="text-sm text-yellow-600 font-medium">{validationMessage}</span>
                        </>
                      )}
                      {validationStatus === 'valid' && (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-green-600 font-medium">{validationMessage}</span>
                        </>
                      )}
                      {validationStatus === 'invalid' && (
                        <>
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-red-600 font-medium">{validationMessage}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-700 font-medium mb-1">Hướng dẫn:</p>
                <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
                  <li>Tải xuống file mẫu để xem định dạng đúng</li>
                  <li>File sẽ được kiểm tra tự động khi tải lên</li>
                  <li>Chỉ có thể import khi file hợp lệ (hiển thị màu xanh)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting || validationStatus === 'validating'}
              className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isImporting || validationStatus !== 'valid'}
              className="px-6 py-2.5 text-sm text-white bg-[#0053AD] rounded-lg hover:bg-[#003d82] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Đang nhập...' : 'Nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

