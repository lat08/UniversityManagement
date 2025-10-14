"use client"

import { Menu } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import { NotificationPopup } from "@/app/components/notification/header-popup/content/page"

interface HeaderProps {
  onMobileMenuToggle: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={onMobileMenuToggle} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 lg:flex-none" />

      <div className="flex items-center gap-2 lg:gap-4">
        <NotificationPopup />

        <div className="flex items-center gap-2 lg:gap-3">
          <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs lg:text-sm">N</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium">Name</span>
            <span className="text-xs text-gray-500">Sinh viên</span>
          </div>
        </div>
      </div>
    </header>
  )
}
