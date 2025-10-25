"use client"

import { BellOff } from "lucide-react"
import { useState } from "react"
import { NotificationCard } from "../notification-card/notificationCard"
import { mockNotifications } from "../../libs/constants/notificationConstants"
import { NotificationType } from "../../libs/type/notificationType"

export function NotificationsContent() {
  const [activeFilter, setActiveFilter] = useState<NotificationType>("all")

  const filterCounts = {
    all: mockNotifications.length,
    important: mockNotifications.filter((n) => n.type === "important").length,
    exam: mockNotifications.filter((n) => n.type === "exam").length,
    event: mockNotifications.filter((n) => n.type === "event").length,
    general: mockNotifications.filter((n) => n.type === "general").length,
  }

  const filteredNotifications =
    activeFilter === "all"
      ? mockNotifications
      : mockNotifications.filter((n) => n.type === activeFilter)

  const filters: { key: NotificationType; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "important", label: "Quan trọng" },
    { key: "exam", label: "Kỳ thi" },
    { key: "event", label: "Sự kiện" },
    { key: "general", label: "Thông tin chung" },
  ]

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="overflow-hidden">
        <div className="flex w-full border border-[var(--border)] rounded-lg bg-[var(--muted)] relative">
          {/* Active tab background slider */}
          <div 
            className="absolute top-0 bottom-0 bg-[var(--primary)] rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
            style={{
              width: `${100 / filters.length}%`,
              left: `${filters.findIndex(f => f.key === activeFilter) * (100 / filters.length)}%`,
              transform: 'translateX(0)'
            }}
          />
          
          {filters.map((filter, index) => {
            const isActive = activeFilter === filter.key

            return (
              <div key={filter.key} className="flex-1 relative z-10">
                <button
                  onClick={() => setActiveFilter(filter.key)}
                  className={`w-full cursor-pointer px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 relative ${
                    isActive
                      ? "text-[var(--primary-foreground)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="relative z-100">{filter.label}</span>
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold transition-transform duration-300 ${
                    isActive 
                      ? "bg-[var(--background)] text-[var(--primary)] scale-110" 
                      : "bg-[var(--background)] text-[var(--text-secondary)] hover:scale-105"
                  }`}>
                    {filterCounts[filter.key]}
                  </span>
                </button>
                
                {/* Divider - chỉ hiển thị khi tab không được chọn và không phải tab cuối */}
                {!isActive && index < filters.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-[var(--border)] transition-opacity duration-300"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellOff className="h-16 w-16 text-[var(--muted-foreground)] mb-4" />
          <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">Không có thông báo</p>
          <p className="text-sm text-[var(--text-muted)]">
            {activeFilter === "all" ? "Bạn chưa có thông báo nào" : "Không có thông báo trong danh mục này"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  )
}
