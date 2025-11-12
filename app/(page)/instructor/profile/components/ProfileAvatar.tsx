import { memo, useMemo, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import toast from 'react-hot-toast'

interface ProfileAvatarProps {
  profilePicture?: string
  fullName: string
  role: string
  editable?: boolean
  onAvatarChange?: (file: File) => void | Promise<void>
  loading?: boolean
}

export const ProfileAvatar = memo<ProfileAvatarProps>(({
  profilePicture,
  fullName,
  role,
  editable = false,
  onAvatarChange,
  loading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initials = useMemo(() => {
    if (!fullName) {
      return ''
    }
    return fullName
      .trim()
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('')
  }, [fullName])

  const handleAvatarClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onAvatarChange) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB')
        return
      }
      
      await onAvatarChange(file)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative cursor-pointer" onClick={handleAvatarClick}>
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center overflow-hidden shadow-md">
          <Avatar className="w-32 h-32">
            <AvatarImage src={profilePicture || ''} alt={fullName} />
            <AvatarFallback className="bg-cyan-100 text-cyan-700 text-2xl font-semibold">
              {initials || 'GV'}
            </AvatarFallback>
          </Avatar>
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">{fullName}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{role}</p>
      </div>
    </div>
  )
})
ProfileAvatar.displayName = 'ProfileAvatar'

