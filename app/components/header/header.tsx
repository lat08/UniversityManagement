"use client"

import { Bell, Menu } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"

interface HeaderProps {
  onMobileMenuToggle: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-300 bg-white px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={onMobileMenuToggle} className="lg:hidden">
        <Menu className="h-5 w-5 text-gray-700" />
      </Button>

      <div className="flex-1 lg:flex-none" />

      <div className="flex items-center gap-2 lg:gap-4">
        <Button variant="ghost" size="icon" className="relative border border-gray-300 hover:bg-gray-100 cursor-pointer">
          <Bell className="h-5 w-5 text-gray-700" />
        </Button>

        <div className="flex items-center gap-2 lg:gap-3">
          <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs lg:text-sm">N</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Name</span>
            <span className="text-xs text-gray-500">Sinh viên</span>
          </div>
        </div>
      </div>
    </header>
  )
}
