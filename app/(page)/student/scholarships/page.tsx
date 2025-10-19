"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, ChevronDown, X } from "lucide-react"
import { FormData, FormErrors } from "./lib/types/types"
import { validateField, validateForm } from "./lib/utils/validation"
import { GENDER_OPTIONS, MAJOR_OPTIONS, ACADEMIC_YEAR_OPTIONS, CLASS_OPTIONS, INITIAL_FORM_DATA } from "./lib/constants/formOptions"

export default function ScholarshipsPage() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)

  const [errors, setErrors] = useState<FormErrors>({})
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      const isValid = validateField(field, value)
      setErrors((prev) => ({ ...prev, [field]: !isValid }))
    }
  }


  const handleBlur = (field: keyof FormData) => {
    const isValid = validateField(field, formData[field])
    setErrors((prev) => ({ ...prev, [field]: !isValid }))
  }

  const handleValidateForm = () => {
    const newErrors = validateForm(formData)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (handleValidateForm()) {
      console.log("Form submitted:", formData, uploadedFiles)
      // Add your submission logic here
    }
  }

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA)
    setUploadedFiles([])
    setErrors({})
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Giấy xét duyệt yêu cầu</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
        <h2 className="text-sm font-medium text-gray-700 pb-4 border-b border-gray-200 mb-6">
          Thông tin sinh viên
        </h2>

        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Họ và tên</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                onBlur={() => handleBlur("fullName")}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Mã số sinh viên</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                onBlur={() => handleBlur("studentId")}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.studentId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập mã số sinh viên"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Giới tính</label>
              <div className="relative">
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  onBlur={() => handleBlur("gender")}
                  className={`w-full px-3 py-2 border rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  } ${formData.gender ? "text-gray-900" : "text-gray-400"}`}
                >
                  <option value="">Chọn giới tính</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Ngày sinh</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                onBlur={() => handleBlur("dateOfBirth")}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập địa chỉ email"
              />
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Ngành</label>
              <div className="relative">
                <select
                  value={formData.major}
                  onChange={(e) => handleInputChange("major", e.target.value)}
                  onBlur={() => handleBlur("major")}
                  className={`w-full px-3 py-2 border rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.major ? "border-red-500" : "border-gray-300"
                  } ${formData.major ? "text-gray-900" : "text-gray-400"}`}
                >
                  <option value="">Chọn ngành học</option>
                  {MAJOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">CMND / CCCD</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleInputChange("idNumber", e.target.value)}
                onBlur={() => handleBlur("idNumber")}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.idNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập CMND / CCCD"
              />
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Chuyên ngành</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => handleInputChange("specialization", e.target.value)}
                onBlur={() => handleBlur("specialization")}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.specialization ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập chuyên ngành"
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Hộ khẩu</label>
              <input
                type="text"
                value={formData.residence}
                onChange={(e) => handleInputChange("residence", e.target.value)}
                onBlur={() => handleBlur("residence")}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.residence ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập địa chỉ thường trú"
              />
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Niên khóa</label>
              <div className="relative">
                <select
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange("academicYear", e.target.value)}
                  onBlur={() => handleBlur("academicYear")}
                  className={`w-full px-3 py-2 border rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.academicYear ? "border-red-500" : "border-gray-300"
                  } ${formData.academicYear ? "text-gray-900" : "text-gray-400"}`}
                >
                  <option value="">Chọn niên khóa</option>
                  {ACADEMIC_YEAR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 6 - Lớp field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">Lớp</label>
              <div className="relative">
                <select
                  value={formData.class}
                  onChange={(e) => handleInputChange("class", e.target.value)}
                  onBlur={() => handleBlur("class")}
                  className={`w-full px-3 py-2 border rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.class ? "border-red-500" : "border-gray-300"
                  } ${formData.class ? "text-gray-900" : "text-gray-400"}`}
                >
                  <option value="">Chọn lớp</option>
                  {CLASS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-normal text-gray-900 mb-3">
              Tải ảnh học bạ{" "}
              <span className="text-gray-500 font-normal">
                (*vui lòng cung cấp đầy đủ ảnh điểm học kì để đánh giá kiện học bổng*)
              </span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">Kéo thả file vào đây hoặc nhấn để chọn</p>
                  <p className="text-xs text-gray-500">Hỗ trợ file ảnh, PDF, Word</p>
                </div>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-600">
                          {file.name.split(".").pop()?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Nộp đơn xét học bổng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}