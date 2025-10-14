// data structure for notifications
export type NotificationType = "all" | "exam" | "event" | "important" | "general"

export interface NotificationData {
  id: string
  title: string
  timeAgo: string
  type: NotificationType
  content: string
  date: string
  time?: string
  location?: string
  note: string
  isRead?: boolean
}

export interface NotificationCardProps {
  notification: NotificationData
}


// config for notification types
export const notificationTypeConfig = {
  all: {
    key: "all" as NotificationType,
    label: "Tất cả",
    
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-black-300",
  },
  exam: {
    key: "exam" as NotificationType,    
    label: "Kỳ thi",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-400",
  },
  event: {
    key: "event" as NotificationType,
    label: "Sự kiện",
    variant: "secondary" as const,
    className: "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-400",
  },
  important: {
    key: "important" as NotificationType,
    label: "Quan trọng",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-700 hover:bg-red-200 border border-red-400",
  },
  general: {
    key: "general" as NotificationType,
    label: "Thông tin chung",
    variant: "outline" as const,
    className: "bg-teal-100 text-teal-700 hover:bg-teal-200 border border-teal-300",
  },
}




//notification data
export const mockNotifications: NotificationData[] = [
  {
    id: "1",
    title: "Thông báo tích thi cuối kỳ môn Lập trình Web",
    timeAgo: "2 giờ trước",
    type: "exam" as NotificationType,
    content: "Kỳ thi cuối kỳ môn Lập trình Web năm cao sẽ được tổ chức theo lịch đã thông báo.",
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
    type: "event" as NotificationType,
    content:
      "Khoa Công nghệ Thông tin tổ chức hội thảo về AI và Machine Learning với sự tham gia của các chuyên gia hàng đầu.",
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
    type: "important" as NotificationType,
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
    type: "general" as NotificationType,
    content: "Thời gian đăng ký học phần học kỳ 2 năm 2024-2025 đã được mở.",
    date: "01/06 - 15/06/2025",
    note: "Sinh viên đăng nhập hệ thống để đăng ký các môn học.",
    isRead: true,
  },
]
