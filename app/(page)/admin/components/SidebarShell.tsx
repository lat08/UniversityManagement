"use client"

import { ReactNode, useEffect, useState, useCallback } from "react"
import { Sidebar } from "@/app/components/ui/sidebar"
import { Header } from "@/app/components/header/header"
import { cn } from "@/lib/utils/utils"

interface SidebarShellProps {
  children: ReactNode
}

export const SidebarShell = ({ children }: SidebarShellProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev)
  }, [])

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-secondary)]" suppressHydrationWarning>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={toggleMobileSidebar}
        variant="admin"
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          "ml-0 lg:ml-20",
          !isSidebarCollapsed && "lg:ml-64",
        )}
      >
        <Header onMobileMenuToggle={toggleMobileSidebar} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}




