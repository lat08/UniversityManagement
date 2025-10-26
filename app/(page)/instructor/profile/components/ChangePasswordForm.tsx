import React, { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface ChangePasswordFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<boolean>
  loading?: boolean
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [allPasswordErrors, setAllPasswordErrors] = useState<string[]>([])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Mật khẩu mới phải có ít nhất 8 ký tự')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 chữ hoa')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 số')
    }
    
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)')
    }
    
    return errors
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại'
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
    } else {
      const passwordErrors = validatePassword(formData.newPassword)
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors[0]
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu mới không khớp'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const success = await onSubmit(formData)
    if (success) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
      setAllPasswordErrors([])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Real-time password validation
    if (field === 'newPassword' && value) {
      const passwordErrors = validatePassword(value)
      setAllPasswordErrors(passwordErrors)
    } else if (field === 'newPassword' && !value) {
      setAllPasswordErrors([])
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="mb-6">
          <h2 className="text-base font-medium mb-2">Đặt lại mật khẩu</h2>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPasswords.currentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="**********"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('currentPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPasswords.currentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="**********"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('newPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPasswords.newPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600">{errors.newPassword}</p>
            )}
            {allPasswordErrors.length > 0 && formData.newPassword && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs font-medium text-yellow-900 mb-2">Yêu cầu mật khẩu:</p>
                <ul className="space-y-1 text-xs text-yellow-800">
                  {allPasswordErrors.map((error, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-yellow-600" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {allPasswordErrors.length === 0 && formData.newPassword && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700">✓ Mật khẩu hợp lệ</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nhập lại mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="**********"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={!loading ? { cursor: 'pointer' } : {}}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </button>
      </div>
    </form>
  )
}
