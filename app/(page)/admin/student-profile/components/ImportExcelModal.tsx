'use client';

import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { Upload, Download, CheckCircle2, XCircle, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui';
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

  const handleClose = useCallback(() => {
    if (!isImporting && validationStatus !== 'validating') {
      setSelectedFile(null);
      setValidationStatus('idle');
      setValidationMessage('');
      onClose();
    }
  }, [isImporting, validationStatus, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isImporting && validationStatus !== 'validating') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isImporting, validationStatus, handleClose]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: FormEvent) => {
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
        handleClose();
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
      const { downloadFile } = await import('@/lib/utils/fileDownload');
      await downloadFile(URL.createObjectURL(blob), `student_template_${Date.now()}.xlsx`);
      toast.success('Tải xuống template thành công');
    } catch (error: unknown) {
      console.error('Download template error:', error);
      toast.error('Tải xuống template thất bại');
    } finally {
      setIsDownloading(false);
    }
  };


  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isImporting && validationStatus !== 'validating') {
      handleClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nhập sinh viên từ Excel</h2>
              <p className="text-sm text-gray-600 mt-1">Tải file Excel chứa danh sách sinh viên mới</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isImporting || validationStatus === 'validating'}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Download Template Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Tải file mẫu</h3>
                  <p className="text-xs text-gray-600 mb-3">Tải xuống file mẫu để xem định dạng đúng và điền thông tin</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    disabled={isDownloading}
                    className="text-[#0053AD] border-[#0053AD] hover:bg-[#0053AD] hover:text-white transition-colors"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? 'Đang tải...' : 'Tải file mẫu'}
                  </Button>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Chọn file Excel <span className="text-red-500">*</span>
              </label>
              
              <div className="relative">
                <div className="border-2 border-dashed rounded-lg p-6 transition-colors hover:border-[#0053AD]/50"
                  style={{ 
                    borderColor: validationStatus === 'valid' ? '#10b981' : 
                                 validationStatus === 'invalid' ? '#ef4444' : 
                                 validationStatus === 'validating' ? '#eab308' : undefined 
                  }}>
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <FileText className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="text-center">
                      <label htmlFor="excel-file" className="cursor-pointer">
                        <span className="text-sm font-medium text-[#0053AD] hover:text-[#003d82]">
                          Chọn file hoặc kéo thả vào đây
                        </span>
                        <input
                          id="excel-file"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                          disabled={validationStatus === 'validating' || isImporting}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận file .xlsx hoặc .xls</p>
                    </div>
                  </div>
                </div>
                
                {/* File Info & Validation Status */}
                {selectedFile && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      
                      {validationStatus !== 'idle' && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {validationStatus === 'validating' && (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
                              <span className="text-sm text-yellow-600 font-medium whitespace-nowrap">Đang kiểm tra...</span>
                            </>
                          )}
                          {validationStatus === 'valid' && (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-green-600 font-medium whitespace-nowrap">{validationMessage || 'File hợp lệ'}</span>
                            </>
                          )}
                          {validationStatus === 'invalid' && (
                            <>
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                              <span className="text-sm text-red-600 font-medium whitespace-nowrap">{validationMessage || 'File không hợp lệ'}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Lưu ý quan trọng</p>
                  <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                    <li>File sẽ được kiểm tra tự động khi tải lên</li>
                    <li>Chỉ có thể import khi file hợp lệ (hiển thị màu xanh)</li>
                    <li>Đảm bảo file tuân theo định dạng của file mẫu</li>
                    <li>File không được vượt quá 10MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isImporting || validationStatus === 'validating'}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isImporting || validationStatus !== 'valid'}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Đang nhập...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Nhập file
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

