"use client"

import { Card } from "@/app/components/ui/card"
import { Calendar, AlertTriangle, Info, ChevronDown, DollarSign, CalendarDays } from "lucide-react"
import { notificationTypeConfig, NotificationCardProps} from "../../libs/constants/notificationConstants"
import { useState, useEffect } from "react"

const iconMap = {
  event: Calendar,
  tuition: DollarSign,
  schedule: CalendarDays,
  important: AlertTriangle,
}

interface NotificationCardPropsExtended extends NotificationCardProps {
  initialExpanded?: boolean
}

export function NotificationCard({ notification, onNotificationClick, initialExpanded = false }: NotificationCardPropsExtended) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const typeConfig = notificationTypeConfig[notification.notificationType]
  const Icon = iconMap[notification.notificationType]

  // Update expanded state when initialExpanded changes
  useEffect(() => {
    if (initialExpanded) {
      setIsExpanded(true)
      // Mark as read when auto-expanded
      if (onNotificationClick) {
        onNotificationClick(notification.scheduleId)
      }
    }
  }, [initialExpanded, notification.scheduleId, onNotificationClick])

  const handleClick = () => {
    if (!isExpanded && onNotificationClick) {
      // Call API to mark as read when expanding
      onNotificationClick(notification.scheduleId)
    }
    setIsExpanded(!isExpanded)
  }

  // Format date from ISO string
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  return (
    <Card 
      className={`border-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
        !notification.isRead ? "bg-[var(--primary-light)]" : "bg-[var(--card-bg)]"
      }`}
      style={{
        borderColor: 'var(--primary)'
      }}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-14 h-14 rounded-lg ${typeConfig.iconBg} ${typeConfig.iconBorder} flex items-center justify-center`}>
            <Icon className={`h-7 w-7 ${typeConfig.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-base text-gray-900 ${!notification.isRead ? 'font-bold' : ''}`}>
                {notification.title}
              </h3>
              {!notification.isRead && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Mới
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {notification.timeAgo} · {formatDate(notification.createdAt)}
            </p>
          </div>

          {/* Dropdown Arrow */}
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Nội dung: </span>
              <span className="text-gray-600 whitespace-pre-wrap">{notification.content}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
