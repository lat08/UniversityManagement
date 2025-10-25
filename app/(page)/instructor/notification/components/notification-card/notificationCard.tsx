"use client"

import { Card } from "@/app/components/ui/card"
import { GraduationCap, Calendar, AlertTriangle, Info, ChevronDown } from "lucide-react"
import { notificationTypeConfig, NotificationCardProps} from "../../libs/constants/notificationConstants"
import { useState } from "react"

const iconMap = {
  exam: GraduationCap,
  event: Calendar,
  important: AlertTriangle,
  general: Info,
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const typeConfig = notificationTypeConfig[notification.type]
  const Icon = iconMap[notification.type]

  return (
    <Card 
      className={`border-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
        !notification.isRead ? "bg-[var(--primary-light)]" : "bg-[var(--card-bg)]"
      }`}
      style={{
        borderColor: 'var(--primary)'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-14 h-14 rounded-lg ${typeConfig.iconBg} ${typeConfig.iconBorder} flex items-center justify-center`}>
            <Icon className={`h-7 w-7 ${typeConfig.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 mb-1">
              {notification.title}
            </h3>
            <p className="text-sm text-gray-600">
              {notification.timeAgo} · {notification.date}
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
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Nội dung: </span>
              <span className="text-gray-600">{notification.content}</span>
            </div>
            {notification.time && (
              <div>
                <span className="font-semibold text-gray-700">Thời gian: </span>
                <span className="text-gray-600">{notification.time}</span>
              </div>
            )}
            {notification.location && (
              <div>
                <span className="font-semibold text-gray-700">Địa điểm: </span>
                <span className="text-gray-600">{notification.location}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-[var(--error)]">Lưu ý: </span>
              <span className="text-gray-600">{notification.note}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
