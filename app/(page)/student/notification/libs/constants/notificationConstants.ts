import { NotificationData, NotificationType } from "../type/notificationType"

export interface NotificationCardProps {
  notification: NotificationData
}


// config for notification types
export const notificationTypeConfig = {
  all: {
    key: "all" as NotificationType,
    label: "Tất cả",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    iconBorder: "border-2 border-blue-300",
  },
  exam: {
    key: "exam" as NotificationType,    
    label: "Kỳ thi",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    iconBorder: "border-2 border-blue-300",
  },
  event: {
    key: "event" as NotificationType,
    label: "Sự kiện",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    iconBorder: "border-2 border-purple-300",
  },
  important: {
    key: "important" as NotificationType,
    label: "Quan trọng",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    iconBorder: "border-2 border-red-300",
  },
  general: {
    key: "general" as NotificationType,
    label: "Thông tin chung",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    iconBorder: "border-2 border-gray-300",
  },
}




//notification data
export const mockNotifications: NotificationData[] = [
  {
    id: "1",
    title: "Thông báo lịch thi cuối kỳ môn Lập trình Web",
    timeAgo: "2 giờ trước",
    type: "exam",
    content: "Kỳ thi cuối kỳ môn Lập trình Web sẽ được tổ chức theo lịch đã thông báo.",
    date: "15/01/2025",
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
      "Khoa Công nghệ Thông tin tổ chức hội thảo về AI và Machine Learning với sự tham gia của các chuyên gia hàng đầu.",
    date: "15/01/2025",
    time: "09:00 - 11:00",
    location: "Hội trường A - Cơ sở A",
    note: "Đăng ký tham gia qua email khoa trước ngày 18/01.",
    isRead: false,
  },
  {
    id: "3",
    title: "Cảnh báo: Sắp hết hạn nộp học phí",
    timeAgo: "8 giờ trước",
    type: "important",
    content: "Hạn chót nộp học phí cho kỳ 2 sắp đến hạn.",
    date: "15/01/2025",
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
    date: "13/01/2025",
    note: "Sinh viên đăng nhập hệ thống để đăng ký các môn học.",
    isRead: true,
  },
]
