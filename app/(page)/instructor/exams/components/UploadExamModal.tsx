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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface UploadExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: UploadExamFormData) => void;
}

export interface UploadExamFormData {
  subject: string;
  examType: string;
  duration: number;
  description: string;
  examFile: File | null;
  answerFile: File | null;
}

export function UploadExamModal({
  isOpen,
  onClose,
  onSubmit,
}: UploadExamModalProps) {
  const [formData, setFormData] = useState<UploadExamFormData>({
    subject: "",
    examType: "",
    duration: 3,
    description: "",
    examFile: null,
    answerFile: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UploadExamFormData, string>>>({});
  const examFileInputRef = useRef<HTMLInputElement>(null);
  const answerFileInputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    { id: "web", name: "Lập trình web" },
    { id: "network", name: "Mạng máy tính" },
    { id: "database", name: "Cơ sở dữ liệu" },
  ];

  const examTypes = [
    { id: "midterm", name: "Giữa kỳ" },
    { id: "final", name: "Cuối kỳ" },
    { id: "quiz", name: "15 phút" },
  ];

  const handleInputChange = (field: keyof UploadExamFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleExamFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, examFile: file }));
    if (errors.examFile) {
      setErrors((prev) => ({ ...prev, examFile: undefined }));
    }
  };

  const handleAnswerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, answerFile: file }));
    if (errors.answerFile) {
      setErrors((prev) => ({ ...prev, answerFile: undefined }));
    }
  };

  const handleExamFileClick = () => {
    examFileInputRef.current?.click();
  };

  const handleAnswerFileClick = () => {
    answerFileInputRef.current?.click();
  };

  const handleExamFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, examFile: file }));
      if (errors.examFile) {
        setErrors((prev) => ({ ...prev, examFile: undefined }));
      }
    }
  };

  const handleAnswerFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, answerFile: file }));
      if (errors.answerFile) {
        setErrors((prev) => ({ ...prev, answerFile: undefined }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UploadExamFormData, string>> = {};

    if (!formData.subject) {
      newErrors.subject = "Vui lòng chọn môn học";
    }
    if (!formData.examType) {
      newErrors.examType = "Vui lòng chọn loại đề thi";
    }
    if (!formData.examFile) {
      newErrors.examFile = "Vui lòng chọn file đề thi";
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
      subject: "",
      examType: "",
      duration: 3,
      description: "",
      examFile: null,
      answerFile: null,
    });
    setErrors({});
    if (examFileInputRef.current) {
      examFileInputRef.current.value = "";
    }
    if (answerFileInputRef.current) {
      answerFileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Tải lên đề thi
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Tải lên đề thi hoặc kiểm tra cho môn học
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Môn học */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              Môn học
              <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.subject}
              onValueChange={(value) => handleInputChange("subject", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && (
              <p className="text-sm text-red-500">{errors.subject}</p>
            )}
          </div>

          {/* Loại đề thi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              Loại đề thi
              <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.examType}
              onValueChange={(value) => handleInputChange("examType", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.examType && (
              <p className="text-sm text-red-500">{errors.examType}</p>
            )}
          </div>

          {/* Thời lượng */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Thời lượng
            </label>
            <Input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
              className="border-gray-300"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Mô tả
            </label>
            <textarea
              placeholder="Mô tả đề thi..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              rows={3}
            />
          </div>

          {/* Tải lên đề thi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Tải lên đề thi
            </label>
            <input
              ref={examFileInputRef}
              type="file"
              onChange={handleExamFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            <div
              onClick={handleExamFileClick}
              onDrop={handleExamFileDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to Upload
                  </p>
                  {formData.examFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.examFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {errors.examFile && (
              <p className="text-sm text-red-500">{errors.examFile}</p>
            )}
          </div>

          {/* Tải lên đáp án */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Tải lên đáp án
            </label>
            <input
              ref={answerFileInputRef}
              type="file"
              onChange={handleAnswerFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            <div
              onClick={handleAnswerFileClick}
              onDrop={handleAnswerFileDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to Upload
                  </p>
                  {formData.answerFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.answerFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
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

