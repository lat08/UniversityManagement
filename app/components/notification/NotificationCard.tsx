"use client"

import { Card } from "@/app/components/ui/card"
import { Calendar, AlertTriangle, ChevronDown, DollarSign, CalendarDays } from "lucide-react"
import { useState, useEffect } from "react"
import { formatDate } from "@/lib/utils/format"
import { NotificationApiItem } from "@/lib/types/notification"

export interface NotificationCardProps {
  readonly notification: NotificationApiItem
  readonly onNotificationClick?: (id: string) => void
  readonly initialExpanded?: boolean
  readonly animationDelay?: number
}

const iconMap = {
  event: Calendar,
  tuition: DollarSign,
  schedule: CalendarDays,
  important: AlertTriangle,
}

const notificationTypeConfig = {
  event: {
    iconBg: "bg-[var(--notification-event-bg)]",
    iconColor: "text-[var(--notification-event-icon)]",
    iconBorder: "border-2 border-[var(--notification-event-border)]",
  },
  tuition: {
    iconBg: "bg-[var(--notification-tuition-bg)]",
    iconColor: "text-[var(--notification-tuition-icon)]",
    iconBorder: "border-2 border-[var(--notification-tuition-border)]",
  },
  schedule: {
    iconBg: "bg-[var(--notification-schedule-bg)]",
    iconColor: "text-[var(--notification-schedule-icon)]",
    iconBorder: "border-2 border-[var(--notification-schedule-border)]",
  },
  important: {
    iconBg: "bg-[var(--notification-important-bg)]",
    iconColor: "text-[var(--notification-important-icon)]",
    iconBorder: "border-2 border-[var(--notification-important-border)]",
  },
}

export function NotificationCard({ notification, onNotificationClick, initialExpanded = false, animationDelay = 0 }: NotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const typeConfig = notificationTypeConfig[notification.notificationType]
  const Icon = iconMap[notification.notificationType]

  useEffect(() => {
    if (initialExpanded) {
      setIsExpanded(true)
      if (onNotificationClick) {
        onNotificationClick(notification.scheduleId)
      }
    }
  }, [initialExpanded, notification.scheduleId, onNotificationClick])

  const handleClick = () => {
    if (!isExpanded && onNotificationClick) {
      onNotificationClick(notification.scheduleId)
    }
    setIsExpanded(!isExpanded)
  }

  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01] animate-fade-up ${
        notification.isRead ? "" : "border-2 shadow-sm"
      }`}
      style={{
        backgroundColor: notification.isRead 
          ? 'var(--notification-card-read-bg)' 
          : 'var(--notification-card-unread-bg)',
        borderColor: notification.isRead 
          ? 'var(--border)' 
          : 'var(--notification-card-unread-border)',
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both'
      }}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className={`flex-shrink-0 w-14 h-14 rounded-lg ${typeConfig.iconBg} ${typeConfig.iconBorder} flex items-center justify-center`}>
            <Icon className={`h-7 w-7 ${typeConfig.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-base text-[var(--text-primary)] ${notification.isRead === false ? 'font-bold' : ''}`}>
                {notification.title}
              </h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {notification.timeAgo} · {formatDate(notification.createdAt)}
            </p>
          </div>

          <ChevronDown 
            className={`h-5 w-5 text-[var(--text-muted)] flex-shrink-0 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] text-sm">
            <div>
              <span className="font-semibold text-[var(--text-primary)]">Nội dung: </span>
              <span className="text-[var(--text-secondary)] whitespace-pre-wrap">{notification.content ?? ""}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

