'use client';

import { X, Download, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DocumentItem } from '../types/types';
import { formatFileSize, formatDate } from '../utils/documentUtils';

interface DocumentModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  uploadedByName?: string;
}

export const DocumentModal = ({ document, isOpen, onClose, uploadedByName }: DocumentModalProps) => {
  if (!document || !isOpen) return null;

  const handleDownload = () => {
    window.open(document.downloadUrl, '_blank');
  };

  const handleViewOnline = () => {
    window.open(document.previewUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{document.fileTitle}</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* I. General Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              I. Thông tin chung
            </h3>
            <div className="space-y-3">
              {/* Author */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tác giả</p>
                  <p className="font-medium text-gray-900">{uploadedByName || 'N/A'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Mô tả tài liệu</p>
                  <p className="font-medium text-gray-900">{document.description}</p>
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Tải xuống tài liệu chung PDF</span>
              </Button>

              {/* View Online Button */}
              <Button
                onClick={handleViewOnline}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 flex items-center justify-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>Xem trực tuyến</span>
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* II. Detailed Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              II. Thông tin chi tiết
            </h3>
            <div className="space-y-3">
              {/* Document details card */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{document.fileTitle}</p>
                      <p className="text-sm text-gray-600">
                        Tạo ngày: {formatDate(document.created)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatFileSize(document.fileSize)}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">{document.fileType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải xuống
                  </Button>
                  <Button
                    onClick={handleViewOnline}
                    size="sm"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem trực tuyến
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


