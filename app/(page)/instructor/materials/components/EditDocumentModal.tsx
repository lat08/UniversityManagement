"use client"

import { useState, useRef, useEffect } from "react";
import { Upload, Trash2, Paperclip } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { Document } from "./DocumentCard";

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: EditFormData) => void;
  document: Document | null;
  courseClasses?: { id: string; name: string }[];
  documentTypes?: { id: string; name: string }[];
}

export interface EditFormData {
  subjectClass: string;
  documentType: string;
  documentName: string;
  description: string;
  file: File | null;
  existingFileName?: string;
  shouldDeleteFile?: boolean;
}

export function EditDocumentModal({
  isOpen,
  onClose,
  onSubmit,
  document,
  courseClasses = [],
  documentTypes = [],
}: EditDocumentModalProps) {
  const [formData, setFormData] = useState<EditFormData>({
    subjectClass: "",
    documentType: "",
    documentName: "",
    description: "",
    file: null,
    existingFileName: undefined,
    shouldDeleteFile: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EditFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document && isOpen) {
      setFormData({
        subjectClass: document.courseClassId || "",
        documentType: document.documentType || "",
        documentName: document.title,
        description: document.description || "",
        file: null,
        existingFileName: document.title, // Use title as filename display
        shouldDeleteFile: false,
      });
      setErrors({});
    }
  }, [document, isOpen]);

  const handleInputChange = (field: keyof EditFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file, shouldDeleteFile: false }));
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, file, shouldDeleteFile: false }));
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: undefined }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDeleteFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
      existingFileName: undefined,
      shouldDeleteFile: true,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EditFormData, string>> = {};

    if (!formData.subjectClass) {
      newErrors.subjectClass = "Vui lòng chọn môn học - lớp";
    }
    if (!formData.documentType) {
      newErrors.documentType = "Vui lòng chọn loại tài liệu";
    }
    if (!formData.documentName.trim()) {
      newErrors.documentName = "Vui lòng nhập tên tài liệu";
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
      existingFileName: undefined,
      shouldDeleteFile: false,
    });
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const hasExistingFile = formData.existingFileName && !formData.shouldDeleteFile;
  const hasNewFile = formData.file !== null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Chỉnh sửa tài liệu
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Chỉnh sửa tài liệu giảng dạy cho môn học của bạn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Môn học - lớp */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              Môn học - lớp
              <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.subjectClass}
              onValueChange={(value) => handleInputChange("subjectClass", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Chọn phương án" />
              </SelectTrigger>
              <SelectContent>
                {courseClasses.map((courseClass) => (
                  <SelectItem key={courseClass.id} value={courseClass.id}>
                    {courseClass.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select
              value={formData.documentType}
              onValueChange={(value) => handleInputChange("documentType", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onClick={handleFileClick}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to Upload
                  </p>
                  {hasNewFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.file?.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Existing File Display */}
            {hasExistingFile && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {formData.existingFileName}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteFile}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
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
              Cập nhật
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

