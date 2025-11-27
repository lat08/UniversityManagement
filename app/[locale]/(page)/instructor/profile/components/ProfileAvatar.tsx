import { memo, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'

interface ProfileAvatarProps {
  profilePicture?: string
  fullName: string
  role: string
}

export const ProfileAvatar = memo<ProfileAvatarProps>(({
  profilePicture,
  fullName,
  role
}) => {
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

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center overflow-hidden shadow-md">
          <Avatar className="w-32 h-32">
            <AvatarImage src={profilePicture || ''} alt={fullName} />
            <AvatarFallback className="bg-cyan-100 text-cyan-700 text-2xl font-semibold">
              {initials || 'GV'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">{fullName}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{role}</p>
      </div>
    </div>
  )
})
ProfileAvatar.displayName = 'ProfileAvatar'

