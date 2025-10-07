"use client"

import { useState } from "react"
import { Header } from "@/app/components/header/header"
import { DashboardContent } from "@/app/components/dashboard/page"
import { cn } from "@/lib/utils/utils"

export default function DashboardPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          // Mobile: no margin (sidebar is overlay)
          "ml-0",
          // Desktop: margin based on collapsed state
          "lg:ml-16",
        )}
      >
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DashboardContent />
        </main>
      </div>
    </div>
  )
}
