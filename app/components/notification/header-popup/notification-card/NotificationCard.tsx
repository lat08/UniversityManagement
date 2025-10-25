
import { mockNotifications } from "@/app/(page)/student/notification/libs/constants/notificationConstants";

export function NotificationCard() {
    return(
        <div className="space-y-3 max-h-[240px] overflow-y-auto">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg p-3 ${notification.isRead ? "bg-white border border-black-300" : "bg-blue-50 border border-blue-200"}`}
              >
                <div className="flex items-start gap-2">
                  {!notification.isRead && <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1 truncate line-clamp-1">{notification.title}</p>
                    <p className="text-sm text-gray-600 mb-2 truncate line-clamp-1">{notification.content}</p>
                    <p className="text-xs text-gray-400">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
    )  
}