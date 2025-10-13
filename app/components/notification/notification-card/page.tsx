import { Badge } from "@/app/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/app/components/ui/card"
import { Clock } from "lucide-react"

export type NotificationType = "exam" | "event" | "important" | "general"

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

const notificationTypeConfig = {
  exam: {
    label: "Kỳ thi",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  event: {
    label: "Sự kiện",
    variant: "secondary" as const,
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  },
  important: {
    label: "Quan trọng",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  general: {
    label: "Thông tin chung",
    variant: "outline" as const,
    className: "bg-teal-100 text-teal-700 hover:bg-teal-200",
  },
}

interface NotificationCardProps {
  notification: NotificationData
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const typeConfig = notificationTypeConfig[notification.type]

  return (
    <Card className={`${!notification.isRead ? "border-l-4 border-l-blue-500" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-2xl leading-tight mb-1">{notification.title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{notification.timeAgo}</span>
              {!notification.isRead && <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" />}
            </div>
          </div>
          <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <hr></hr>
        <div>
          <span className="font-semibold">Nội dung:</span>{" "}
          <span className="text-muted-foreground">{notification.content}</span>
        </div>
        <div>
          <span className="font-semibold">Ngày:</span>{" "}
          <span className="text-muted-foreground">{notification.date}</span>
        </div>
        {notification.time && (
          <div>
            <span className="font-semibold">Thời gian:</span>{" "}
            <span className="text-muted-foreground">{notification.time}</span>
          </div>
        )}
        {notification.location && (
          <div>
            <span className="font-semibold">Địa điểm:</span>{" "}
            <span className="text-muted-foreground">{notification.location}</span>
          </div>
        )}
        <hr></hr> 
        <div className="pt-2">
          <span className="font-semibold text-red-600">Lưu ý:</span>{" "}
          <span className="text-muted-foreground">{notification.note}</span>
        </div>
      </CardContent>
    </Card>
  )
}
