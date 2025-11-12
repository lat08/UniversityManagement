"use client"

import { useState, useRef, useEffect } from "react";
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
import { Dropdown } from "@/app/components/ui";

interface UploadExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UploadExamFormData) => void;
  isSubmitting: boolean;
  courseClasses: { id: string; name: string }[];
  mode?: 'upload' | 'resubmit';
  existingExam?: {
    subjectName: string;
    courseClassCode: string;
    examType: 'midterm' | 'final' | 'quiz' | 'makeup';
    durationMinutes: number;
  };
}

export interface UploadExamFormData {
  courseClassId: string;
  examType: string;
  durationMinutes: number;
  description: string;
  questionFile: File | null;
  answerFile: File | null;
}

export function UploadExamModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  courseClasses,
  mode = 'upload',
  existingExam,
}: UploadExamModalProps) {
  const [formData, setFormData] = useState<UploadExamFormData>({
    courseClassId: "",
    examType: "",
    durationMinutes: 120,
    description: "",
    questionFile: null,
    answerFile: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UploadExamFormData, string>>>({});
  const examFileInputRef = useRef<HTMLInputElement>(null);
  const answerFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleQuestionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, questionFile: file }));
    if (errors.questionFile) {
      setErrors((prev) => ({ ...prev, questionFile: undefined }));
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

  const handleQuestionFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, questionFile: file }));
      if (errors.questionFile) {
        setErrors((prev) => ({ ...prev, questionFile: undefined }));
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

    // Chỉ validate courseClassId và examType khi không phải resubmit mode
    if (!isResubmitMode) {
      if (!formData.courseClassId) {
        newErrors.courseClassId = "Vui lòng chọn lớp học phần";
      }

      if (!formData.examType) {
        newErrors.examType = "Vui lòng chọn loại đề thi";
      }
    }

    if (!formData.questionFile) {
      newErrors.questionFile = "Vui lòng chọn file đề thi";
    }

    if (!formData.answerFile) {
      newErrors.answerFile = "Vui lòng chọn file đáp án";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      courseClassId: "",
      examType: "",
      durationMinutes: 120,
      description: "",
      questionFile: null,
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

  const isResubmitMode = mode === 'resubmit';

  // Auto-fill when in resubmit mode
  useEffect(() => {
    if (isResubmitMode && existingExam && isOpen) {
      // Don't change the form values, just display the info
      // The fields will be disabled anyway
    } else if (!isResubmitMode && isOpen) {
      // Reset form for upload mode
      setFormData({
        courseClassId: "",
        examType: "",
        durationMinutes: 120,
        description: "",
        questionFile: null,
        answerFile: null,
      });
    }
  }, [isResubmitMode, existingExam, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isResubmitMode ? 'Gửi lại đề thi' : 'Tải lên đề thi mới'}
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
            {isResubmitMode && existingExam ? (
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                {existingExam.subjectName} - {existingExam.courseClassCode}
              </div>
            ) : (
              <Dropdown
                options={courseClasses.map(c => ({ value: c.id, label: c.name }))}
                value={formData.courseClassId}
                placeholder={
                  courseClasses.length === 0 
                    ? "Đang tải danh sách lớp học phần..." 
                    : "Chọn lớp học phần"
                }
                onChange={(value) => handleInputChange("courseClassId", value)}
                disabled={courseClasses.length === 0}
              />
            )}
            {errors.courseClassId && (
              <p className="text-sm text-red-500">{errors.courseClassId}</p>
            )}
            {courseClasses.length === 0 && (
              <p className="text-xs text-gray-500">Vui lòng chờ danh sách lớp học phần được tải</p>
            )}
          </div>

          {/* Loại đề thi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
              Loại đề thi
              <span className="text-red-500">*</span>
            </label>
            {isResubmitMode && existingExam ? (
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                {existingExam.examType}
              </div>
            ) : (
              <Dropdown
                options={examTypes.map(t => ({ value: t.id, label: t.name }))}
                value={formData.examType}
                placeholder="Chọn loại"
                onChange={(value) => handleInputChange("examType", value)}
              />
            )}
            {errors.examType && (
              <p className="text-sm text-red-500">{errors.examType}</p>
            )}
          </div>

          {/* Thời lượng */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Thời lượng
            </label>
            {isResubmitMode && existingExam ? (
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                {existingExam.durationMinutes} phút
              </div>
            ) : (
              <Input
                type="number"
                min="1"
                value={formData.durationMinutes}
                onChange={(e) => handleInputChange("durationMinutes", Number.parseInt(e.target.value) || 0)}
                className="border-gray-300"
                placeholder="Thời lượng (phút)"
              />
            )}
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
              onChange={handleQuestionFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            <div
              onClick={handleExamFileClick}
              onDrop={handleQuestionFileDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to Upload
                  </p>
                  {formData.questionFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.questionFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {errors.questionFile && (
              <p className="text-sm text-red-500">{errors.questionFile}</p>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tải lên..." : "Tải lên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

