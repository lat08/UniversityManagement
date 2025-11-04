'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Upload, Download, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input } from '@/app/components/ui';
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isImporting && validationStatus !== 'validating' && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nhập sinh viên từ Excel</DialogTitle>
          <DialogDescription>Tải file Excel chứa danh sách sinh viên mới</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {/* Download Template Button */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className="text-[#0053AD] bg-blue-50 border-[#0053AD] hover:bg-blue-100"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Đang tải...' : 'Tải xuống file mẫu'}
            </Button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-900 mb-3">
              Chọn file Excel <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={validationStatus === 'validating'}
                className={`cursor-pointer transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 ${getInputBorderColor()}`}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isImporting || validationStatus === 'validating'}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isImporting || validationStatus !== 'valid'}
              className="bg-[#0053AD] hover:bg-[#003d82] text-white"
            >
              {isImporting ? 'Đang nhập...' : 'Nhập'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

