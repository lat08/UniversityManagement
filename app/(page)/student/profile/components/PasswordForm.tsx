import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { useAuthStore } from '@/lib/store/authStore'
import type { ChangePasswordRequest } from '../lib/types/types'

interface PasswordFormProps {
  onSubmit: (data: ChangePasswordRequest) => Promise<{ success: boolean; message: string }>
  disabled: boolean
}

const PasswordFormComponent = ({ onSubmit, disabled }: PasswordFormProps) => {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordInputChange = (field: keyof ChangePasswordRequest, value: string): void => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
    setPasswordError(null)
    setPasswordSuccess(null)
  }

  const handleSavePassword = async (): Promise<void> => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }

    try {
      setIsChangingPassword(true)
      setPasswordError(null)
      setPasswordSuccess(null)

      const result = await onSubmit(passwordData)

      if (result.success) {
        setPasswordSuccess(result.message)
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
          }
          logout()
          router.push('/login')
        }, 2000)
      } else {
        setPasswordError(result.message)
      }
    } catch {
      setPasswordError('Đã xảy ra lỗi khi đổi mật khẩu')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const isDisabled = isChangingPassword || disabled

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="mb-2">
        <h2 className="text-base font-bold">Đặt lại mật khẩu</h2>
      </div>
      {passwordError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{passwordError}</p>
        </div>
      )}

      {passwordSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{passwordSuccess}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
          <div className="relative">
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.oldPassword}
              onChange={(e) => handlePasswordInputChange('oldPassword', e.target.value)}
              placeholder="••••••••••"
              className="pr-10"
              disabled={isDisabled}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isDisabled}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
              placeholder="••••••••••"
              className="pr-10"
              disabled={isDisabled}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isDisabled}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nhập lại mật khẩu mới</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
              placeholder="••••••••••"
              className="pr-10"
              disabled={isDisabled}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isDisabled}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSavePassword}
          disabled={isDisabled}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDisabled ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </Button>
      </div>
    </div>
  )
}

export const PasswordForm = memo(PasswordFormComponent)

