"use client"

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { DropdownSearch, Dropdown } from "@/app/components/ui";
import { handleFileClick, handleFileDrop, handleDragOver, handleFileInputChange } from "../lib/utils/modalHandlers";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: UploadFormData) => void;
  courseClasses?: { id: string; name: string }[];
  documentTypes?: { id: string; name: string }[];
}

export interface UploadFormData {
  subjectClass: string;
  documentType: string;
  documentName: string;
  description: string;
  file: File | null;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  onSubmit,
  courseClasses = [],
  documentTypes = [],
}: UploadDocumentModalProps) {
  const [formData, setFormData] = useState<UploadFormData>({
    subjectClass: "",
    documentType: "",
    documentName: "",
    description: "",
    file: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UploadFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof UploadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileInputChange(e, setFormData, setErrors, false);
  };

  const onFileClick = () => handleFileClick(fileInputRef);

  const onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleFileDrop(e, setFormData, setErrors, false);
  };

  const onDragOver = handleDragOver;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UploadFormData, string>> = {};

    if (!formData.subjectClass) {
      newErrors.subjectClass = "Vui lòng chọn môn học - lớp";
    }
    if (!formData.documentType) {
      newErrors.documentType = "Vui lòng chọn loại tài liệu";
    }
    if (!formData.documentName.trim()) {
      newErrors.documentName = "Vui lòng nhập tên tài liệu";
    }
    if (!formData.file) {
      newErrors.file = "Vui lòng chọn file để tải lên";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      subjectClass: "",
      documentType: "",
      documentName: "",
      description: "",
      file: null,
    });
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Tải lên tài liệu mới
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Thêm tài liệu giảng dạy cho môn học của bạn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Môn học - lớp */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              Môn học - lớp
              <span className="text-red-500">*</span>
            </label>
            <DropdownSearch
              options={courseClasses.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              value={formData.subjectClass}
              onChange={(value) => handleInputChange("subjectClass", value)}
              placeholder="Chọn phương án"
              buttonClassName="border-gray-300"
            />
            {errors.subjectClass && (
              <p className="text-sm text-red-500">{errors.subjectClass}</p>
            )}
          </div>

          {/* Loại tài liệu */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              Loại tài liệu
              <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={documentTypes.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              value={formData.documentType}
              onChange={(value) => handleInputChange("documentType", value)}
              placeholder="Chọn loại"
              buttonClassName="border-gray-300"
            />
            {errors.documentType && (
              <p className="text-sm text-red-500">{errors.documentType}</p>
            )}
          </div>

          {/* Tên tài liệu */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              Tên tài liệu
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Nhập tên tài liệu"
              value={formData.documentName}
              onChange={(e) => handleInputChange("documentName", e.target.value)}
              className="border-gray-300"
            />
            {errors.documentName && (
              <p className="text-sm text-red-500">{errors.documentName}</p>
            )}
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Mô tả
            </label>
            <textarea
              placeholder="Mô tả nội dung tài liệu..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
            />
            <div
              onClick={onFileClick}
              onDrop={onFileDrop}
              onDragOver={onDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to Upload
                  </p>
                  {formData.file && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tải lên
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

