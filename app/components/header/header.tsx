"use client"

import { Menu } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import { NotificationPopup } from "@/app/components/notification/header-popup/content/NotificationContent"
import { LanguageSwitcher } from "@/app/components/header/language-switcher"
import { useAuthStore } from "@/lib/store/authStore"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"

interface HeaderProps {
  onMobileMenuToggle: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const user = useAuthStore((state) => state.user)
  const router = useRouter()
  const t = useTranslations('common.roles')

  const displayName = user?.name || user?.email || "Name"

  const roleValue = (user?.role || "").toLowerCase()
  const isInstructor = roleValue.includes("instructor") || roleValue.includes("teacher") || roleValue === "giang_vien"
  const isStudent = roleValue.includes("student") || roleValue === "sinh_vien"
  const isAdmin = !isInstructor && !isStudent

  const roleLabel = (() => {
    if (isInstructor) return t('instructor')
    if (isStudent) return t('student')
    return t('admin')
  })()

  const initials = (() => {
    const src = displayName.trim()
    const parts = src.split(" ").filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return src.slice(0, 2).toUpperCase()
  })()

  const handleProfileClick = () => {
    if (isInstructor) {
      router.push("/instructor/profile")
      return
    }

    if (isStudent) {
      router.push("/student/profile")
    }
  }

  const shouldShowNotification = !isAdmin

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--header-border)] bg-[var(--header)] px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={onMobileMenuToggle} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 lg:flex-none" />

      <div className="flex items-center gap-2 lg:gap-4">
        <LanguageSwitcher />

        {shouldShowNotification && <NotificationPopup />}

        <button 
          className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0"
          onClick={handleProfileClick}
          type="button"
        >
          <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs lg:text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col min-w-0 max-w-[150px]">
            <span className="text-sm font-medium truncate" title={displayName}>{displayName}</span>
            <span className="text-xs text-gray-500 truncate" title={roleLabel}>{roleLabel}</span>
          </div>
        </button>
      </div>
    </header>
  )
}
