import { NotificationApiItem } from "@/lib/types/notification"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/authStore"

interface NotificationCardProps {
  notifications: NotificationApiItem[]
  onClose?: () => void
}

export function NotificationCard({ notifications, onClose }: NotificationCardProps) {
  const router = useRouter()
  const { user } = useAuthStore()

  const handleNotificationClick = (notification: NotificationApiItem) => {
    let basePath = "/student/notification"
    
    if (user?.role === "Instructor") {
      basePath = "/instructor/notification"
    } else if (user?.role?.startsWith("Admin_")) {
      basePath = "/admin/notification"
    }

    router.push(`${basePath}?type=${notification.notificationType}&id=${notification.scheduleId}`)
    onClose?.()
  }

  return (
    <div className="space-y-2.5">
      {notifications.map((notification) => (
        <div
          key={notification.scheduleId}
          onClick={() => handleNotificationClick(notification)}
          className={`rounded-lg p-3.5 transition-all hover:shadow-sm cursor-pointer ${
            notification.isRead 
              ? "bg-white border border-gray-200 hover:border-gray-300" 
              : "bg-blue-50 border border-blue-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-start gap-3">
            {!notification.isRead && (
              <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm mb-1.5 line-clamp-2 ${
                notification.isRead ? "font-medium text-gray-800" : "font-semibold text-gray-900"
              }`}>
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {notification.content}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{notification.timeAgo}</p>
                {!notification.isRead && (
                  <span className="text-xs font-medium text-blue-600">Chưa đọc</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}