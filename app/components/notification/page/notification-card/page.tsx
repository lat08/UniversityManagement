import { Badge } from "@/app/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/app/components/ui/card"
import { Clock } from "lucide-react"
import { notificationTypeConfig, NotificationCardProps} from "@/public/data/notifications"


export function NotificationCard({ notification }: NotificationCardProps) {
  const typeConfig = notificationTypeConfig[notification.type]

  return (
    <Card className={`${!notification.isRead ? "border-l-4 border-l-blue-500" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-2xl leading-tight mb-1">{notification.title}</h3>
            <div className="flex items-center gap-1 text-sm text-foreground">
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
          <span className="text-foreground">{notification.content}</span>
        </div>
        <div>
          <span className="font-semibold">Ngày:</span>{" "}
          <span className="text-foreground">{notification.date}</span>
        </div>
        {notification.time && (
          <div>
            <span className="font-semibold">Thời gian:</span>{" "}
            <span className="text-foreground">{notification.time}</span>
          </div>
        )}
        {notification.location && (
          <div>
            <span className="font-semibold">Địa điểm:</span>{" "}
            <span className="text-foreground">{notification.location}</span>
          </div>
        )}
        <hr></hr> 
        <div className="pt-2">
          <span className="font-semibold text-red-600">Lưu ý:</span>{" "}
          <span className="text-foreground">{notification.note}</span>
        </div>
      </CardContent>
    </Card>
  )
}
