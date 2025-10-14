"use client"

import { useState } from "react"
import { Badge } from "@/app/components/ui/badge"
import { NotificationCard, type NotificationData } from "../notification-card/page"

const mockNotifications: NotificationData[] = [
  {
    id: "1",
    title: "Thông báo thi cuối kỳ môn Lập trình Web",
    timeAgo: "2 giờ trước",
    type: "exam",
    content: "Kỳ thi cuối kỳ môn Lập trình Web sẽ được tổ chức theo lịch đã thông báo.",
    date: "15/06/2025",
    time: "14:00 - 16:30",
    location: "Phòng B205 - Cơ sở B",
    note: "Sinh viên cần mang theo thẻ sinh viên và giấy tờ tùy thân.",
    isRead: false,
  },
  {
    id: "2",
    title: "Hội thảo Công nghệ AI và Machine Learning",
    timeAgo: "6 giờ trước",
    type: "event",
    content:
      "Khoa CNTT tổ chức hội thảo về AI và Machine Learning với sự tham gia của các chuyên gia hàng đầu.",
    date: "20/06/2025",
    time: "09:00 - 11:00",
    location: "Hội trường A - Cơ sở A",
    note: "Đăng ký tham gia qua email khoa trước ngày 18/06.",
    isRead: false,
  },
  {
    id: "3",
    title: "Cảnh báo: Sắp hết hạn nộp học phí",
    timeAgo: "2 ngày trước",
    type: "important",
    content: "Hạn chót nộp học phí cho kỳ 2 sắp đến hạn.",
    date: "30/06/2025",
    location: "Phòng Tài chính - Cơ sở A (Tầng 2)",
    note: "Sinh viên chưa hoàn tất vui lòng nộp trước hạn.",
    isRead: false,
  },
  {
    id: "4",
    title: "Đăng ký học phần học kỳ mới",
    timeAgo: "2 ngày trước",
    type: "general",
    content: "Thời gian đăng ký học phần học kỳ 2 năm 2024-2025 đã được mở.",
    date: "01/06 - 15/06/2025",
    note: "Sinh viên đăng nhập hệ thống để đăng ký các môn học.",
    isRead: true,
  },
]

type FilterType = "all" | "important" | "exam" | "event" | "general"

export default function NotificationsContent() {

const notificationTypeConfig = {
  all: {
    label: "Tất cả",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-black-300",
  },
  exam: {
    label: "Kỳ thi",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-400",
  },
  event: {
    label: "Sự kiện",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-400",
  },
  important: {
    label: "Quan trọng",
    className: "bg-red-100 text-red-700 hover:bg-red-200 border border-red-400",
  },
  general: {
    label: "Thông tin chung",
    className: "bg-teal-100 text-teal-700 hover:bg-teal-200 border border-teal-300",
  },
}

export function NotificationsContent() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

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

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "important", label: "Quan trọng" },
    { key: "exam", label: "Kỳ thi" },
    { key: "event", label: "Sự kiện" },
    { key: "general", label: "Thông tin chung" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Thông báo</h1>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 ">
          {filters.map((filter) => {
            const typeConfig = notificationTypeConfig[filter.key as keyof typeof notificationTypeConfig]
            const isActive = activeFilter === filter.key

            // các nút còn lại theo màu riêng
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`border-blue-400 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? typeConfig.className.replace("hover:", "") + " font-semibold"
                    : typeConfig.className
                }`}
              >
                {filter.label}
                <Badge
                  variant="secondary"
                  className={`${
                    isActive
                      ? "bg-white text-current font-semibold"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {filterCounts[filter.key]}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )
}
