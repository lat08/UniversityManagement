import React, { useRef } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'

interface ProfileAvatarProps {
  profilePicture?: string
  fullName: string
  role: string
  editable?: boolean
  onAvatarChange?: (file: File) => void
  loading?: boolean
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  profilePicture,
  fullName,
  role,
  editable = false,
  onAvatarChange,
  loading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onAvatarChange) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB')
        return
      }
      
      onAvatarChange(file)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative cursor-pointer" onClick={handleAvatarClick}>
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center overflow-hidden shadow-md">
          {profilePicture ? (
            <Image 
              src={profilePicture} 
              alt={fullName}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-cyan-700" strokeWidth={1.5} />
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
}

